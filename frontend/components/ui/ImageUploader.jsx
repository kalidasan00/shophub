'use client'

import { useState, useRef, useMemo, useEffect } from 'react'
import { X, Upload, ImagePlus, Loader2, ChevronLeft, ChevronRight, Pencil } from 'lucide-react'
import { colors, font, radius, transition } from '@/lib/styles'
import ImageEditorModal from './ImageEditorModal'

// ── Fill these in from your Cloudinary dashboard ──
const CLOUDINARY_CLOUD_NAME = 'dwddvakdf'
const CLOUDINARY_UPLOAD_PRESET = 'shophub_unsigned'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE_MB = 8
const MAX_DIMENSION = 1600   // longest edge, px, after compression
const COMPRESSION_QUALITY = 0.8

/**
 * Resizes + re-encodes an image client-side before upload, so a huge phone
 * photo doesn't turn into a slow upload. Returns a compressed Blob.
 * Works on File objects AND Blobs (e.g. output from the image editor).
 */
function compressImage(fileOrBlob) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = (e) => {
      img.onload = () => {
        let { width, height } = img
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width)
            width = MAX_DIMENSION
          } else {
            width = Math.round((width * MAX_DIMENSION) / height)
            height = MAX_DIMENSION
          }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('Compression failed'))),
          'image/jpeg',
          COMPRESSION_QUALITY
        )
      }
      img.onerror = () => reject(new Error('Could not read image'))
      img.src = e.target.result
    }
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsDataURL(fileOrBlob)
  })
}

/** Inserts f_auto,q_auto into a Cloudinary URL so it's served as the best
 *  format (WebP/AVIF) and quality for each visitor's browser automatically. */
function withAutoDelivery(url) {
  if (!url.includes('/upload/')) return url
  return url.replace('/upload/', '/upload/f_auto,q_auto/')
}

