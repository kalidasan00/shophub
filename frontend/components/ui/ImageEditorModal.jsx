'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { X, RotateCcw, RotateCw, FlipHorizontal, FlipVertical, Check } from 'lucide-react'
import { colors, font, radius } from '@/lib/styles'

const FILTERS = [
  { key: 'none',      label: 'None',  css: 'none' },
  { key: 'grayscale', label: 'B&W',   css: 'grayscale(1)' },
  { key: 'sepia',     label: 'Sepia', css: 'sepia(0.6)' },
  { key: 'vivid',     label: 'Vivid', css: 'saturate(1.6) contrast(1.1)' },
  { key: 'cool',      label: 'Cool',  css: 'saturate(1.1) hue-rotate(15deg)' },
  { key: 'warm',      label: 'Warm',  css: 'saturate(1.1) sepia(0.25)' },
  { key: 'fade',      label: 'Fade',  css: 'contrast(0.85) brightness(1.1) saturate(0.85)' },
]

const PREVIEW_MAX = 340

/**
 * <ImageEditorModal
 *   src={objectUrlOrRemoteUrl}
 *   onCancel={() => ...}
 *   onSave={(blob) => ...}   // JPEG blob, cropped/rotated/flipped/filtered
 * />
 * Remote URLs (e.g. Cloudinary) must allow CORS — this loads with crossOrigin="anonymous".
 */
