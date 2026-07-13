import { shopsAPI, productsAPI } from '@/lib/api'
import ShopPageClient from '@/components/shops/ShopPageClient'

// Fix: this page previously fetched everything client-side on mount —
// blank/skeleton on every visit. Fetching here means real shop content
// is in the first response.
export const revalidate = 60

export default async function ShopPage({ params }) {
  const { id } = await params

  let shop = null
  let products = []
  let loadError = false

  try {
    const [shopRes, productsRes] = await Promise.all([
      shopsAPI.getOne(id),
      productsAPI.getByShop(id),
    ])
    shop = shopRes.data.shop
    products = productsRes.data.products || []
  } catch (err) {
    console.error('Failed to load shop page', err)
    loadError = true
  }

  return <ShopPageClient shop={shop} initialProducts={products} loadError={loadError} />
}