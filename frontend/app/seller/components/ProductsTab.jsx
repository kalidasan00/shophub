'use client'

import { useState, useEffect } from 'react'
import { Package, Pencil, Trash2, Plus, X } from 'lucide-react'
import { productsAPI } from '@/lib/api'
import { colors, font, radius } from '@/lib/styles'
import { categories, productTags, inputStyle, iconBtnStyle, Field, ErrorBox, SkeletonBox } from './shared'
import ImageUploader from '@/components/ui/ImageUploader'

export default function ProductsTab({ shopId }) {
  const [products,       setProducts]       = useState([])
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState(null)
  const [showForm,       setShowForm]       = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await productsAPI.getByShop(shopId)
      setProducts(res.data.products || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchProducts() }, [shopId])

  const handleDelete = async (productId) => {
    if (!confirm('Delete this product? This cannot be undone.')) return
    try {
      await productsAPI.delete(productId)
      setProducts(products.filter((p) => p._id !== productId))
    } catch (err) { alert(err.response?.data?.message || 'Failed to delete') }
  }

  const handleFormClose = () => { setShowForm(false); setEditingProduct(null) }
  const handleFormSaved = () => { handleFormClose(); fetchProducts() }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <p style={{ fontSize: font.base, color: colors.muted, margin: 0 }}>{products.length} product{products.length !== 1 ? 's' : ''}</p>
        <button
          onClick={() => setShowForm(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: colors.primary, color: colors.white, border: 'none', borderRadius: radius.md, padding: '9px 16px', fontSize: font.base, fontWeight: 600, fontFamily: font.family, cursor: 'pointer' }}
        >
          <Plus size={15} strokeWidth={2.5} /> Add Product
        </button>
      </div>

      {showForm && (
        <ProductForm shopId={shopId} existingProduct={editingProduct} onClose={handleFormClose} onSaved={handleFormSaved} />
      )}

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1,2,3].map((i) => <SkeletonBox key={i} height="76px" />)}
        </div>
      )}

      {!loading && error && <p style={{ textAlign: 'center', padding: '3rem 1rem', color: colors.muted, fontSize: font.base }}>{error}</p>}

      {!loading && !error && products.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <Package size={40} color={colors.muted} strokeWidth={1.5} />
          </div>
          <p style={{ fontSize: font.base, color: colors.muted }}>No products yet. Add your first one.</p>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {products.map((product) => (
            <div key={product._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.lg, padding: '0.875rem 1rem' }}>
              <div style={{ width: '48px', height: '48px', minWidth: '48px', borderRadius: radius.md, backgroundColor: colors.surface, border: `1px solid ${colors.border}`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {product.images?.[0]
                  ? <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <Package size={20} color={colors.muted} strokeWidth={1.5} />
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: font.base, fontWeight: 600, color: colors.dark, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
                <p style={{ fontSize: font.sm, color: colors.muted, margin: '2px 0 0' }}>${product.price} · Stock: {product.stock} · {product.tag || 'No tag'}</p>
              </div>
              <span style={{ fontSize: font.xs, fontWeight: 600, flexShrink: 0, padding: '4px 10px', borderRadius: radius.full, backgroundColor: product.stock > 0 ? '#DCFCE7' : '#FEE2E2', color: product.stock > 0 ? '#16A34A' : '#EF4444' }}>
                {product.stock > 0 ? 'In stock' : 'Out of stock'}
              </span>
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <button onClick={() => { setEditingProduct(product); setShowForm(true) }} style={iconBtnStyle} title="Edit">
                  <Pencil size={15} strokeWidth={1.5} />
                </button>
                <button onClick={() => handleDelete(product._id)} style={iconBtnStyle} title="Delete"
                  onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
                  onMouseLeave={(e) => e.currentTarget.style.color = colors.dark}>
                  <Trash2 size={15} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ProductForm({ shopId, existingProduct, onClose, onSaved }) {
  const isEditing = !!existingProduct
  const [form, setForm] = useState({
    name:          existingProduct?.name          || '',
    description:   existingProduct?.description   || '',
    price:         existingProduct?.price         || '',
    originalPrice: existingProduct?.originalPrice || '',
    category:      existingProduct?.category      || categories[0],
    stock:         existingProduct?.stock         ?? '',
    tag:           existingProduct?.tag           || 'New',
    images:        existingProduct?.images        || [],
  })
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState(null)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.description.trim() || !form.price || form.stock === '') {
      setError('Please fill in name, description, price, and stock'); return
    }
    setSubmitting(true); setError(null)
    const payload = {
      ...form,
      price:         Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
      stock:         Number(form.stock),
      shop:          shopId,
    }
    try {
      isEditing ? await productsAPI.update(existingProduct._id, payload) : await productsAPI.create(payload)
      onSaved()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product')
      setSubmitting(false)
    }
  }

  return (
    <div style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.xxl, padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: font.lg, fontWeight: 600, color: colors.dark, margin: 0 }}>{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.muted, padding: '4px', display: 'flex' }}>
          <X size={20} strokeWidth={2} />
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Field label="Product photos">
          <ImageUploader
            images={form.images}
            maxImages={5}
            onChange={(urls) => setForm({ ...form, images: urls })}
          />
        </Field>

        <Field label="Product name"><input type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Classic White Tee" style={inputStyle} /></Field>
        <Field label="Description"><textarea name="description" value={form.description} onChange={handleChange} rows={3} style={{ ...inputStyle, resize: 'vertical', fontFamily: font.family }} /></Field>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
          <Field label="Price ($)"><input type="number" name="price" value={form.price} onChange={handleChange} min="0" step="0.01" style={inputStyle} /></Field>
          <Field label="Original price"><input type="number" name="originalPrice" value={form.originalPrice} onChange={handleChange} min="0" step="0.01" style={inputStyle} /></Field>
          <Field label="Stock"><input type="number" name="stock" value={form.stock} onChange={handleChange} min="0" style={inputStyle} /></Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
          <Field label="Category">
            <select name="category" value={form.category} onChange={handleChange} style={{ ...inputStyle, cursor: 'pointer' }}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Tag">
            <select name="tag" value={form.tag} onChange={handleChange} style={{ ...inputStyle, cursor: 'pointer' }}>
              {productTags.map((t) => <option key={t} value={t}>{t || 'None'}</option>)}
            </select>
          </Field>
        </div>

        {error && <ErrorBox>{error}</ErrorBox>}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="submit" disabled={submitting} style={{ flex: 1, backgroundColor: submitting ? '#A5B4FC' : colors.primary, color: colors.white, border: 'none', borderRadius: radius.md, padding: '12px', fontSize: font.base, fontWeight: 600, fontFamily: font.family, cursor: submitting ? 'not-allowed' : 'pointer' }}>
            {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Product'}
          </button>
          <button type="button" onClick={onClose} style={{ padding: '12px 20px', border: `1px solid ${colors.border}`, borderRadius: radius.md, backgroundColor: colors.white, color: colors.dark, fontSize: font.base, fontWeight: 500, fontFamily: font.family, cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}