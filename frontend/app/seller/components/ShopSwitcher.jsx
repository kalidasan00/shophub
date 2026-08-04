'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Store, Plus, X } from 'lucide-react'
import { colors, font, radius, shadow, transition } from '@/lib/styles'

export default function ShopSwitcher({ user, shops, currentShop, onSwitch, renderAddShopFlow }) {
  const [open, setOpen] = useState(false)
  const [addingShop, setAddingShop] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div style={{ backgroundColor: colors.white, borderBottom: `1px solid ${colors.border}`, fontFamily: font.family }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '14px 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>

        {/* Account name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div style={{ width: '34px', height: '34px', minWidth: '34px', borderRadius: '50%', backgroundColor: colors.primaryLight, color: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700 }}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: colors.dark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name}
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: colors.muted }}>Seller account</p>
          </div>
        </div>

        {/* Shop switcher dropdown */}
        <div ref={ref} style={{ position: 'relative' }}>
          <button
            onClick={() => setOpen(!open)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '7px 12px', border: `1px solid ${colors.border}`, borderRadius: radius.md,
              backgroundColor: colors.white, cursor: 'pointer', fontFamily: font.family,
              maxWidth: '260px',
            }}
          >
            <div style={{ width: '24px', height: '24px', minWidth: '24px', borderRadius: '7px', backgroundColor: colors.surface, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${colors.border}` }}>
              {currentShop.logo
                ? <img src={currentShop.logo} alt={currentShop.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <Store size={13} color={colors.muted} strokeWidth={1.5} />
              }
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: colors.dark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentShop.name}
            </span>
            <ChevronDown size={14} color={colors.muted} style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: transition.base }} />
          </button>

          {open && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', right: 0, minWidth: '240px',
              backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.lg,
              boxShadow: shadow.hover || shadow.card, zIndex: 100, overflow: 'hidden',
            }}>
              <p style={{ margin: 0, padding: '10px 12px 6px', fontSize: '10.5px', fontWeight: 700, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Your shops ({shops.length})
              </p>
              {shops.map((shop) => (
                <button
                  key={shop._id}
                  onClick={() => { onSwitch(shop._id); setOpen(false) }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '9px 12px', border: 'none', cursor: 'pointer', textAlign: 'left',
                    backgroundColor: shop._id === currentShop._id ? colors.primaryLight : 'transparent',
                    fontFamily: font.family,
                  }}
                >
                  <div style={{ width: '24px', height: '24px', minWidth: '24px', borderRadius: '7px', backgroundColor: colors.surface, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${colors.border}` }}>
                    {shop.logo
                      ? <img src={shop.logo} alt={shop.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <Store size={13} color={colors.muted} strokeWidth={1.5} />
                    }
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: shop._id === currentShop._id ? 700 : 500, color: colors.dark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {shop.name}
                  </span>
                </button>
              ))}
              <div style={{ borderTop: `1px solid ${colors.border}` }}>
                <button
                  onClick={() => { setAddingShop(true); setOpen(false) }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 12px', border: 'none', cursor: 'pointer', textAlign: 'left',
                    backgroundColor: 'transparent', color: colors.primary, fontFamily: font.family,
                    fontSize: '13px', fontWeight: 600,
                  }}
                >
                  <Plus size={15} strokeWidth={2} /> Add another shop
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add-shop modal */}
      {addingShop && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '2rem 1rem' }}>
          <div style={{ backgroundColor: colors.surface, borderRadius: radius.xxl, maxWidth: '640px', width: '100%', position: 'relative' }}>
            <button
              onClick={() => setAddingShop(false)}
              aria-label="Close"
              style={{ position: 'absolute', top: '14px', right: '14px', zIndex: 10, width: '32px', height: '32px', borderRadius: '50%', border: 'none', backgroundColor: colors.white, boxShadow: shadow.card, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <X size={16} color={colors.dark} />
            </button>
            {renderAddShopFlow(() => setAddingShop(false))}
          </div>
        </div>
      )}
    </div>
  )
}