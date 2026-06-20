import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      coupon: null,
      couponDiscount: 0,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      addItem: (product, variant = null, qty = 1) => {
        const { items } = get()
        const key = `${product.id}-${variant?.id || 'default'}`
        const existing = items.find((i) => i.key === key)

        if (existing) {
          set({
            items: items.map((i) =>
              i.key === key ? { ...i, qty: i.qty + qty } : i
            ),
          })
        } else {
          set({
            items: [
              ...items,
              {
                key,
                product,
                variant,
                qty,
                price: product.price + (variant?.price_modifier || 0),
              },
            ],
          })
        }
      },

      removeItem: (key) => {
        set({ items: get().items.filter((i) => i.key !== key) })
      },

      updateQty: (key, qty) => {
        if (qty < 1) {
          get().removeItem(key)
          return
        }
        set({
          items: get().items.map((i) => (i.key === key ? { ...i, qty } : i)),
        })
      },

      clearCart: () => set({ items: [], coupon: null, couponDiscount: 0 }),

      applyCoupon: (code) => {
        const VALID_COUPONS = {
          SAHIRA10: { type: 'percent', value: 10 },
          BIENVENIDA: { type: 'percent', value: 15 },
          SAHIRA500: { type: 'fixed', value: 500 },
        }
        const coupon = VALID_COUPONS[code.toUpperCase()]
        if (coupon) {
          set({ coupon: { code: code.toUpperCase(), ...coupon } })
          return { success: true, coupon }
        }
        return { success: false, error: 'Cupón inválido o expirado' }
      },

      removeCoupon: () => set({ coupon: null }),

      // Computed getters
      get itemCount() {
        return get().items.reduce((sum, i) => sum + i.qty, 0)
      },

      get subtotal() {
        return get().items.reduce((sum, i) => sum + i.price * i.qty, 0)
      },

      get discount() {
        const { coupon, subtotal } = get()
        if (!coupon) return 0
        if (coupon.type === 'percent') return Math.floor(subtotal * coupon.value / 100)
        if (coupon.type === 'fixed') return Math.min(coupon.value, subtotal)
        return 0
      },

      get shipping() {
        const sub = get().subtotal - get().discount
        return sub >= 5000 ? 0 : 299
      },

      get tax() {
        const sub = get().subtotal - get().discount
        return Math.floor(sub * 0.16)
      },

      get total() {
        const { subtotal, discount, shipping, tax } = get()
        return subtotal - discount + shipping + tax
      },
    }),
    {
      name: 'sahira-cart',
      partialize: (state) => ({ items: state.items, coupon: state.coupon }),
    }
  )
)

export default useCartStore
