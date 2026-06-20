'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import useAuthStore from '@/store/useAuthStore'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const { login, loading, error, clearError, user } = useAuthStore()
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
    if (!form.email || !form.password) return
    const result = await login(form.email, form.password)
    if (result.success) router.push('/')
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>

        {/* Logo */}
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

        {/* Card */}
        <div style={{ backgroundColor: 'white', borderRadius: '20px', border: '1px solid #E5E7EB', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111111', marginBottom: '6px' }}>Welcome back</h1>
          <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '1.75rem' }}>Sign in to your ShopHub account</p>

          {error && (
            <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '10px 14px', marginBottom: '1rem', fontSize: '13px', color: '#EF4444' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#111111', marginBottom: '6px' }}>Email address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', color: '#111111', backgroundColor: 'white', boxSizing: 'border-box' }}
                onFocus={(e) => e.target.style.borderColor = '#6366F1'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#111111' }}>Password</label>
                <Link href="/auth/forgot" style={{ fontSize: '12px', color: '#6366F1', textDecoration: 'none' }}>Forgot password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '11px 42px 11px 14px', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', color: '#111111', backgroundColor: 'white', boxSizing: 'border-box' }}
                  onFocus={(e) => e.target.style.borderColor = '#6366F1'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', display: 'flex', alignItems: 'center' }}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPassword
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                    }
                  </svg>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', backgroundColor: loading ? '#A5B4FC' : '#6366F1', color: 'white', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '15px', fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '4px' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Test accounts hint */}
          <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '12px', marginTop: '1rem', fontSize: '12px', color: '#6B7280' }}>
            <p style={{ fontWeight: '600', color: '#111111', marginBottom: '4px' }}>Test Accounts:</p>
            <p>Customer: customer@shophub.com / customer123</p>
            <p>Admin: admin@shophub.com / admin123</p>
          </div>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#6B7280', marginTop: '1.5rem' }}>
            Don't have an account?{' '}
            <Link href="/auth/register" style={{ color: '#6366F1', fontWeight: '600', textDecoration: 'none' }}>Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}