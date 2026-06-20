'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import useAuthStore from '@/store/useAuthStore'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [agree, setAgree] = useState(false)
  const { register, loading, error, clearError, user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (user) router.push('/')
  }, [user])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    clearError()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password || !form.confirm) return
    if (form.password !== form.confirm) return
    if (!agree) return
    const result = await register(form.name, form.email, form.password)
    if (result.success) router.push('/')
  }

  const inputStyle = {
    width: '100%', border: '1px solid #E5E7EB', borderRadius: '10px',
    padding: '11px 14px', fontSize: '14px', fontFamily: 'Inter, sans-serif',
    outline: 'none', color: '#111111', backgroundColor: 'white', boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '440px', paddingTop: '2rem', paddingBottom: '2rem' }}>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <div style={{ width: '36px', height: '36px', backgroundColor: '#6366F1', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontWeight: '700', fontSize: '16px' }}>S</span>
            </div>
            <span style={{ fontSize: '20px', fontWeight: '600', color: '#111111' }}>
              Shop<span style={{ color: '#6366F1' }}>Hub</span>
            </span>
          </Link>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '20px', border: '1px solid #E5E7EB', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111111', marginBottom: '6px' }}>Create account</h1>
          <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '1.75rem' }}>Join ShopHub and start exploring</p>

          {error && (
            <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '10px 14px', marginBottom: '1rem', fontSize: '13px', color: '#EF4444' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#111111', marginBottom: '6px' }}>Full Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="John Doe"
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#6366F1'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#111111', marginBottom: '6px' }}>Email address</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com"
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#6366F1'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#111111', marginBottom: '6px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters"
                  style={{ ...inputStyle, paddingRight: '42px' }}
                  onFocus={(e) => e.target.style.borderColor = '#6366F1'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E7EB'} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', display: 'flex', alignItems: 'center' }}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
              {form.password && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    {[1,2,3,4].map((i) => (
                      <div key={i} style={{ flex: 1, height: '3px', borderRadius: '99px', backgroundColor: form.password.length >= i * 2 ? (form.password.length >= 8 ? '#22C55E' : '#F59E0B') : '#E5E7EB', transition: 'background-color 0.3s' }} />
                    ))}
                  </div>
                  <p style={{ fontSize: '11px', color: form.password.length >= 8 ? '#22C55E' : '#F59E0B' }}>
                    {form.password.length >= 8 ? '✓ Strong password' : 'Keep typing for stronger password'}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#111111', marginBottom: '6px' }}>Confirm Password</label>
              <input type="password" name="confirm" value={form.confirm} onChange={handleChange} placeholder="Repeat your password"
                style={{ ...inputStyle, borderColor: form.confirm && form.confirm !== form.password ? '#EF4444' : '#E5E7EB' }}
                onFocus={(e) => e.target.style.borderColor = '#6366F1'}
                onBlur={(e) => e.target.style.borderColor = form.confirm && form.confirm !== form.password ? '#EF4444' : '#E5E7EB'} />
              {form.confirm && form.confirm !== form.password && (
                <p style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>Passwords do not match</p>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <input type="checkbox" id="agree" checked={agree} onChange={(e) => setAgree(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#6366F1', cursor: 'pointer', marginTop: '2px', flexShrink: 0 }} />
              <label htmlFor="agree" style={{ fontSize: '13px', color: '#6B7280', cursor: 'pointer', lineHeight: '1.5' }}>
                I agree to the{' '}
                <Link href="/terms" style={{ color: '#6366F1', textDecoration: 'none' }}>Terms</Link>
                {' '}and{' '}
                <Link href="/privacy" style={{ color: '#6366F1', textDecoration: 'none' }}>Privacy Policy</Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', backgroundColor: loading ? '#A5B4FC' : '#6366F1', color: 'white', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '15px', fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '4px' }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#6B7280', marginTop: '1.5rem' }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: '#6366F1', fontWeight: '600', textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}