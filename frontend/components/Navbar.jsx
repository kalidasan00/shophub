'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import useCartStore from '@/store/useCartStore'
import useAuthStore from '@/store/useAuthStore'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const totalItems = useCartStore((state) => state.getTotalItems())
  const { user, logout, init } = useAuthStore()

  useEffect(() => {
    init()
  }, [])

  const handleLogout = () => {
    logout()
    setProfileOpen(false)
    router.push('/')
  }

  const handleSearch = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      router.push(`/shops?search=${search}`)
      setSearchOpen(false)
      setSearch('')
    }
  }

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shops', href: '/shops' },
    { label: 'Categories', href: '/categories' },
  ]

  const s = {
    nav: { position: 'sticky', top: 0, zIndex: 50, backgroundColor: 'white', borderBottom: '1px solid #E5E7EB', fontFamily: 'Inter, sans-serif' },
    inner: { maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' },
    logo: { display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' },
    logoBox: { width: '32px', height: '32px', backgroundColor: '#6366F1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    iconBtn: { padding: '8px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    badge: { position: 'absolute', top: '-2px', right: '-2px', width: '16px', height: '16px', backgroundColor: '#6366F1', color: 'white', fontSize: '10px', fontWeight: '700', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  }

  return (
    <nav style={s.nav}>
      <div style={s.inner}>

        {/* Logo */}
        <Link href="/" style={s.logo}>
          <div style={s.logoBox}>
            <span style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>S</span>
          </div>
          <span style={{ fontSize: '18px', fontWeight: '600', color: '#111111' }}>
            Shop<span style={{ color: '#6366F1' }}>Hub</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="md-flex" >
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}
              style={{ fontSize: '14px', fontWeight: '500', textDecoration: 'none', color: pathname === link.href ? '#6366F1' : '#6B7280', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#6366F1'}
              onMouseLeave={(e) => e.currentTarget.style.color = pathname === link.href ? '#6366F1' : '#6B7280'}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>

          {/* Search */}
          <button onClick={() => setSearchOpen(!searchOpen)} style={s.iconBtn}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </button>

          {/* Cart */}
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <Link href="/cart" style={{ ...s.iconBtn, textDecoration: 'none', color: '#6B7280' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </Link>
            {totalItems > 0 && (
              <span style={s.badge}>{totalItems > 9 ? '9+' : totalItems}</span>
            )}
          </div>

          {/* Auth — Desktop */}
          <div style={{ display: 'flex', gap: '8px', marginLeft: '4px', alignItems: 'center' }} className="hide-mobile">
            {user ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', border: '1px solid #E5E7EB', borderRadius: '10px', backgroundColor: 'white', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#6366F1'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                >
                  <div style={{ width: '28px', height: '28px', backgroundColor: '#6366F1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#111111', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name?.split(' ')[0]}
                  </span>
                  <svg width="14" height="14" fill="none" stroke="#6B7280" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown */}
                {profileOpen && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '14px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', minWidth: '180px', zIndex: 100, overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #E5E7EB' }}>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: '#111111', fontFamily: 'Inter, sans-serif' }}>{user.name}</p>
                      <p style={{ fontSize: '11px', color: '#6B7280', fontFamily: 'Inter, sans-serif', marginTop: '2px' }}>{user.email}</p>
                    </div>
                    {[
                      { label: '👤 My Profile', href: '/profile' },
                      { label: '📦 My Orders', href: '/orders' },
                      { label: '❤️ Wishlist', href: '/wishlist' },
                    ].map((item) => (
                      <Link key={item.href} href={item.href}
                        onClick={() => setProfileOpen(false)}
                        style={{ display: 'block', padding: '10px 16px', fontSize: '13px', color: '#374151', textDecoration: 'none', fontFamily: 'Inter, sans-serif', transition: 'background-color 0.15s' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        {item.label}
                      </Link>
                    ))}
                    <div style={{ borderTop: '1px solid #E5E7EB' }}>
                      <button onClick={handleLogout}
                        style={{ width: '100%', padding: '10px 16px', fontSize: '13px', color: '#EF4444', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'background-color 0.15s' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        🚪 Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login"
                  style={{ fontSize: '14px', fontWeight: '500', color: '#111111', textDecoration: 'none', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '8px 16px', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6366F1'; e.currentTarget.style.color = '#6366F1' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#111111' }}>
                  Login
                </Link>
                <Link href="/auth/register"
                  style={{ fontSize: '14px', fontWeight: '600', color: 'white', textDecoration: 'none', backgroundColor: '#6366F1', borderRadius: '10px', padding: '8px 16px', transition: 'background-color 0.2s', fontFamily: 'Inter, sans-serif' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4F46E5'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6366F1'}>
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setMenuOpen(!menuOpen)} style={s.iconBtn} className="show-mobile"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
            {menuOpen ? (
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {searchOpen && (
        <div style={{ padding: '12px 1.5rem', borderTop: '1px solid #E5E7EB', backgroundColor: 'white' }}>
          <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
            <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Search shops, products... (press Enter)"
              autoFocus
              style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '10px 14px 10px 40px', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box', color: '#111111' }}
              onFocus={(e) => e.target.style.borderColor = '#6366F1'}
              onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{ borderTop: '1px solid #E5E7EB', padding: '16px 1.5rem', display: 'flex', flexDirection: 'column', gap: '4px', backgroundColor: 'white' }}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
              style={{ padding: '10px 0', fontSize: '15px', fontWeight: '500', textDecoration: 'none', display: 'block', color: pathname === link.href ? '#6366F1' : '#6B7280' }}>
              {link.label}
            </Link>
          ))}

          {user ? (
            <div style={{ paddingTop: '12px', borderTop: '1px solid #E5E7EB', marginTop: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ width: '36px', height: '36px', backgroundColor: '#6366F1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: '700' }}>
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#111111', fontFamily: 'Inter, sans-serif' }}>{user.name}</p>
                  <p style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>{user.email}</p>
                </div>
              </div>
              <button onClick={handleLogout}
                style={{ width: '100%', padding: '10px', backgroundColor: '#FEF2F2', color: '#EF4444', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid #E5E7EB', marginTop: '8px' }}>
              <Link href="/auth/login" onClick={() => setMenuOpen(false)}
                style={{ flex: 1, backgroundColor: 'transparent', color: '#111111', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '10px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', textAlign: 'center', textDecoration: 'none', display: 'block', fontFamily: 'Inter, sans-serif' }}>
                Login
              </Link>
              <Link href="/auth/register" onClick={() => setMenuOpen(false)}
                style={{ flex: 1, backgroundColor: '#6366F1', color: 'white', border: 'none', borderRadius: '10px', padding: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', textAlign: 'center', textDecoration: 'none', display: 'block', fontFamily: 'Inter, sans-serif' }}>
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}