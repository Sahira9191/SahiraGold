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

      applyCoupon: (code, subtotal = 0) => {
        // Hardcoded built-in coupons that always work regardless of localStorage state
        const BUILTIN = [
          { id: 'cp1', code: 'SAHIRA10',   type: 'percent', value: 10,  minPurchase: 0,    maxUses: 9999, uses: 0, expires: '2099-12-31', active: true },
          { id: 'cp2', code: 'BIENVENIDA', type: 'percent', value: 15,  minPurchase: 0,    maxUses: 9999, uses: 0, expires: '2099-12-31', active: true },
          { id: 'cp3', code: 'SAHIRA500',  type: 'fixed',   value: 500, minPurchase: 2000, maxUses: 9999, uses: 0, expires: '2099-12-31', active: true },
          { id: 'cp4', code: 'VIP2026',    type: 'percent', value: 20,  minPurchase: 5000, maxUses: 9999, uses: 0, expires: '2099-12-31', active: true },
        ]

        // Also read admin-created coupons from localStorage
        let stored = []
        try { stored = JSON.parse(localStorage.getItem('sg_coupons') || '[]') } catch { /* ignore */ }

        // Merge: localStorage coupons override built-ins by code
        const storedCodes = new Set(stored.map((c) => c.code.toUpperCase()))
        const merged = [
          ...stored,
          ...BUILTIN.filter((c) => !storedCodes.has(c.code.toUpperCase())),
        ]

        const found = merged.find(
          (c) => c.code.toUpperCase() === code.trim().toUpperCase()
        )

        if (!found) return { success: false, error: 'Cupón no encontrado' }
        if (!found.active) return { success: false, error: 'Este cupón no está activo' }
        if (new Date(found.expires) < new Date()) return { success: false, error: 'Este cupón ha expirado' }
        if (found.uses >= found.maxUses) return { success: false, error: 'Este cupón ya fue agotado' }
        if (found.minPurchase > 0 && subtotal < found.minPurchase) {
          const fmt = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)
          return { success: false, error: `Compra mínima de ${fmt(found.minPurchase)} requerida` }
        }

        // Increment uses count in localStorage (only for admin-created ones)
        try {
          const updated = stored.map((c) =>
            c.id === found.id ? { ...c, uses: c.uses + 1 } : c
          )
          localStorage.setItem('sg_coupons', JSON.stringify(updated))
        } catch { /* ignore */ }

        const coupon = { code: found.code.toUpperCase(), type: found.type, value: found.value }
        set({ coupon })
        return { success: true, coupon }
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
