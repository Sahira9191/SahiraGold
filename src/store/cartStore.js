import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import supabase from '../lib/supabase'

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      coupon: null,
      couponDiscount: 0,

      openCart:   () => set({ isOpen: true }),
      closeCart:  () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      addItem: (product, variant = null, qty = 1) => {
        const { items } = get()
        const key = `${product.id}-${variant?.id || 'default'}`
        const existing = items.find((i) => i.key === key)
        if (existing) {
          set({ items: items.map((i) => i.key === key ? { ...i, qty: i.qty + qty } : i) })
        } else {
          set({ items: [...items, { key, product, variant, qty, price: product.price + (variant?.price_modifier || 0) }] })
        }
      },

      removeItem: (key) => set({ items: get().items.filter((i) => i.key !== key) }),

      updateQty: (key, qty) => {
        if (qty < 1) { get().removeItem(key); return }
        set({ items: get().items.map((i) => (i.key === key ? { ...i, qty } : i)) })
      },

      clearCart: () => set({ items: [], coupon: null, couponDiscount: 0 }),

      applyCoupon: async (code, subtotal = 0) => {
        const fmtMXN = (n) =>
          new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)

        let found = null

        // 1. Try Supabase first
        try {
          const { data } = await supabase
            .from('coupons')
            .select('*')
            .ilike('code', code.trim())
            .single()
          if (data) {
            found = {
              id: data.id,
              code: data.code,
              type: data.type,
              value: Number(data.value),
              minPurchase: Number(data.min_purchase),
              maxUses: data.max_uses,
              uses: data.uses,
              expires: data.expires,
              active: data.active,
            }
          }
        } catch { /* Supabase unavailable, fall through to built-ins */ }

        // 2. Fall back to built-in coupons if not found in Supabase
        if (!found) {
          const BUILTIN = [
            { id: 'cp1', code: 'SAHIRA10',   type: 'percent', value: 10,  minPurchase: 0,    maxUses: 9999, uses: 0, expires: '2099-12-31', active: true },
            { id: 'cp2', code: 'BIENVENIDA', type: 'percent', value: 15,  minPurchase: 0,    maxUses: 9999, uses: 0, expires: '2099-12-31', active: true },
            { id: 'cp3', code: 'SAHIRA500',  type: 'fixed',   value: 500, minPurchase: 2000, maxUses: 9999, uses: 0, expires: '2099-12-31', active: true },
            { id: 'cp4', code: 'VIP2026',    type: 'percent', value: 20,  minPurchase: 5000, maxUses: 9999, uses: 0, expires: '2099-12-31', active: true },
          ]
          found = BUILTIN.find((c) => c.code.toUpperCase() === code.trim().toUpperCase()) || null
        }

        if (!found)                               return { success: false, error: 'Cupón no encontrado' }
        if (!found.active)                        return { success: false, error: 'Este cupón no está activo' }
        if (new Date(found.expires) < new Date()) return { success: false, error: 'Este cupón ha expirado' }
        if (found.uses >= found.maxUses)          return { success: false, error: 'Este cupón ya fue agotado' }
        if (found.minPurchase > 0 && subtotal < found.minPurchase)
          return { success: false, error: `Compra mínima de ${fmtMXN(found.minPurchase)} requerida` }

        // Increment uses in Supabase
        try { await supabase.from('coupons').update({ uses: found.uses + 1 }).eq('id', found.id) } catch { /* ignore */ }

        const coupon = { code: found.code.toUpperCase(), type: found.type, value: found.value }
        set({ coupon })
        return { success: true, coupon }
      },

      removeCoupon: () => set({ coupon: null }),

      // Computed getters
      get itemCount() { return get().items.reduce((sum, i) => sum + i.qty, 0) },
      get subtotal()  { return get().items.reduce((sum, i) => sum + i.price * i.qty, 0) },
      get discount() {
        const { coupon, subtotal } = get()
        if (!coupon) return 0
        if (coupon.type === 'percent') return Math.floor(subtotal * coupon.value / 100)
        if (coupon.type === 'fixed')   return Math.min(coupon.value, subtotal)
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
