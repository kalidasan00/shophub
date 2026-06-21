'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Store, LayoutGrid, User } from 'lucide-react'
import useAuthStore from '@/store/useAuthStore'
import { colors, font } from '@/lib/styles'

const navItems = [
  { label: 'Home', href: '/', Icon: Home, match: (path: string) => path === '/' },
  { label: 'Shops', href: '/shops', Icon: Store, match: (path: string) => path.startsWith('/shops') },
  { label: 'Categories', href: '/categories', Icon: LayoutGrid, match: (path: string) => path.startsWith('/categories') },
]

export default function BottomNavBar() {
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)

  const accountHref = user ? '/account' : '/auth/login'
  const accountActive = pathname.startsWith('/account') || pathname.startsWith('/orders') || pathname.startsWith('/auth') || pathname.startsWith('/seller')

  return (
    <>
      <style>{`
        .bottom-nav {
          display: none;
        }
        @media (max-width: 768px) {
          .bottom-nav {
            display: flex;
          }
          .bottom-nav-spacer {
            display: block;
          }
        }
      `}</style>

      {/* Spacer so page content doesn't get hidden behind the fixed bar */}
      <div className="bottom-nav-spacer" style={{ display: 'none', height: '60px' }} />

      <nav
        className="bottom-nav"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.white,
          borderTop: `1px solid ${colors.border}`,
          padding: '6px 8px',
          paddingBottom: 'max(6px, env(safe-area-inset-bottom))',
          zIndex: 50,
          justifyContent: 'space-around',
          alignItems: 'center',
          boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
        }}
      >
        {navItems.map(({ label, href, Icon, match }) => {
          const active = match(pathname)
          return (
            <Link
              key={label}
              href={href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                textDecoration: 'none',
                padding: '6px 12px',
                borderRadius: '12px',
                minWidth: '64px',
                flex: 1,
              }}
            >
              <Icon
                size={22}
                color={active ? colors.primary : colors.muted}
                strokeWidth={active ? 2.25 : 1.75}
                fill={active ? colors.primaryLight : 'none'}
              />
              <span style={{
                fontSize: '10.5px',
                fontWeight: active ? '600' : '500',
                color: active ? colors.primary : colors.muted,
                fontFamily: font.family,
              }}>
                {label}
              </span>
            </Link>
          )
        })}

        {/* Account */}
        <Link
          href={accountHref}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            textDecoration: 'none',
            padding: '6px 12px',
            borderRadius: '12px',
            minWidth: '64px',
            flex: 1,
          }}
        >
          <User
            size={22}
            color={accountActive ? colors.primary : colors.muted}
            strokeWidth={accountActive ? 2.25 : 1.75}
            fill={accountActive ? colors.primaryLight : 'none'}
          />
          <span style={{
            fontSize: '10.5px',
            fontWeight: accountActive ? '600' : '500',
            color: accountActive ? colors.primary : colors.muted,
            fontFamily: font.family,
          }}>
            {user ? 'Account' : 'Login'}
          </span>
        </Link>
      </nav>
    </>
  )
}