'use client'

import { useState } from 'react'
import { Store, ShoppingBag, TrendingUp, DollarSign, ChevronDown } from 'lucide-react'
import { shopsAPI } from '@/lib/api'
import { colors, font, radius } from '@/lib/styles'
import { categories, inputStyle, Field, ErrorBox } from './shared'

export default function SellerOnboarding({ onCreated }) {
  const [step, setStep] = useState('landing')

  if (step === 'form') return <CreateShopForm onCreated={onCreated} onBack={() => setStep('landing')} />

  const perks = [
    { icon: <Store size={18} strokeWidth={1.5} />,       title: 'Your own storefront', desc: 'List products and manage your shop in minutes.' },
    { icon: <ShoppingBag size={18} strokeWidth={1.5} />, title: 'Instant orders',      desc: 'Get notified the moment a buyer places an order.' },
    { icon: <TrendingUp size={18} strokeWidth={1.5} />,  title: 'Sales analytics',     desc: 'Track revenue, top products and growth over time.' },
    { icon: <DollarSign size={18} strokeWidth={1.5} />,  title: 'Keep more earnings',  desc: 'Low platform fee. You set your own prices.' },
  ]

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem 1.5rem 5rem', fontFamily: font.family }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '18px', backgroundColor: colors.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
          <Store size={30} color={colors.primary} strokeWidth={1.5} />
        </div>
        <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, color: colors.dark, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          Start selling on ShopHub
        </h1>
        <p style={{ fontSize: font.base, color: colors.muted, maxWidth: '380px', margin: '0 auto' }}>
          Join thousands of sellers. Set up your shop in under 2 minutes — no approval needed.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '2rem' }}>
        {perks.map((perk) => (
          <div key={perk.title} style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.lg, padding: '1rem' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: radius.md, backgroundColor: colors.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.primary, marginBottom: '10px' }}>
              {perk.icon}
            </div>
            <p style={{ fontSize: '13.5px', fontWeight: 700, color: colors.dark, margin: '0 0 4px' }}>{perk.title}</p>
            <p style={{ fontSize: '12.5px', color: colors.muted, margin: 0, lineHeight: 1.5 }}>{perk.desc}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => setStep('form')}
        style={{ width: '100%', padding: '14px', backgroundColor: colors.primary, color: colors.white, border: 'none', borderRadius: radius.md, fontSize: font.md, fontWeight: 700, fontFamily: font.family, cursor: 'pointer', letterSpacing: '0.01em' }}
      >
        Set up my shop →
      </button>
      <p style={{ textAlign: 'center', fontSize: font.xs, color: colors.muted, marginTop: '0.75rem' }}>
        Free to start · No credit card required
      </p>
    </div>
  )
}

function CreateShopForm({ onCreated, onBack }) {
  const [form,       setForm]       = useState({ name: '', description: '', category: 'Fashion' })
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState(null)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.description.trim()) { setError('Please fill in shop name and description'); return }
    setSubmitting(true); setError(null)
    try {
      const res = await shopsAPI.create(form)
      onCreated(res.data.shop)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create shop')
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '2rem 1.5rem 5rem', fontFamily: font.family }}>
      <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: colors.muted, fontSize: font.sm, fontFamily: font.family, marginBottom: '1.5rem', padding: 0 }}>
        <ChevronDown size={14} style={{ transform: 'rotate(90deg)' }} strokeWidth={2} /> Back
      </button>

      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.75rem)', fontWeight: 800, color: colors.dark, marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>
          Set up your shop
        </h1>
        <p style={{ fontSize: font.base, color: colors.muted }}>You can edit everything later from settings.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ backgroundColor: colors.white, borderRadius: radius.xxl, border: `1px solid ${colors.border}`, padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <Field label="Shop name">
          <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Urban Threads" style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = colors.primary}
            onBlur={(e)  => e.target.style.borderColor = colors.border} />
        </Field>
        <Field label="What do you sell?">
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe your shop and products..." rows={4}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: font.family }}
            onFocus={(e) => e.target.style.borderColor = colors.primary}
            onBlur={(e)  => e.target.style.borderColor = colors.border} />
        </Field>
        <Field label="Category">
          <select name="category" value={form.category} onChange={handleChange} style={{ ...inputStyle, cursor: 'pointer' }}>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>

        {error && <ErrorBox>{error}</ErrorBox>}

        <button type="submit" disabled={submitting} style={{ backgroundColor: submitting ? '#A5B4FC' : colors.primary, color: colors.white, border: 'none', borderRadius: radius.md, padding: '13px', fontSize: font.md, fontWeight: 700, fontFamily: font.family, cursor: submitting ? 'not-allowed' : 'pointer' }}>
          {submitting ? 'Creating your shop...' : 'Create Shop'}
        </button>
      </form>
    </div>
  )
}