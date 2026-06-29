import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Trash2, Plus, Minus, Tag, ArrowRight, Truck, CreditCard, Landmark } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import useCartStore from '../../store/cartStore'
import useSettingsStore from '../../store/settingsStore'

const useFormatPrice = () => useSettingsStore(s => s.formatPrice)

/* ─── Financing preview strip ─────────────────── */
function FinancingPreview({ total }) {
  const formatPrice = useFormatPrice()
  const plans = [
    { months: 3,  label: '3 MSI',  rate: 0 },
    { months: 6,  label: '6 MSI',  rate: 0 },
    { months: 12, label: '12 MSI', rate: 0 },
    { months: 18, label: '18 MSI', rate: 0.079 },
  ]

  const bestPlan = plans[1]
  const monthly = bestPlan.rate === 0
    ? total / bestPlan.months
    : (total * (bestPlan.rate / 12)) / (1 - Math.pow(1 + bestPlan.rate / 12, -bestPlan.months))

  return (
    <div className="mx-6 mb-3 rounded-none border border-gold-200 dark:border-gold-800 bg-gradient-to-r from-gold-50 to-amber-50 dark:from-gold-950/30 dark:to-amber-950/30 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Landmark size={13} className="text-gold-600 flex-shrink-0" />
        <span className="text-xs font-semibold text-gold-700 dark:text-gold-400 tracking-wide uppercase">
          Financiamiento disponible
        </span>
      </div>
      <p className="text-xs text-obsidian-600 dark:text-obsidian-400">
        Desde{' '}
        <strong className="text-obsidian-900 dark:text-cream-100 font-display text-sm">
          {formatPrice(total / 3)}/mes
        </strong>{' '}
        · 3, 6, 12 ó 18 meses
      </p>
      <div className="flex gap-1.5 mt-2">
        {plans.map(p => (
          <span
            key={p.months}
            className="text-[9px] font-bold tracking-widest border border-gold-300 dark:border-gold-700 text-gold-700 dark:text-gold-400 px-1.5 py-0.5"
          >
            {p.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function CartDrawer() {
  const isOpen      = useCartStore((s) => s.isOpen)
  const closeCart   = useCartStore((s) => s.closeCart)
  const items       = useCartStore((s) => s.items)
  const removeItem  = useCartStore((s) => s.removeItem)
  const updateQty   = useCartStore((s) => s.updateQty)
  const applyCoupon = useCartStore((s) => s.applyCoupon)
  const removeCoupon = useCartStore((s) => s.removeCoupon)
  const coupon      = useCartStore((s) => s.coupon)
  const formatPrice = useFormatPrice()

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const discount = (() => {
    if (!coupon) return 0
    if (coupon.type === 'percent') return Math.floor(subtotal * coupon.value / 100)
    if (coupon.type === 'fixed')   return Math.min(coupon.value, subtotal)
    return 0
  })()
  const shipping = (subtotal - discount) >= 5000 ? 0 : 299
  const total    = subtotal - discount + shipping

  const [couponCode, setCouponCode]       = useState('')
  const [couponError, setCouponError]     = useState('')
  const [couponSuccess, setCouponSuccess] = useState('')

  const handleCoupon = (e) => {
    e.preventDefault()
    setCouponError('')
    setCouponSuccess('')
    const result = applyCoupon(couponCode)
    if (result.success) {
      setCouponSuccess(`¡Cupón aplicado! ${result.coupon.type === 'percent' ? result.coupon.value + '%' : formatPrice(result.coupon.value)} de descuento`)
      setCouponCode('')
    } else {
      setCouponError(result.error)
    }
  }

  const toFreeShipping = 5000 - (subtotal - discount)
  const progressPct    = Math.min(((subtotal - discount) / 5000) * 100, 100)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white dark:bg-obsidian-950
                       z-[70] flex flex-col shadow-luxury"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-cream-200 dark:border-obsidian-800">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-gold-500" />
                <h2 className="font-display text-lg font-semibold text-obsidian-900 dark:text-cream-100">
                  Mi Carrito
                </h2>
                {items.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-gold-500 text-obsidian-950 text-xs font-bold flex items-center justify-center">
                    {items.reduce((s, i) => s + i.qty, 0)}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-2 text-obsidian-400 hover:text-obsidian-700 dark:hover:text-cream-200 transition-colors"
                aria-label="Cerrar carrito"
              >
                <X size={20} />
              </button>
            </div>

            {/* Free shipping progress bar */}
            {items.length > 0 && (
              <div className="px-6 py-3 bg-cream-50 dark:bg-obsidian-900 border-b border-cream-100 dark:border-obsidian-800">
                {toFreeShipping > 0 ? (
                  <>
                    <p className="text-xs text-obsidian-600 dark:text-obsidian-400 mb-2">
                      <Truck size={12} className="inline mr-1 text-gold-500" />
                      Agrega <strong className="text-gold-600">{formatPrice(toFreeShipping)}</strong> más para envío gratis
                    </p>
                    <div className="h-1 bg-cream-200 dark:bg-obsidian-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gold-gradient rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPct}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-green-600 font-medium">
                    <Truck size={12} className="inline mr-1" /> ¡Envío gratis aplicado! 🎉
                  </p>
                )}
              </div>
            )}

            {/* Items list */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <AnimatePresence initial={false}>
                {items.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center h-64 text-center"
                  >
                    <ShoppingBag size={48} className="text-cream-300 dark:text-obsidian-700 mb-4" />
                    <p className="font-display text-lg text-obsidian-400 dark:text-obsidian-500 mb-1">Tu carrito está vacío</p>
                    <p className="text-sm text-obsidian-400 mb-6">Descubre nuestra colección de joyería de lujo</p>
                    <button onClick={closeCart} className="btn-gold text-xs px-6 py-2.5">
                      Explorar Catálogo
                    </button>
                  </motion.div>
                ) : (
                  items.map((item) => (
                    <motion.div
                      key={item.key}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex gap-4 py-4 border-b border-cream-100 dark:border-obsidian-800 last:border-0"
                    >
                      <div className="w-20 h-20 bg-cream-100 dark:bg-obsidian-900 flex-shrink-0 overflow-hidden">
                        <img
                          src={item.product.images?.[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-display text-sm font-medium text-obsidian-900 dark:text-cream-100 leading-tight mb-0.5 line-clamp-2">
                          {item.product.name}
                        </p>
                        {item.variant && (
                          <p className="text-xs text-obsidian-400 mb-2">{item.variant.name}: {item.variant.value}</p>
                        )}

                        <div className="flex items-center justify-between">
                          {/* Qty controls */}
                          <div className="flex items-center border border-cream-200 dark:border-obsidian-700">
                            <button
                              onClick={() => updateQty(item.key, item.qty - 1)}
                              className="w-7 h-7 flex items-center justify-center text-obsidian-500 hover:text-gold-600 transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-8 text-center text-sm font-medium text-obsidian-900 dark:text-cream-100">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => updateQty(item.key, item.qty + 1)}
                              className="w-7 h-7 flex items-center justify-center text-obsidian-500 hover:text-gold-600 transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-display text-sm font-semibold text-obsidian-900 dark:text-cream-100">
                              {formatPrice(item.price * item.qty)}
                            </span>
                            <button
                              onClick={() => removeItem(item.key)}
                              className="text-obsidian-300 hover:text-red-400 transition-colors"
                              aria-label="Eliminar producto"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-cream-200 dark:border-obsidian-800 pt-4 space-y-4">
                {/* Financing strip */}
                <FinancingPreview total={total} />

                <div className="px-6 space-y-4">
                  {/* Coupon */}
                  {!coupon ? (
                    <form onSubmit={handleCoupon} className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-obsidian-400" />
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Código de descuento"
                          className="input-luxury pl-9 py-2.5 text-xs"
                        />
                      </div>
                      <button type="submit" className="btn-outline-gold px-4 py-2.5 text-xs">
                        Aplicar
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between bg-gold-50 dark:bg-gold-950/20 border border-gold-200 dark:border-gold-800 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Tag size={14} className="text-gold-600" />
                        <span className="text-xs font-medium text-gold-700 dark:text-gold-400">{coupon.code}</span>
                      </div>
                      <button onClick={removeCoupon} className="text-obsidian-400 hover:text-red-400">
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  {couponError   && <p className="text-xs text-red-500">{couponError}</p>}
                  {couponSuccess && <p className="text-xs text-green-600">{couponSuccess}</p>}

                  {/* Totals */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-obsidian-600 dark:text-obsidian-400">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Descuento</span>
                        <span>- {formatPrice(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-obsidian-600 dark:text-obsidian-400">
                      <span>Envío</span>
                      <span>{shipping === 0 ? <span className="text-green-600">Gratis</span> : formatPrice(shipping)}</span>
                    </div>
                    <div className="flex justify-between font-display text-base font-semibold text-obsidian-900 dark:text-cream-100 pt-2 border-t border-cream-200 dark:border-obsidian-700">
                      <span>Total</span>
                      <span className="text-gold-gradient">{formatPrice(total)}</span>
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="space-y-2 pb-6">
                    <Link
                      to="/checkout"
                      onClick={closeCart}
                      className="btn-gold w-full justify-center text-sm"
                      id="cart-checkout-btn"
                    >
                      <CreditCard size={16} /> Pagar ahora
                    </Link>
                    <Link
                      to="/checkout?mode=financiamiento"
                      onClick={closeCart}
                      className="btn-outline-gold w-full justify-center text-sm"
                      id="cart-finance-btn"
                    >
                      <Landmark size={16} /> Financiar mi compra
                    </Link>
                    <button
                      onClick={closeCart}
                      className="btn-ghost w-full justify-center text-xs text-obsidian-500"
                    >
                      Seguir comprando
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
