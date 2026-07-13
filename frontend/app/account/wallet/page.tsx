'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft, Wallet as WalletIcon, ArrowDownLeft, ArrowUpRight,
  Plus, RefreshCcw, Gift, ShoppingBag, CreditCard,
} from 'lucide-react'
import { colors, font, radius, shadow } from '@/lib/styles'

/* ── Shared style tokens (reused from account hub) ── */
const cardStyle = {
  backgroundColor: colors.white,
  borderRadius: radius.xxl,
  border: `1px solid ${colors.border}`,
  padding: 'clamp(1.25rem, 3vw, 1.75rem)',
  boxShadow: shadow.card,
}

const primaryBtnStyle: React.CSSProperties = {
  backgroundColor: colors.primary,
  color: colors.white,
  border: 'none',
  borderRadius: radius.md,
  padding: '12px 24px',
  fontSize: '14px',
  fontWeight: '600',
  fontFamily: font.family,
  cursor: 'pointer',
}

const secondaryBtnStyle: React.CSSProperties = {
  backgroundColor: colors.white,
  color: colors.dark,
  border: `1px solid ${colors.border}`,
  borderRadius: radius.md,
  padding: '12px 24px',
  fontSize: '14px',
  fontWeight: '600',
  fontFamily: font.family,
  cursor: 'pointer',
}

const sectionLabelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: '600',
  color: colors.muted,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  margin: '0 0 8px 2px',
}

/* ── Mock data (frontend-first, backend wiring comes later) ── */
type Transaction = {
  id: string
  type: 'credit' | 'debit'
  source: 'refund' | 'cashback' | 'order' | 'topup' | 'adjustment'
  amount: number
  description: string
  date: string
  status: 'completed' | 'pending' | 'failed'
}

const MOCK_BALANCE = {
  available: 1245.5,
  pending: 320.0,
  currency: '₹',
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'txn_001', type: 'credit', source: 'refund',     amount: 899,  description: 'Refund for order #SH-10234',       date: '2026-07-10', status: 'completed' },
  { id: 'txn_002', type: 'debit',  source: 'order',      amount: 450,  description: 'Payment for order #SH-10256',       date: '2026-07-08', status: 'completed' },
  { id: 'txn_003', type: 'credit', source: 'cashback',   amount: 60,   description: 'Cashback on order #SH-10221',       date: '2026-07-05', status: 'completed' },
  { id: 'txn_004', type: 'credit', source: 'topup',      amount: 500,  description: 'Added money via UPI',               date: '2026-07-02', status: 'completed' },
  { id: 'txn_005', type: 'credit', source: 'refund',     amount: 320,  description: 'Refund for order #SH-10199',        date: '2026-06-29', status: 'pending' },
  { id: 'txn_006', type: 'debit',  source: 'order',      amount: 150,  description: 'Payment for order #SH-10188',       date: '2026-06-25', status: 'completed' },
  { id: 'txn_007', type: 'credit', source: 'adjustment', amount: 100,  description: 'Goodwill credit — support ticket',  date: '2026-06-20', status: 'completed' },
]

const sourceIconMap: Record<Transaction['source'], any> = {
  refund: RefreshCcw,
  cashback: Gift,
  order: ShoppingBag,
  topup: CreditCard,
  adjustment: WalletIcon,
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

/* ── Transaction Row ── */
function TransactionRow({ txn }: { txn: Transaction }) {
  const Icon = sourceIconMap[txn.source]
  const isCredit = txn.type === 'credit'

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '14px',
      padding: '14px 0', borderBottom: `1px solid ${colors.border}`,
    }}>
      <div style={{
        width: '40px', height: '40px', minWidth: '40px', borderRadius: '50%',
        backgroundColor: isCredit ? '#F0FDF4' : '#FEF2F2',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={18} color={isCredit ? '#16A34A' : '#EF4444'} strokeWidth={1.8} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: font.base, fontWeight: '500', color: colors.dark, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {txn.description}
        </p>
        <p style={{ fontSize: '12px', color: colors.muted, margin: '2px 0 0' }}>
          {formatDate(txn.date)}
          {txn.status === 'pending' && (
            <span style={{ color: '#D97706', fontWeight: '600', marginLeft: '8px' }}>Pending</span>
          )}
        </p>
      </div>

      <span style={{ fontSize: '14px', fontWeight: '700', color: isCredit ? '#16A34A' : colors.dark, whiteSpace: 'nowrap' }}>
        {isCredit ? '+' : '−'}{MOCK_BALANCE.currency}{txn.amount.toFixed(2)}
      </span>
    </div>
  )
}

