import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Fix: removeItem/updateQuantity previously matched on `id` only, while
// addItem matches on id + selectedSize + selectedColor. That mismatch
// meant removing/updating one variant (e.g. size M) could silently
// affect another variant of the same product (e.g. size L). All three
// now use the same variant key.
const variantKey = (item) => `${item.id}__${item.selectedSize ?? ''}__${item.selectedColor ?? ''}`

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const existing = get().items.find((i) => variantKey(i) === variantKey(product))
        if (existing) {
          set({
            items: get().items.map((i) =>
              variantKey(i) === variantKey(product) ? { ...i, quantity: i.quantity + 1 } : i
            ),
          })
        } else {
          set({ items: [...get().items, { ...product, quantity: 1 }] })
        }
      },

      removeItem: (id, selectedSize, selectedColor) => {
        const target = variantKey({ id, selectedSize, selectedColor })
        set({ items: get().items.filter((i) => variantKey(i) !== target) })
      },

      updateQuantity: (id, selectedSize, selectedColor, quantity) => {
        if (quantity < 1) return
        const target = variantKey({ id, selectedSize, selectedColor })
        set({
          items: get().items.map((i) => (variantKey(i) === target ? { ...i, quantity } : i)),
        })
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      getTotalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: 'cart-storage',
      // Fix: by default, persist rehydrates from localStorage as soon as
      // the store is created on the client — which happens *during* the
      // initial render, after the server already rendered with an empty
      // cart. That mismatch (server: 0 items, client: real localStorage
      // count) is exactly what causes "Hydration failed" errors on
      // anything that displays cart state (e.g. a Navbar badge).
      // skipHydration defers that read until we explicitly trigger it
      // (see useCartHydration below), so the first client render still
      // matches the server exactly, and the real data fills in one tick
      // later — same pattern React itself recommends for this case.
      skipHydration: true,
    }
  )
)

// Fix: call this once, from a top-level client component (e.g. inside
// Navbar or a Providers wrapper) in a useEffect, to trigger the
// deferred rehydration after mount:
//
//   useEffect(() => { useCartStore.persist.rehydrate() }, [])
//
// Anything reading cart state before that point (server render + the
// first client render) will correctly see the empty default — which is
// fine as long as UI that shows a cart count/badge doesn't render
// differently between those two passes. See exact wiring note below.
export const rehydrateCart = () => useCartStore.persist.rehydrate()

export default useCartStore