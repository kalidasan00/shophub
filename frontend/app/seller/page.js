'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import useAuthStore from '@/store/useAuthStore'
import { shopsAPI, productsAPI } from '@/lib/api'
import { colors, font, radius, shadow, transition } from '@/lib/styles'

const categories = ['Fashion', 'Electronics', 'Food', 'Beauty', 'Sports', 'Books', 'Home', 'Toys', 'Other']
const productTags = ['New', 'Sale', 'Popular', 'Top Rated', 'Trending', 'Fresh', '']

export default function SellerDashboardPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)

  const [checking, setChecking] = useState(true)
  const [shop, setShop] = useState(null)
  const [error, setError] = useState(null)

  // Redirect if not logged in, or if logged in but wrong role
  useEffect(() => {
    if (user === null) {
      router.push('/auth/login?redirect=/seller')
      return
    }
    if (user && user.role !== 'shopowner' && user.role !== 'admin') {
      setError('only-shopowner')
      setChecking(false)
      return
    }
  }, [user])

  // Check if this user already has a shop
  useEffect(() => {
    if (!user || (user.role !== 'shopowner' && user.role !== 'admin')) return

    const checkShop = async () => {
      try {
        // NOTE: requires backend owner=<userId> filter on GET /api/shops
        const res = await shopsAPI.getAll({ owner: user.id || user._id })
        const myShop = res.data.shops?.[0] || null
        setShop(myShop)
      } catch (err) {
        setError('load-failed')
      } finally {
        setChecking(false)
      }
    }

    checkShop()
  }, [user])

  if (!user) return null

  if (error === 'only-shopowner') {
    return (
      <CenteredMessage
        icon="🔒"
        title="Seller access required"
        subtitle="Your account doesn't have seller permissions. Contact support to become a seller."
      />
    )
  }

  if (checking) {
    return (
      <CenteredMessage
        icon="⏳"
        title="Loading your seller dashboard..."
        subtitle=""
      />
    )
  }

  if (error === 'load-failed') {
    return (
      <CenteredMessage
        icon="⚠️"
        title="Couldn't load your shop"
        subtitle="Please refresh and try again."
      />
    )
  }

  if (!shop) {
    return <CreateShopForm onCreated={setShop} userId={user.id || user._id} />
  }

  return <SellerDashboard shop={shop} onShopUpdate={setShop} />
}

function CenteredMessage({ icon, title, subtitle }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 1.5rem', textAlign: 'center', fontFamily: font.family }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{icon}</div>
      <h2 style={{ fontSize: font.lg, fontWeight: 600, color: colors.dark, marginBottom: '0.5rem' }}>{title}</h2>
      {subtitle && <p style={{ fontSize: font.base, color: colors.muted, maxWidth: '380px' }}>{subtitle}</p>}
    </div>
  )
}

/* ───────────────────── Onboarding: Create Shop ───────────────────── */

function CreateShopForm({ onCreated }) {
  const [form, setForm] = useState({ name: '', description: '', category: 'Fashion', icon: '🛍️' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.description.trim()) {
      setError('Please fill in shop name and description')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const res = await shopsAPI.create(form)
      onCreated(res.data.shop)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create shop')
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '3rem 1.5rem 5rem', fontFamily: font.family }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏪</div>
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 1.875rem)', fontWeight: 700, color: colors.dark, marginBottom: '0.5rem' }}>
          Set up your shop
        </h1>
        <p style={{ fontSize: font.base, color: colors.muted }}>
          Tell us about your shop. You can edit this later.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ backgroundColor: colors.white, borderRadius: radius.xxl, border: `1px solid ${colors.border}`, padding: '1.75rem', boxShadow: shadow.card, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        <Field label="Shop name">
          <input
            type="text" name="name" value={form.name} onChange={handleChange}
            placeholder="e.g. Urban Threads"
            style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = colors.primary}
            onBlur={(e) => e.target.style.borderColor = colors.border}
          />
        </Field>

        <Field label="Description">
          <textarea
            name="description" value={form.description} onChange={handleChange}
            placeholder="What does your shop sell?"
            rows={4}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: font.family }}
            onFocus={(e) => e.target.style.borderColor = colors.primary}
            onBlur={(e) => e.target.style.borderColor = colors.border}
          />
        </Field>

        <Field label="Category">
          <select
            name="category" value={form.category} onChange={handleChange}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>

        <Field label="Shop icon (emoji)">
          <input
            type="text" name="icon" value={form.icon} onChange={handleChange}
            placeholder="🛍️" maxLength={4}
            style={{ ...inputStyle, fontSize: '1.5rem', width: '80px', textAlign: 'center' }}
          />
        </Field>

        {error && (
          <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: radius.md, padding: '10px 14px', fontSize: font.sm, color: colors.red }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            backgroundColor: submitting ? '#A5B4FC' : colors.primary, color: colors.white,
            border: 'none', borderRadius: radius.md, padding: '13px',
            fontSize: font.md, fontWeight: 600, fontFamily: font.family,
            cursor: submitting ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? 'Creating shop...' : 'Create Shop'}
        </button>
      </form>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: colors.dark, marginBottom: '6px' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%', border: `1px solid ${colors.border}`, borderRadius: radius.md,
  padding: '11px 14px', fontSize: font.base, fontFamily: font.family,
  outline: 'none', color: colors.dark, backgroundColor: colors.white, boxSizing: 'border-box',
}

