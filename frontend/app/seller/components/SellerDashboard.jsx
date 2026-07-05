'use client'

import { useState } from 'react'
import { Store } from 'lucide-react'
import { colors, font, radius, transition } from '@/lib/styles'
import { DEFAULT_GRADIENT } from './shared'
import OverviewTab from './OverviewTab'
import OrdersTab from './OrdersTab'
import ProductsTab from './ProductsTab'
import ShopSettingsTab from './ShopSettingsTab'

export default function SellerDashboard({ shop, onShopUpdate }) {
  const [activeTab, setActiveTab] = useState('overview')

  const g           = shop.gradient || DEFAULT_GRADIENT
  const gradientCSS = `linear-gradient(${g.direction}, ${g.from}, ${g.to})`

  const tabs = [
    { key: 'overview', label: 'Overview'  },
    { key: 'orders',   label: 'Orders'    },
    { key: 'products', label: 'Products'  },
    { key: 'settings', label: 'Settings'  },
  ]

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(180deg, ${g.from}22 0%, transparent 320px)`, fontFamily: font.family }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1.25rem 5rem' }}>

        <div style={{
          background: gradientCSS,
          borderRadius: radius.xxl,
          padding: '1.5rem 1.75rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}>
          <div style={{ width: '52px', height: '52px', minWidth: '52px', borderRadius: radius.lg, backgroundColor: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Store size={24} color="#fff" strokeWidth={1.5} />
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', fontWeight: 700, color: '#fff', margin: 0 }}>{shop.name}</h1>
            <p style={{ fontSize: font.sm, color: 'rgba(255,255,255,0.75)', margin: '2px 0 0' }}>Seller Dashboard · {shop.category}</p>
          </div>
        </div>

        <div style={{ display: 'flex', borderBottom: `1px solid ${colors.border}`, marginBottom: '1.5rem', overflowX: 'auto' }}>
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '0.75rem 0', marginRight: '1.5rem', border: 'none',
                borderBottom: activeTab === tab.key ? `2px solid ${colors.primary}` : '2px solid transparent',
                backgroundColor: 'transparent', cursor: 'pointer',
                fontSize: font.base, fontWeight: 600, fontFamily: font.family,
                color: activeTab === tab.key ? colors.primary : colors.muted,
                transition: transition.fast, whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >{tab.label}</button>
          ))}
        </div>

        {activeTab === 'overview' && <OverviewTab shopId={shop._id} />}
        {activeTab === 'orders'   && <OrdersTab   shopId={shop._id} />}
        {activeTab === 'products' && <ProductsTab shopId={shop._id} />}
        {activeTab === 'settings' && <ShopSettingsTab shop={shop} onShopUpdate={onShopUpdate} />}
      </div>
    </div>
  )
}