function uploadToCloudinary(blob, filename, onProgress) {
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`
  const formData = new FormData()
  formData.append('file', blob, filename)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText)
        resolve(withAutoDelivery(data.secure_url))
      } else {
        reject(new Error('Upload failed. Check your Cloudinary preset name and cloud name.'))
      }
    }
    xhr.onerror = () => reject(new Error('Network error during upload.'))
    xhr.send(formData)
  })
}

function validateFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `${file.name}: unsupported format (use JPG, PNG, or WebP)`
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return `${file.name}: too large (max ${MAX_FILE_SIZE_MB}MB)`
  }
  return null
}

/**
 * <ImageUploader
 *   images={product.images}
 *   onChange={(urls) => setImages(urls)}
 *   maxImages={5}
 *   single   // pass for banner/avatar — onChange gets a string, not an array
 * />
 */
export default function ImageUploader({ images = [], onChange, maxImages = 5, single = false }) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentFile, setCurrentFile] = useState('')
  const [errors, setErrors] = useState([])
  const inputRef = useRef(null)

  // ── Edit-before-upload queue (new photos) ──
  const [editQueue, setEditQueue] = useState([])       // File[] pending edit
  const [editIndex, setEditIndex] = useState(0)
  const [editedBlobs, setEditedBlobs] = useState([])    // parallel array: Blob | null (null = use original)

  // ── Re-edit an already-uploaded thumbnail ──
  const [editingExisting, setEditingExisting] = useState(null) // { index, url } | null

  const currentList = single ? (images ? [images] : []) : images

  /* Core upload pipeline — shared by "new files" and "re-edit existing" flows */
  const runUpload = async (items) => {
    // items: [{ blob, filename }]
    setUploading(true)
    const uploaded = []
    try {
      for (let i = 0; i < items.length; i++) {
        const { blob, filename } = items[i]
        setCurrentFile(filename)
        setProgress(0)
        const compressed = await compressImage(blob)
        const url = await uploadToCloudinary(compressed, filename, setProgress)
        uploaded.push(url)
      }
      return uploaded
    } finally {
      setUploading(false)
      setProgress(0)
      setCurrentFile('')
    }
  }

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList)
    if (!files.length) return

    if (CLOUDINARY_UPLOAD_PRESET === 'REPLACE_WITH_YOUR_PRESET_NAME') {
      setErrors(['Cloudinary upload preset not set yet — see the comment at the top of this file.'])
      return
    }

    const validFiles = []
    const fileErrors = []
    for (const file of files) {
      const err = validateFile(file)
      if (err) fileErrors.push(err)
      else validFiles.push(file)
    }

    const room = single ? 1 : maxImages - currentList.length
    const toUpload = validFiles.slice(0, room)
    if (validFiles.length > toUpload.length) {
      fileErrors.push(`Only ${room} more image${room === 1 ? '' : 's'} allowed — extra file(s) skipped.`)
    }

    setErrors(fileErrors)
    if (!toUpload.length) return
    if (inputRef.current) inputRef.current.value = ''

    // Open the editor for each picked file, one at a time, before uploading
    setEditQueue(toUpload)
    setEditIndex(0)
    setEditedBlobs(new Array(toUpload.length).fill(null))
  }

  /* Advance the edit queue; when finished, upload everything */
  const advanceQueue = async (blobForCurrent) => {
    const next = [...editedBlobs]
    next[editIndex] = blobForCurrent
    setEditedBlobs(next)

    if (editIndex + 1 < editQueue.length) {
      setEditIndex(editIndex + 1)
      return
    }

    // Queue finished — upload everything (edited blob if present, else original file)
    const items = editQueue.map((file, i) => ({
      blob: next[i] || file,
      filename: file.name,
    }))
    setEditQueue([])
    setEditIndex(0)
    setEditedBlobs([])

    try {
      const uploaded = await runUpload(items)
      if (single) onChange(uploaded[0])
      else onChange([...currentList, ...uploaded])
    } catch (err) {
      setErrors((prev) => [...prev, err.message || 'Upload failed. Please try again.'])
    }
  }

  /* Re-editing an existing, already-uploaded image */
  const handleExistingEditSave = async (blob) => {
    const { index } = editingExisting
    setEditingExisting(null)
    try {
      const [newUrl] = await runUpload([{ blob, filename: `edited-${Date.now()}.jpg` }])
      if (single) onChange(newUrl)
      else onChange(currentList.map((u, i) => (i === index ? newUrl : u)))
    } catch (err) {
      setErrors((prev) => [...prev, err.message || 'Failed to save edited photo.'])
    }
  }

  const removeImage = (index) => {
    if (single) onChange(null)
    else onChange(currentList.filter((_, i) => i !== index))
  }

  const moveImage = (index, direction) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= currentList.length) return
    const updated = [...currentList]
    ;[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]]
    onChange(updated)
  }

  const canAddMore = single ? currentList.length === 0 : currentList.length < maxImages

  // Object URL for the file currently being edited in the "new upload" queue
  const editingNewSrc = useMemo(() => {
    if (!editQueue.length) return null
    return URL.createObjectURL(editQueue[editIndex])
  }, [editQueue, editIndex])

  useEffect(() => {
    return () => { if (editingNewSrc) URL.revokeObjectURL(editingNewSrc) }
  }, [editingNewSrc])

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>

        {currentList.map((url, i) => (
          <div key={url + i} style={{ position: 'relative', width: '88px' }}>
            <div style={{ position: 'relative', width: '88px', height: '88px', borderRadius: radius.md, overflow: 'hidden', border: `1px solid ${colors.border}` }}>
              <img src={url} alt={`Upload ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

              {!single && i === 0 && (
                <span style={{ position: 'absolute', bottom: '4px', left: '4px', fontSize: '9px', fontWeight: 700, color: '#fff', backgroundColor: 'rgba(0,0,0,0.6)', padding: '1px 6px', borderRadius: radius.full }}>
                  COVER
                </span>
              )}

              <div style={{ position: 'absolute', top: '4px', right: '4px', display: 'flex', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => setEditingExisting({ index: i, url })}
                  aria-label="Edit image"
                  disabled={uploading}
                  style={{
                    width: '20px', height: '20px', borderRadius: '50%', border: 'none',
                    backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: uploading ? 'not-allowed' : 'pointer', padding: 0,
                  }}
                >
                  <Pencil size={11} />
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  aria-label="Remove image"
                  style={{
                    width: '20px', height: '20px', borderRadius: '50%', border: 'none',
                    backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0,
                  }}
                >
                  <X size={12} />
                </button>
              </div>
            </div>

            {!single && currentList.length > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => moveImage(i, -1)}
                  disabled={i === 0}
                  aria-label="Move left"
                  style={{ flex: 1, height: '20px', border: `1px solid ${colors.border}`, borderRadius: radius.sm, backgroundColor: colors.white, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: i === 0 ? 'not-allowed' : 'pointer', opacity: i === 0 ? 0.35 : 1, marginRight: '3px', padding: 0 }}
                >
                  <ChevronLeft size={12} color={colors.muted} />
                </button>
                <button
                  type="button"
                  onClick={() => moveImage(i, 1)}
                  disabled={i === currentList.length - 1}
                  aria-label="Move right"
                  style={{ flex: 1, height: '20px', border: `1px solid ${colors.border}`, borderRadius: radius.sm, backgroundColor: colors.white, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: i === currentList.length - 1 ? 'not-allowed' : 'pointer', opacity: i === currentList.length - 1 ? 0.35 : 1, padding: 0 }}
                >
                  <ChevronRight size={12} color={colors.muted} />
                </button>
              </div>
            )}
          </div>
        ))}

        {canAddMore && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            style={{
              width: '88px', height: '88px', borderRadius: radius.md,
              border: `1.5px dashed ${colors.border}`, backgroundColor: colors.surface,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: '4px', cursor: uploading ? 'not-allowed' : 'pointer', transition: transition.base,
            }}
          >
            {uploading ? (
              <>
                <Loader2 size={18} color={colors.primary} style={{ animation: 'spin 0.8s linear infinite' }} />
                <span style={{ fontSize: '9.5px', color: colors.muted, fontFamily: font.family, textAlign: 'center', padding: '0 4px' }}>{progress}%</span>
              </>
            ) : (
              <>
                {single ? <ImagePlus size={18} color={colors.muted} /> : <Upload size={16} color={colors.muted} />}
                <span style={{ fontSize: '10px', color: colors.muted, fontFamily: font.family, textAlign: 'center' }}>
                  {single ? 'Add photo' : `Add (${currentList.length}/${maxImages})`}
                </span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={!single}
        onChange={(e) => handleFiles(e.target.files)}
        style={{ display: 'none' }}
      />

      <p style={{ fontSize: '11px', color: colors.muted, marginTop: '8px', fontFamily: font.family }}>
        JPG, PNG, or WebP · up to {MAX_FILE_SIZE_MB}MB each — larger images are auto-compressed before upload.
      </p>

      {errors.length > 0 && (
        <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {errors.map((err, i) => (
            <p key={i} style={{ fontSize: '12px', color: colors.red || '#DC2626', margin: 0, fontFamily: font.family }}>{err}</p>
          ))}
        </div>
      )}

      {/* Editor for newly picked photos, shown one at a time before upload */}
      {editingNewSrc && (
        <ImageEditorModal
          key={editIndex}
          src={editingNewSrc}
          onCancel={() => advanceQueue(null)}
          onSave={(blob) => advanceQueue(blob)}
        />
      )}

      {/* Editor for re-editing an already-uploaded thumbnail */}
      {editingExisting && (
        <ImageEditorModal
          src={editingExisting.url}
          onCancel={() => setEditingExisting(null)}
          onSave={handleExistingEditSave}
        />
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}