export default function ImageEditorModal({ src, onCancel, onSave }) {
  const imgRef = useRef(null)
  const canvasRef = useRef(null)

  const [loaded, setLoaded] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [rotation, setRotation] = useState(0)      // 0, 90, 180, 270
  const [flipH, setFlipH] = useState(false)
  const [flipV, setFlipV] = useState(false)
  const [filterKey, setFilterKey] = useState('none')
  const [crop, setCrop] = useState(null)           // {x,y,w,h} in preview canvas px
  const [dragStart, setDragStart] = useState(null)
  const [saving, setSaving] = useState(false)

  const filterCss = FILTERS.find((f) => f.key === filterKey)?.css || 'none'

  useEffect(() => {
    setLoaded(false)
    setLoadError(false)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => { imgRef.current = img; setLoaded(true) }
    img.onerror = () => setLoadError(true)
    img.src = src
  }, [src])

  // Crop coordinates are only valid for the current orientation — reset on change
  useEffect(() => { setCrop(null) }, [rotation, flipH, flipV])

  const getDisplaySize = useCallback(() => {
    const img = imgRef.current
    if (!img) return { w: PREVIEW_MAX, h: PREVIEW_MAX, scale: 1 }
    const swapped = rotation === 90 || rotation === 270
    const effW = swapped ? img.naturalHeight : img.naturalWidth
    const effH = swapped ? img.naturalWidth : img.naturalHeight
    const scale = Math.min(PREVIEW_MAX / effW, PREVIEW_MAX / effH, 1)
    return { w: Math.round(effW * scale), h: Math.round(effH * scale), scale, effW, effH }
  }, [rotation])

  const draw = useCallback(() => {
    const img = imgRef.current
    const canvas = canvasRef.current
    if (!img || !canvas || !loaded) return
    const { w, h } = getDisplaySize()
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, w, h)

    ctx.save()
    ctx.filter = filterCss
    ctx.translate(w / 2, h / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)
    const swapped = rotation === 90 || rotation === 270
    const drawW = swapped ? h : w
    const drawH = swapped ? w : h
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH)
    ctx.restore()

    if (crop) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(0, 0, w, crop.y)
      ctx.fillRect(0, crop.y + crop.h, w, h - crop.y - crop.h)
      ctx.fillRect(0, crop.y, crop.x, crop.h)
      ctx.fillRect(crop.x + crop.w, crop.y, w - crop.x - crop.w, crop.h)
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 1.5
      ctx.strokeRect(crop.x + 0.5, crop.y + 0.5, crop.w, crop.h)
    }
  }, [loaded, rotation, flipH, flipV, filterCss, crop, getDisplaySize])

  useEffect(() => { draw() }, [draw])

  const getPointerPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  const handlePointerDown = (e) => {
    const pos = getPointerPos(e)
    setDragStart(pos)
    setCrop({ x: pos.x, y: pos.y, w: 0, h: 0 })
  }
  const handlePointerMove = (e) => {
    if (!dragStart) return
    const pos = getPointerPos(e)
    setCrop({
      x: Math.min(dragStart.x, pos.x),
      y: Math.min(dragStart.y, pos.y),
      w: Math.abs(pos.x - dragStart.x),
      h: Math.abs(pos.y - dragStart.y),
    })
  }
  const handlePointerUp = () => setDragStart(null)

  const handleSave = () => {
    const img = imgRef.current
    if (!img) return
    setSaving(true)

    const { scale, effW, effH } = getDisplaySize()

    // Full-resolution transformed canvas
    const full = document.createElement('canvas')
    full.width = effW
    full.height = effH
    const ctx = full.getContext('2d')
    ctx.save()
    ctx.filter = filterCss
    ctx.translate(effW / 2, effH / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)
    const swapped = rotation === 90 || rotation === 270
    const drawW = swapped ? effH : effW
    const drawH = swapped ? effW : effH
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH)
    ctx.restore()

    let finalCanvas = full
    if (crop && crop.w > 4 && crop.h > 4) {
      const sx = crop.x / scale
      const sy = crop.y / scale
      const sw = crop.w / scale
      const sh = crop.h / scale
      const cropped = document.createElement('canvas')
      cropped.width = Math.round(sw)
      cropped.height = Math.round(sh)
      cropped.getContext('2d').drawImage(full, sx, sy, sw, sh, 0, 0, sw, sh)
      finalCanvas = cropped
    }

    finalCanvas.toBlob((blob) => {
      setSaving(false)
      if (blob) onSave(blob)
    }, 'image/jpeg', 0.92)
  }

  const { w, h } = getDisplaySize()

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div style={{ backgroundColor: colors.white, borderRadius: radius.xxl, padding: '1.25rem', width: '100%', maxWidth: '420px', fontFamily: font.family }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: font.lg, fontWeight: 600, color: colors.dark, margin: 0 }}>Edit photo</h3>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.muted, display: 'flex' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, marginBottom: '0.5rem', minHeight: `${Math.min(PREVIEW_MAX, 220)}px`, overflow: 'hidden' }}>
          {loadError ? (
            <p style={{ fontSize: '13px', color: colors.muted, padding: '1rem', textAlign: 'center' }}>Couldn't load this image for editing.</p>
          ) : !loaded ? (
            <p style={{ fontSize: '13px', color: colors.muted }}>Loading image...</p>
          ) : (
            <canvas
              ref={canvasRef}
              width={w}
              height={h}
              style={{ touchAction: 'none', cursor: 'crosshair', display: 'block', maxWidth: '100%' }}
              onMouseDown={handlePointerDown}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onMouseLeave={handlePointerUp}
              onTouchStart={handlePointerDown}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
            />
          )}
        </div>

        <p style={{ fontSize: '11px', color: colors.muted, marginTop: 0, marginBottom: '10px' }}>
          Drag on the image to crop.{' '}
          {crop && (
            <button type="button" onClick={() => setCrop(null)} style={{ background: 'none', border: 'none', color: colors.primary, cursor: 'pointer', fontSize: '11px', padding: 0, fontFamily: font.family }}>
              Clear crop
            </button>
          )}
        </p>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
          <IconAction icon={<RotateCcw size={16} />} label="Rotate L" onClick={() => setRotation((r) => (r + 270) % 360)} />
          <IconAction icon={<RotateCw size={16} />} label="Rotate R" onClick={() => setRotation((r) => (r + 90) % 360)} />
          <IconAction icon={<FlipHorizontal size={16} />} label="Flip H" onClick={() => setFlipH((f) => !f)} active={flipH} />
          <IconAction icon={<FlipVertical size={16} />} label="Flip V" onClick={() => setFlipV((f) => !f)} active={flipV} />
        </div>

        <p style={{ fontSize: '11px', fontWeight: 600, color: colors.muted, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Filter</p>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '2px' }}>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilterKey(f.key)}
              style={{
                flexShrink: 0, fontSize: '12px', padding: '6px 12px', borderRadius: radius.full,
                border: filterKey === f.key ? `1.5px solid ${colors.primary}` : `1px solid ${colors.border}`,
                backgroundColor: filterKey === f.key ? colors.primaryLight : colors.white,
                color: filterKey === f.key ? colors.primary : colors.dark,
                cursor: 'pointer', fontFamily: font.family, whiteSpace: 'nowrap',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" onClick={onCancel} style={{ flex: 1, padding: '11px', border: `1px solid ${colors.border}`, borderRadius: radius.md, backgroundColor: colors.white, color: colors.dark, fontSize: font.base, fontWeight: 500, fontFamily: font.family, cursor: 'pointer' }}>
            Skip
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!loaded || saving}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '11px', border: 'none', borderRadius: radius.md, backgroundColor: colors.primary, color: colors.white, fontSize: font.base, fontWeight: 600, fontFamily: font.family, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
          >
            <Check size={16} /> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

function IconAction({ icon, label, onClick, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
        padding: '10px 4px', borderRadius: radius.md,
        border: active ? `1.5px solid ${colors.primary}` : `1px solid ${colors.border}`,
        backgroundColor: active ? colors.primaryLight : colors.white,
        color: active ? colors.primary : colors.dark,
        cursor: 'pointer', fontFamily: font.family,
      }}
    >
      {icon}
      <span style={{ fontSize: '9.5px' }}>{label}</span>
    </button>
  )
}