'use client'

import { useState } from 'react'
import { Store, Check } from 'lucide-react'
import { shopsAPI } from '@/lib/api'
import { colors, font, radius, transition } from '@/lib/styles'
import { categories, gradientPresets, directions, DEFAULT_GRADIENT, inputStyle, Field, ErrorBox, sectionLabelStyle } from './shared'
import ImageUploader from '@/components/ui/ImageUploader'

export default function ShopSettingsTab({ shop, onShopUpdate }) {
  const [form,       setForm]       = useState({ name: shop.name, description: shop.description, category: shop.category })
  const [logo,       setLogo]       = useState(shop.logo || null)
  const [gradient,   setGradient]   = useState(shop.gradient || DEFAULT_GRADIENT)
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState(null)
  const [saved,      setSaved]      = useState(false)

  const handleChange   = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setSaved(false) }
  const handleLogo     = (url) => { setLogo(url); setSaved(false) }
  const handleGradient = (key, value) => { setGradient({ ...gradient, [key]: value }); setSaved(false) }
  const applyPreset    = (preset) => { setGradient({ from: preset.from, to: preset.to, direction: preset.direction }); setSaved(false) }

  const previewCSS = `linear-gradient(${gradient.direction}, ${gradient.from}, ${gradient.to})`

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true); setError(null)
    try {
      const res = await shopsAPI.update(shop._id, { ...form, gradient, logo })
      onShopUpdate(res.data.shop); setSaved(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update shop')
    } finally { setSubmitting(false) }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* ── Live preview — logo + gradient + name together, so you see the real result ── */}
      <div style={{ borderRadius: radius.xxl, overflow: 'hidden', background: previewCSS, display: 'flex', alignItems: 'center', gap: '14px', padding: '1.25rem 1.5rem' }}>
        <div style={{ width: '50px', height: '50px', minWidth: '50px', borderRadius: radius.lg, backgroundColor: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {logo
            ? <img src={logo} alt="Shop logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <Store size={22} color="#fff" strokeWidth={1.5} />
          }
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: '15px', fontWeight: 700, color: '#fff', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{form.name || shop.name}</p>
          <p style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.75)', margin: '2px 0 0' }}>How your shop header looks</p>
        </div>
      </div>

      {/* ── Basic Info ── */}
      <div>
        <p style={sectionLabelStyle}>Basic info</p>
        <div style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.xxl, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
        </div>
      </div>

      {/* ── Shop Logo ── */}
      <div>
        <p style={sectionLabelStyle}>Shop logo</p>
        <div style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.xxl, padding: '1.5rem' }}>
          <ImageUploader images={logo} onChange={handleLogo} single />
        </div>
      </div>

      {/* ── Appearance — gradient only, presets simplified to one row ── */}
      <div>
        <p style={sectionLabelStyle}>Header colour</p>
        <div style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.xxl, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          <div>
            <p style={{ fontSize: '12px', color: colors.muted, margin: '0 0 10px' }}>Presets</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {gradientPresets.map((preset) => {
                const isActive = gradient.from === preset.from && gradient.to === preset.to
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    title={preset.label}
                    aria-label={preset.label}
                    style={{
                      height: '36px',
                      borderRadius: radius.md,
                      background: `linear-gradient(135deg, ${preset.from}, ${preset.to})`,
                      border: isActive ? `2px solid ${colors.dark}` : '2px solid transparent',
                      cursor: 'pointer',
                      outline: isActive ? '2px solid white' : 'none',
                      outlineOffset: '-4px',
                      transition: transition.fast,
                    }}
                  />
                )
              })}
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="From">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: `1px solid ${colors.border}`, borderRadius: radius.md, padding: '8px 12px', backgroundColor: colors.white }}>
                <input
                  type="color"
                  value={gradient.from}
                  onChange={(e) => handleGradient('from', e.target.value)}
                  style={{ width: '26px', height: '26px', border: 'none', padding: 0, cursor: 'pointer', borderRadius: '4px', background: 'none' }}
                />
                <span style={{ fontSize: '12px', color: colors.dark, fontFamily: 'monospace' }}>{gradient.from}</span>
              </div>
            </Field>
            <Field label="To">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: `1px solid ${colors.border}`, borderRadius: radius.md, padding: '8px 12px', backgroundColor: colors.white }}>
                <input
                  type="color"
                  value={gradient.to}
                  onChange={(e) => handleGradient('to', e.target.value)}
                  style={{ width: '26px', height: '26px', border: 'none', padding: 0, cursor: 'pointer', borderRadius: '4px', background: 'none' }}
                />
                <span style={{ fontSize: '12px', color: colors.dark, fontFamily: 'monospace' }}>{gradient.to}</span>
              </div>
            </Field>
          </div>

          <div>
            <p style={{ fontSize: '12px', color: colors.muted, margin: '0 0 10px' }}>Direction</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {directions.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => handleGradient('direction', d.value)}
                  style={{
                    width: '38px', height: '38px',
                    borderRadius: radius.md,
                    border: gradient.direction === d.value ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`,
                    backgroundColor: gradient.direction === d.value ? colors.primaryLight : colors.white,
                    color: gradient.direction === d.value ? colors.primary : colors.muted,
                    fontSize: '16px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: transition.fast,
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {error && <ErrorBox>{error}</ErrorBox>}
      {saved && (
        <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: radius.md, padding: '10px 14px', fontSize: font.sm, color: '#16A34A', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Check size={14} strokeWidth={2.5} /> Shop settings saved
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        style={{ backgroundColor: submitting ? '#A5B4FC' : colors.primary, color: colors.white, border: 'none', borderRadius: radius.md, padding: '13px', fontSize: font.md, fontWeight: 600, fontFamily: font.family, cursor: submitting ? 'not-allowed' : 'pointer' }}
      >
        {submitting ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  )
}