/* ───────────────────── Dashboard: Products Management ───────────────────── */

function SellerDashboard({ shop, onShopUpdate }) {
  const [activeTab, setActiveTab] = useState('products')

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem 5rem', fontFamily: font.family }}>

      {/* Shop header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{
          width: '56px', height: '56px', minWidth: '56px', borderRadius: radius.lg,
          backgroundColor: colors.primaryLight, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '1.75rem',
        }}>
          {shop.icon || '🛍️'}
        </div>
        <div>
          <h1 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: 700, color: colors.dark, margin: 0 }}>
            {shop.name}
          </h1>
          <p style={{ fontSize: font.sm, color: colors.muted, margin: '2px 0 0' }}>
            Seller Dashboard · {shop.category}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: `1px solid ${colors.border}`, marginBottom: '1.5rem' }}>
        {[
          { key: 'products', label: 'Products' },
          { key: 'settings', label: 'Shop Settings' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.75rem 0.25rem', marginRight: '1.5rem',
              border: 'none', borderBottom: activeTab === tab.key ? `2px solid ${colors.primary}` : '2px solid transparent',
              backgroundColor: 'transparent', cursor: 'pointer',
              fontSize: font.base, fontWeight: 600, fontFamily: font.family,
              color: activeTab === tab.key ? colors.primary : colors.muted,
              transition: transition.fast,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'products' && <ProductsTab shopId={shop._id} />}
      {activeTab === 'settings' && <ShopSettingsTab shop={shop} onShopUpdate={onShopUpdate} />}
    </div>
  )
}

/* ── Products Tab ── */

function ProductsTab({ shopId }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await productsAPI.getByShop(shopId)
      setProducts(res.data.products || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, [shopId])

  const handleDelete = async (productId) => {
    if (!confirm('Delete this product? This cannot be undone.')) return
    try {
      await productsAPI.delete(productId)
      setProducts(products.filter((p) => p._id !== productId))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product')
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingProduct(null)
  }

  const handleFormSaved = () => {
    handleFormClose()
    fetchProducts()
  }

  return (
    <div>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <p style={{ fontSize: font.base, color: colors.muted, margin: 0 }}>
          {products.length} product{products.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={() => setShowForm(true)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            backgroundColor: colors.primary, color: colors.white, border: 'none',
            borderRadius: radius.md, padding: '10px 18px', fontSize: font.base,
            fontWeight: 600, fontFamily: font.family, cursor: 'pointer',
          }}
        >
          + Add Product
        </button>
      </div>

      {/* Form modal-ish panel */}
      {showForm && (
        <ProductForm
          shopId={shopId}
          existingProduct={editingProduct}
          onClose={handleFormClose}
          onSaved={handleFormSaved}
        />
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: '76px', borderRadius: radius.lg, backgroundColor: colors.surface, border: `1px solid ${colors.border}`, animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
          <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: colors.muted, fontSize: font.base }}>
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && products.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📦</div>
          <p style={{ fontSize: font.base, color: colors.muted, marginBottom: '1.25rem' }}>
            No products yet. Add your first one.
          </p>
        </div>
      )}

      {/* List */}
      {!loading && !error && products.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {products.map((product) => (
            <div
              key={product._id}
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                backgroundColor: colors.white, border: `1px solid ${colors.border}`,
                borderRadius: radius.lg, padding: '0.875rem 1rem', boxShadow: shadow.card,
              }}
            >
              <div style={{
                width: '48px', height: '48px', minWidth: '48px', borderRadius: radius.md,
                backgroundColor: colors.surface, border: `1px solid ${colors.border}`,
                overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
              }}>
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (product.icon || '📦')}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: font.base, fontWeight: 600, color: colors.dark, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {product.name}
                </p>
                <p style={{ fontSize: font.sm, color: colors.muted, margin: '2px 0 0' }}>
                  ${product.price} · Stock: {product.stock} · {product.tag || 'No tag'}
                </p>
              </div>

              <span style={{
                fontSize: font.xs, fontWeight: 600, flexShrink: 0,
                padding: '4px 10px', borderRadius: radius.full,
                backgroundColor: product.stock > 0 ? '#DCFCE7' : '#FEE2E2',
                color: product.stock > 0 ? '#16A34A' : colors.red,
              }}>
                {product.stock > 0 ? 'In stock' : 'Out of stock'}
              </span>

              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <button
                  onClick={() => { setEditingProduct(product); setShowForm(true) }}
                  style={iconBtnStyle}
                  title="Edit"
                >
                  <svg width="16" height="16" fill="none" stroke={colors.dark} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
                  style={iconBtnStyle}
                  title="Delete"
                  onMouseEnter={(e) => e.currentTarget.style.color = colors.red}
                  onMouseLeave={(e) => e.currentTarget.style.color = colors.dark}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const iconBtnStyle = {
  width: '32px', height: '32px', borderRadius: radius.md,
  border: `1px solid ${colors.border}`, backgroundColor: colors.white,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', color: colors.dark, transition: transition.fast,
}

/* ── Add/Edit Product Form ── */

function ProductForm({ shopId, existingProduct, onClose, onSaved }) {
  const isEditing = !!existingProduct

  const [form, setForm] = useState({
    name: existingProduct?.name || '',
    description: existingProduct?.description || '',
    price: existingProduct?.price || '',
    originalPrice: existingProduct?.originalPrice || '',
    category: existingProduct?.category || categories[0],
    icon: existingProduct?.icon || '📦',
    stock: existingProduct?.stock ?? '',
    tag: existingProduct?.tag || 'New',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.description.trim() || !form.price || form.stock === '') {
      setError('Please fill in name, description, price, and stock')
      return
    }
    setSubmitting(true)
    setError(null)

    const payload = {
      ...form,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
      stock: Number(form.stock),
      shop: shopId,
    }

    try {
      if (isEditing) {
        await productsAPI.update(existingProduct._id, payload)
      } else {
        await productsAPI.create(payload)
      }
      onSaved()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product')
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      backgroundColor: colors.white, border: `1px solid ${colors.border}`,
      borderRadius: radius.xxl, padding: '1.5rem', boxShadow: shadow.card, marginBottom: '1.5rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: font.lg, fontWeight: 600, color: colors.dark, margin: 0 }}>
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.muted, padding: '4px' }}>
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        <Field label="Product name">
          <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Classic White Tee" style={inputStyle} />
        </Field>

        <Field label="Description">
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} style={{ ...inputStyle, resize: 'vertical', fontFamily: font.family }} />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
          <Field label="Price ($)">
            <input type="number" name="price" value={form.price} onChange={handleChange} min="0" step="0.01" style={inputStyle} />
          </Field>
          <Field label="Original price (optional)">
            <input type="number" name="originalPrice" value={form.originalPrice} onChange={handleChange} min="0" step="0.01" style={inputStyle} />
          </Field>
          <Field label="Stock">
            <input type="number" name="stock" value={form.stock} onChange={handleChange} min="0" style={inputStyle} />
          </Field>
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
          <Field label="Icon (emoji)">
            <input type="text" name="icon" value={form.icon} onChange={handleChange} maxLength={4} style={{ ...inputStyle, fontSize: '1.25rem', textAlign: 'center' }} />
          </Field>
        </div>

        {error && (
          <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: radius.md, padding: '10px 14px', fontSize: font.sm, color: colors.red }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
          <button
            type="submit"
            disabled={submitting}
            style={{
              flex: 1, backgroundColor: submitting ? '#A5B4FC' : colors.primary, color: colors.white,
              border: 'none', borderRadius: radius.md, padding: '12px', fontSize: font.base,
              fontWeight: 600, fontFamily: font.family, cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Product'}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '12px 20px', border: `1px solid ${colors.border}`, borderRadius: radius.md,
              backgroundColor: colors.white, color: colors.dark, fontSize: font.base,
              fontWeight: 500, fontFamily: font.family, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

/* ── Shop Settings Tab ── */

function ShopSettingsTab({ shop, onShopUpdate }) {
  const [form, setForm] = useState({
    name: shop.name, description: shop.description, category: shop.category, icon: shop.icon || '🛍️',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setSaved(false) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await shopsAPI.update(shop._id, form)
      onShopUpdate(res.data.shop)
      setSaved(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update shop')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{
      backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.xxl,
      padding: '1.75rem', boxShadow: shadow.card, maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: '1.25rem',
    }}>
      <Field label="Shop name">
        <input type="text" name="name" value={form.name} onChange={handleChange} style={inputStyle} />
      </Field>
      <Field label="Description">
        <textarea name="description" value={form.description} onChange={handleChange} rows={4} style={{ ...inputStyle, resize: 'vertical', fontFamily: font.family }} />
      </Field>
      <Field label="Category">
        <select name="category" value={form.category} onChange={handleChange} style={{ ...inputStyle, cursor: 'pointer' }}>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Shop icon (emoji)">
        <input type="text" name="icon" value={form.icon} onChange={handleChange} maxLength={4} style={{ ...inputStyle, fontSize: '1.5rem', width: '80px', textAlign: 'center' }} />
      </Field>

      {error && (
        <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: radius.md, padding: '10px 14px', fontSize: font.sm, color: colors.red }}>
          {error}
        </div>
      )}
      {saved && (
        <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: radius.md, padding: '10px 14px', fontSize: font.sm, color: '#16A34A' }}>
          ✓ Shop settings saved
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        style={{
          backgroundColor: submitting ? '#A5B4FC' : colors.primary, color: colors.white,
          border: 'none', borderRadius: radius.md, padding: '13px', fontSize: font.md,
          fontWeight: 600, fontFamily: font.family, cursor: submitting ? 'not-allowed' : 'pointer',
        }}
      >
        {submitting ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  )
}