/* ── Wallet Page ── */
export default function WalletPage() {
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all')

  const filteredTxns = MOCK_TRANSACTIONS.filter((t) => filter === 'all' || t.type === filter)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.surface, fontFamily: font.family }}>

      {/* Header */}
      <div style={{ backgroundColor: colors.white, borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'clamp(1.25rem, 4vw, 2rem) 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={() => router.push('/account')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
              aria-label="Back to account"
            >
              <ChevronLeft size={22} color={colors.dark} />
            </button>
            <h1 style={{ fontSize: '17px', fontWeight: '700', color: colors.dark, margin: 0 }}>Wallet</h1>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'clamp(1.25rem, 3vw, 2rem) 1.25rem 4rem' }}>

        {/* Balance card */}
        <div style={{
          ...cardStyle,
          background: `linear-gradient(135deg, ${colors.primary} 0%, #4F46E5 100%)`,
          border: 'none',
          marginBottom: '1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
            <WalletIcon size={20} color={colors.white} strokeWidth={1.8} />
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
              Available balance
            </span>
          </div>

          <p style={{ fontSize: 'clamp(2rem, 6vw, 2.5rem)', fontWeight: '700', color: colors.white, margin: '0 0 1.25rem' }}>
            {MOCK_BALANCE.currency}{MOCK_BALANCE.available.toFixed(2)}
          </p>

          {MOCK_BALANCE.pending > 0 && (
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', margin: '0 0 1.5rem' }}>
              {MOCK_BALANCE.currency}{MOCK_BALANCE.pending.toFixed(2)} pending clearance
            </p>
          )}

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button style={{
              ...primaryBtnStyle,
              backgroundColor: colors.white,
              color: colors.primary,
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <Plus size={16} strokeWidth={2.2} /> Add money
            </button>
            <button style={{
              ...secondaryBtnStyle,
              backgroundColor: 'transparent',
              color: colors.white,
              border: '1px solid rgba(255,255,255,0.4)',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <ArrowUpRight size={16} strokeWidth={2.2} /> Withdraw
            </button>
          </div>
        </div>

        {/* Transactions */}
        <p style={sectionLabelStyle}>Transaction history</p>
        <div style={cardStyle}>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '0.5rem' }}>
            {(['all', 'credit', 'debit'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '6px 16px',
                  borderRadius: radius.md,
                  border: `1px solid ${filter === f ? colors.primary : colors.border}`,
                  backgroundColor: filter === f ? colors.primaryLight : 'transparent',
                  color: filter === f ? colors.primary : colors.muted,
                  fontSize: '13px',
                  fontWeight: '600',
                  fontFamily: font.family,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {f === 'all' ? 'All' : f === 'credit' ? 'Money in' : 'Money out'}
              </button>
            ))}
          </div>

          <div style={{ marginTop: '0.5rem' }}>
            {filteredTxns.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <ArrowDownLeft size={32} color={colors.muted} style={{ marginBottom: '0.75rem' }} />
                <p style={{ fontSize: '14px', color: colors.muted, margin: 0 }}>No transactions in this category yet.</p>
              </div>
            ) : (
              filteredTxns.map((txn) => <TransactionRow key={txn.id} txn={txn} />)
            )}
          </div>
        </div>
      </div>
    </div>
  )
}