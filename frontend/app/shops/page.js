import { shopsAPI } from '@/lib/api'
import ShopsClient from '@/components/shops/ShopsClient'

const categories = ['All', 'Fashion', 'Electronics', 'Food', 'Beauty', 'Sports', 'Books', 'Home', 'Toys']

// Fix: this page previously never rendered until the browser downloaded
// JS, ran it, then fetched shops client-side — a blank/skeleton page on
// every visit. Fetching here means the first response already contains
// real shop data.
//
// Fix: the `category` URL param (e.g. /shops?category=fashion, which is
// exactly what the homepage category cards link to) was never read by
// this page at all — clicking a category card landed here showing
// *all* shops with no filter applied. Reading it server-side fixes the
// dead link and lets the very first fetch already be filtered correctly.
function resolveCategory(rawCategory) {
  if (!rawCategory) return undefined
  const match = categories.find((c) => c.toLowerCase() === String(rawCategory).toLowerCase())
  return match && match !== 'All' ? match : undefined
}

export default async function ShopsPage({ searchParams }) {
  const category = resolveCategory(searchParams?.category)
  const search = searchParams?.search || undefined
  const sort = searchParams?.sort || 'rating'

  let initialShops = []
  let loadError = false

  try {
    const res = await shopsAPI.getAll({ category, search, sort })
    initialShops = res.data.shops || []
  } catch (err) {
    console.error('Failed to load shops', err)
    loadError = true
  }

  return (
    <ShopsClient
      initialShops={initialShops}
      initialCategory={category || 'All'}
      initialSearch={search || ''}
      initialSort={sort}
      loadError={loadError}
    />
  )
}