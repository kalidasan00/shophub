import { shopsAPI, productsAPI } from '@/lib/api'
import HomeClient from '@/components/home/HomeClient'

// Fix: this page previously fetched all homepage data client-side
// ('use client' + useEffect), meaning visitors saw a blank page while
// JS downloaded/executed/fetched, and search engines couldn't index
// product/shop names on the homepage. Fetching here on the server means
// the HTML already contains real content on first response.
//
// revalidate: page is regenerated at most once every 60s (ISR) instead
// of on every single request, so we're not hammering the API for every
// visitor while still keeping the homepage reasonably fresh.
export const revalidate = 60

export default async function HomePage() {
  let shops: any[] = []
  let dealProducts: any[] = []
  let topRatedProducts: any[] = []
  let stats = { shopCount: 0, productCount: 0 }
  let loadError = false

  try {
    const [shopsRes, dealsRes, topRatedRes] = await Promise.all([
      shopsAPI.getAll({ limit: 4, sort: 'rating' }),
      productsAPI.getAll({ tag: 'Sale', limit: 10 }),
      productsAPI.getAll({ sort: 'rating', limit: 4 }),
    ])
    shops = shopsRes.data.shops || []
    dealProducts = dealsRes.data.products || []
    topRatedProducts = topRatedRes.data.products || []
    stats = {
      shopCount: shopsRes.data.total || 0,
      productCount: topRatedRes.data.total || 0,
    }
  } catch (err) {
    // Fix: previously only console.error'd and left the page silently
    // empty. Now we surface a real (if minimal) error state to the user
    // instead of a homepage that looks broken with no explanation.
    console.error('Failed to load homepage data', err)
    loadError = true
  }

  return (
    <HomeClient
      shops={shops}
      dealProducts={dealProducts}
      topRatedProducts={topRatedProducts}
      stats={stats}
      loadError={loadError}
    />
  )
}