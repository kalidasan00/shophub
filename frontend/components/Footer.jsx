import Link from 'next/link'

export default function Footer() {
  const footerLinks = {
    Company: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
      { label: 'Blog', href: '/blog' },
      { label: 'Become a Seller', href: '/seller' },
    ],
    Support: [
      { label: 'Help Center', href: '/help' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Returns', href: '/returns' },
      { label: 'Track Order', href: '/track' },
    ],
    Legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
    ],
  }

  const socials = [
    { label: 'T', href: '#' },
    { label: 'I', href: '#' },
    { label: 'F', href: '#' },
  ]

  return (
    <footer style={{ background: 'white', borderTop: '1px solid #E5E7EB', marginTop: '5rem', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        .ftr * { box-sizing: border-box; }
        .ftr-wrap {
          padding-left: 1.25rem; padding-right: 1.25rem; margin: 0 auto;
        }
        @media (min-width: 640px) { .ftr-wrap { padding-left: 2rem; padding-right: 2rem; } }
        @media (min-width: 1024px) { .ftr-wrap { padding-left: 3rem; padding-right: 3rem; max-width: 1280px; } }

        .ftr-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.5rem;
        }
        @media (min-width: 640px) {
          .ftr-grid { grid-template-columns: repeat(2, 1fr); gap: 2rem; }
        }
        @media (min-width: 1024px) {
          .ftr-grid { grid-template-columns: 2fr 1fr 1fr 1fr; gap: 2.5rem; }
        }

        .ftr-link {
          font-size: 0.875rem;
          color: #6B7280;
          text-decoration: none;
          transition: color 0.2s;
        }
        .ftr-link:hover { color: #6366F1; }

        .ftr-social {
          width: 36px; height: 36px;
          border-radius: 10px;
          border: 1px solid #E5E7EB;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.75rem; font-weight: 600;
          color: #6B7280; text-decoration: none;
          transition: all 0.2s;
        }
        .ftr-social:hover { color: #6366F1; border-color: #6366F1; background: #F5F3FF; }

        .ftr-newsletter-row {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          align-items: stretch;
        }
        @media (min-width: 640px) {
          .ftr-newsletter-row {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }

        .ftr-newsletter-form {
          display: flex;
          gap: 0.5rem;
          width: 100%;
        }
        @media (min-width: 640px) {
          .ftr-newsletter-form { width: auto; }
        }

        .ftr-email-input {
          flex: 1;
          min-width: 0;
          height: 44px;
          padding: 0 1rem;
          border: 1px solid #E5E7EB;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          font-family: Inter, sans-serif;
          outline: none;
          color: #111111;
          background: white;
          transition: border-color 0.2s;
        }
        .ftr-email-input:focus { border-color: #6366F1; }
        .ftr-email-input::placeholder { color: #9CA3AF; }
        @media (min-width: 640px) { .ftr-email-input { width: 256px; } }

        .ftr-subscribe-btn {
          height: 44px;
          padding: 0 1.5rem;
          background: #6366F1;
          color: white;
          border: none;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          font-family: Inter, sans-serif;
          transition: background 0.2s;
        }
        .ftr-subscribe-btn:hover { background: #4F46E5; }

        .ftr-bottom-row {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          align-items: center;
          text-align: center;
        }
        @media (min-width: 640px) {
          .ftr-bottom-row { flex-direction: row; justify-content: space-between; text-align: left; }
        }
      `}</style>

      <div className="ftr">

        {/* ── Main links ── */}
        <div className="ftr-wrap" style={{ paddingTop: '3.5rem', paddingBottom: '3.5rem' }}>
          <div className="ftr-grid">

            {/* Brand column */}
            <div>
              <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', textDecoration: 'none' }}>
                <div style={{ width: '32px', height: '32px', background: '#6366F1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'white', fontWeight: 700, fontSize: '0.875rem' }}>S</span>
                </div>
                <span style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111111' }}>
                  Shop<span style={{ color: '#6366F1' }}>Hub</span>
                </span>
              </Link>
              <p style={{ fontSize: '0.875rem', color: '#6B7280', lineHeight: 1.7, maxWidth: '300px', margin: 0 }}>
                Discover thousands of local shops and products across all categories. Your one-stop marketplace for everything.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginTop: '1.5rem' }}>
                {socials.map((s) => (
                  <a key={s.label} href={s.href} className="ftr-social">{s.label}</a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111111', marginBottom: '1rem' }}>
                  {title}
                </h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: 0, padding: 0 }}>
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="ftr-link">{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── Newsletter ── */}
        <div style={{ borderTop: '1px solid #E5E7EB' }}>
          <div className="ftr-wrap" style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
            <div className="ftr-newsletter-row">
              <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0 }}>
                Subscribe to get deals and new shop alerts
              </p>
              <div className="ftr-newsletter-form">
                <input type="email" placeholder="Enter your email" className="ftr-email-input" />
                <button className="ftr-subscribe-btn">Subscribe</button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div style={{ borderTop: '1px solid #E5E7EB' }}>
          <div className="ftr-wrap" style={{ paddingTop: '1.25rem', paddingBottom: '1.25rem' }}>
            <div className="ftr-bottom-row">
              <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: 0 }}>
                © 2025 ShopHub. All rights reserved.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <Link href="/privacy" className="ftr-link" style={{ fontSize: '0.75rem' }}>Privacy</Link>
                <Link href="/terms" className="ftr-link" style={{ fontSize: '0.75rem' }}>Terms</Link>
                <Link href="/cookies" className="ftr-link" style={{ fontSize: '0.75rem' }}>Cookies</Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </footer>
  )
}