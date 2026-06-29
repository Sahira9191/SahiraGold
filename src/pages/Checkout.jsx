import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Check, ArrowLeft, ArrowRight, CreditCard, Truck, User,
  Landmark, Shield, ChevronDown, ChevronUp,
  BadgePercent, CalendarClock, Info
} from 'lucide-react'
import useCartStore from '../store/cartStore'
import useSettingsStore from '../store/settingsStore'

const useFormatPrice = () => useSettingsStore(s => s.formatPrice)

/* ─── Financing plans config ─────────────────── */
const FINANCING_PLANS = [
  {
    id: 'full',
    label: 'Pago completo',
    months: 0,
    rate: 0,
    badge: null,
    icon: CreditCard,
    description: 'Pago único con cualquier tarjeta',
  },
  {
    id: '3msi',
    label: '3 meses sin intereses',
    months: 3,
    rate: 0,
    badge: 'MSI',
    icon: BadgePercent,
    description: 'Tarjetas participantes · Sin cargos adicionales',
  },
  {
    id: '6msi',
    label: '6 meses sin intereses',
    months: 6,
    rate: 0,
    badge: 'MSI',
    icon: BadgePercent,
    description: 'Tarjetas participantes · Sin cargos adicionales',
    recommended: true,
  },
  {
    id: '12msi',
    label: '12 meses sin intereses',
    months: 12,
    rate: 0,
    badge: 'MSI',
    icon: BadgePercent,
    description: 'Tarjetas participantes · Sin cargos adicionales',
  },
  {
    id: '18mc',
    label: '18 meses con intereses',
    months: 18,
    rate: 0.079,
    badge: 'MC',
    icon: CalendarClock,
    description: 'Tasa anual 7.9% · BBVA, Santander, Banorte',
  },
]

function getMonthlyPayment(total, plan) {
  if (plan.months === 0) return total
  if (plan.rate === 0) return total / plan.months
  const r = plan.rate / 12
  return (total * r) / (1 - Math.pow(1 + r, -plan.months))
}

/* ─── Step indicator ─────────────────────────── */
const STEPS = [
  { id: 1, label: 'Contacto', icon: User },
  { id: 2, label: 'Envío',    icon: Truck },
  { id: 3, label: 'Pago',     icon: CreditCard },
]

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center mb-10">
      {STEPS.map((step, i) => {
        const Icon   = step.icon
        const done   = current > step.id
        const active = current === step.id
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-10 h-10 flex items-center justify-center border-2 transition-all duration-300
                  ${done   ? 'bg-gold-500 border-gold-500 text-obsidian-950' :
                    active ? 'border-gold-500 text-gold-500' :
                             'border-cream-300 dark:border-obsidian-700 text-obsidian-400'}`}
              >
                {done ? <Check size={16} /> : <Icon size={16} />}
              </div>
              <span className={`text-xs tracking-wider hidden sm:block ${active ? 'text-gold-600 font-medium' : 'text-obsidian-400'}`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-16 sm:w-24 mx-3 transition-colors ${current > step.id ? 'bg-gold-500' : 'bg-cream-200 dark:bg-obsidian-700'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ─── Order Summary sidebar ──────────────────── */
function OrderSummary({ items, selectedPlan }) {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
  const shipping = subtotal >= 5000 ? 0 : 299
  const total    = subtotal + shipping
  const monthly  = selectedPlan ? getMonthlyPayment(total, selectedPlan) : null

  return (
    <div className="bg-cream-50 dark:bg-obsidian-900 border border-cream-200 dark:border-obsidian-800 p-6">
      <h3 className="font-display text-lg text-obsidian-900 dark:text-cream-100 mb-4">Resumen del pedido</h3>

      <div className="space-y-3 mb-4">
        {items.map(item => (
          <div key={item.key} className="flex gap-3">
            <div className="w-14 h-14 bg-cream-100 dark:bg-obsidian-800 flex-shrink-0 overflow-hidden">
              <img src={item.product.images?.[0]} alt={item.product.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-obsidian-800 dark:text-cream-200 line-clamp-2">{item.product.name}</p>
              <p className="text-xs text-obsidian-400 mt-0.5">x{item.qty}</p>
            </div>
            <span className="text-xs font-medium text-obsidian-900 dark:text-cream-100">{formatPrice(item.price * item.qty)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-cream-200 dark:border-obsidian-700 pt-4 space-y-2 text-sm">
        <div className="flex justify-between text-obsidian-600 dark:text-obsidian-400">
          <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-obsidian-600 dark:text-obsidian-400">
          <span>Envío</span>
          <span>{shipping === 0 ? <span className="text-green-600">Gratis</span> : formatPrice(shipping)}</span>
        </div>
        <div className="flex justify-between font-display text-base font-semibold text-obsidian-900 dark:text-cream-100 pt-2 border-t border-cream-200 dark:border-obsidian-700">
          <span>Total</span>
          <span className="text-gold-gradient">{formatPrice(total)}</span>
        </div>

        {/* Financing preview in sidebar */}
        {selectedPlan && selectedPlan.months > 0 && monthly && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 pt-3 border-t border-gold-200 dark:border-gold-800"
          >
            <div className="flex items-center gap-2 mb-1">
              <Landmark size={12} className="text-gold-600" />
              <span className="text-xs font-semibold text-gold-700 dark:text-gold-400 tracking-wide uppercase">
                Plan de pago
              </span>
            </div>
            <p className="text-xs text-obsidian-600 dark:text-obsidian-400">
              {selectedPlan.months} pagos de{' '}
              <strong className="text-obsidian-900 dark:text-cream-100 font-display">
                {formatPrice(monthly)}
              </strong>
              /mes
            </p>
            {selectedPlan.rate > 0 && (
              <p className="text-[10px] text-obsidian-400 mt-0.5">
                Total a pagar: {formatPrice(monthly * selectedPlan.months)}
                {' '}· CAT {(selectedPlan.rate * 100).toFixed(1)}%
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

/* ─── Financing selector ─────────────────────── */
function FinancingSelector({ total, selectedPlan, onSelect }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium tracking-wide text-obsidian-700 dark:text-cream-200 uppercase">
          Selecciona tu forma de pago
        </h3>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-obsidian-400 hover:text-gold-600 transition-colors"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-2">
              {FINANCING_PLANS.map(plan => {
                const Icon     = plan.icon
                const monthly  = getMonthlyPayment(total, plan)
                const isActive = selectedPlan?.id === plan.id
                const totalToPay = plan.months > 0 ? monthly * plan.months : total

                return (
                  <motion.button
                    key={plan.id}
                    type="button"
                    onClick={() => onSelect(plan)}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full text-left border-2 p-4 transition-all duration-200 relative
                      ${isActive
                        ? 'border-gold-500 bg-gold-50 dark:bg-gold-950/20'
                        : 'border-cream-200 dark:border-obsidian-700 hover:border-gold-300 dark:hover:border-gold-700'
                      }`}
                    id={`plan-${plan.id}`}
                  >
                    {plan.recommended && (
                      <span className="absolute top-0 right-0 bg-gold-500 text-obsidian-950 text-[9px] font-bold tracking-widest px-2 py-0.5 uppercase">
                        Recomendado
                      </span>
                    )}

                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                        ${isActive ? 'border-gold-500 bg-gold-500' : 'border-cream-300 dark:border-obsidian-600'}`}
                      >
                        {isActive && <div className="w-2 h-2 rounded-full bg-obsidian-950" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Icon size={14} className={isActive ? 'text-gold-600' : 'text-obsidian-500'} />
                          <span className={`text-sm font-medium ${isActive ? 'text-gold-700 dark:text-gold-400' : 'text-obsidian-800 dark:text-cream-100'}`}>
                            {plan.label}
                          </span>
                          {plan.badge && (
                            <span className={`text-[9px] font-bold tracking-widest px-1.5 py-0.5 border
                              ${plan.badge === 'MSI'
                                ? 'border-green-400 text-green-600 bg-green-50 dark:bg-green-950/20'
                                : 'border-amber-400 text-amber-600 bg-amber-50 dark:bg-amber-950/20'
                              }`}
                            >
                              {plan.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-obsidian-400 mb-2">{plan.description}</p>

                        <div className="flex items-baseline gap-2">
                          {plan.months > 0 ? (
                            <>
                              <span className="font-display text-lg font-semibold text-obsidian-900 dark:text-cream-100">
                                {formatPrice(monthly)}
                              </span>
                              <span className="text-xs text-obsidian-500">/mes · {plan.months} pagos</span>
                              {plan.rate > 0 && (
                                <span className="text-xs text-amber-600">
                                  Total: {formatPrice(totalToPay)}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="font-display text-lg font-semibold text-obsidian-900 dark:text-cream-100">
                              {formatPrice(total)} único pago
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>

            {/* Legal note */}
            <div className="flex items-start gap-2 mt-3 p-3 bg-cream-50 dark:bg-obsidian-900 border border-cream-200 dark:border-obsidian-800">
              <Info size={12} className="text-obsidian-400 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-obsidian-400 leading-relaxed">
                Meses sin intereses disponibles con tarjetas Visa, Mastercard y American Express de bancos participantes.
                La disponibilidad se confirma en el paso de pago con tu banco emisor.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Payment form ───────────────────────────── */
function PaymentForm({ selectedPlan, onBack, onPay, processing }) {
  return (
    <div className="bg-white dark:bg-obsidian-900 border border-cream-200 dark:border-obsidian-800 p-6 lg:p-8">
      <h2 className="font-display text-xl text-obsidian-900 dark:text-cream-100 mb-6">Datos de tarjeta</h2>

      <div className="space-y-5">
        <div>
          <label className="block text-xs font-medium tracking-wide text-obsidian-700 dark:text-cream-300 uppercase mb-1">
            Número de tarjeta
          </label>
          <input
            className="input-luxury"
            placeholder="4242 4242 4242 4242"
            maxLength={19}
            id="card-number"
          />
        </div>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium tracking-wide text-obsidian-700 dark:text-cream-300 uppercase mb-1">
              Vencimiento
            </label>
            <input className="input-luxury" placeholder="MM / AA" id="card-expiry" />
          </div>
          <div>
            <label className="block text-xs font-medium tracking-wide text-obsidian-700 dark:text-cream-300 uppercase mb-1">
              CVC
            </label>
            <input className="input-luxury" placeholder="123" maxLength={3} id="card-cvc" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium tracking-wide text-obsidian-700 dark:text-cream-300 uppercase mb-1">
            Nombre en tarjeta
          </label>
          <input className="input-luxury" placeholder="NOMBRE APELLIDO" id="card-name" />
        </div>

        {selectedPlan && selectedPlan.months > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3 bg-gold-50 dark:bg-gold-950/20 border border-gold-200 dark:border-gold-800"
          >
            <Landmark size={16} className="text-gold-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gold-700 dark:text-gold-400">
                Plan seleccionado: {selectedPlan.label}
              </p>
              {selectedPlan.months > 0 && (
                <p className="text-xs text-obsidian-500 mt-0.5">
                  Los meses sin intereses se aplicarán automáticamente con tu banco emisor
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Separator */}
        <div className="relative flex items-center gap-3 py-1">
          <div className="flex-1 h-px bg-cream-200 dark:bg-obsidian-700" />
          <span className="text-xs text-obsidian-400">o paga con</span>
          <div className="flex-1 h-px bg-cream-200 dark:bg-obsidian-700" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {['Apple Pay', 'Google Pay'].map(m => (
            <button
              key={m}
              type="button"
              className="border border-cream-200 dark:border-obsidian-700 py-3 text-sm text-obsidian-600 dark:text-obsidian-400 hover:border-gold-400 transition-colors"
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <button type="button" onClick={onBack} className="btn-ghost flex items-center gap-2">
          <ArrowLeft size={16} /> Atrás
        </button>
        <button
          onClick={onPay}
          disabled={processing}
          className="btn-gold px-8"
          id="confirm-pay-btn"
        >
          {processing ? (
            <span className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-obsidian-950 border-t-transparent rounded-full"
              />
              Procesando...
            </span>
          ) : (
            <>
              {selectedPlan?.months > 0 ? <Landmark size={16} /> : <CreditCard size={16} />}
              {selectedPlan?.months > 0 ? `Confirmar ${selectedPlan.label}` : 'Confirmar y pagar'}
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 mt-4 text-xs text-obsidian-400">
        <Shield size={13} /> Pago encriptado SSL — 100% seguro · PCI DSS compliant
      </div>
    </div>
  )
}

/* ─── Schemas ────────────────────────────────── */
const contactSchema = z.object({
  firstName: z.string().min(2, 'Nombre muy corto'),
  lastName:  z.string().min(2, 'Apellido muy corto'),
  email:     z.string().email('Email inválido'),
  phone:     z.string().min(10, 'Teléfono inválido'),
})

const shippingSchema = z.object({
  street:  z.string().min(5, 'Dirección muy corta'),
  number:  z.string().min(1, 'Número requerido'),
  colonia: z.string().min(2, 'Colonia requerida'),
  city:    z.string().min(2, 'Ciudad requerida'),
  state:   z.string().min(2, 'Estado requerido'),
  zip:     z.string().length(5, 'CP debe tener 5 dígitos'),
})

/* ─── Checkout Page ──────────────────────────── */
export default function Checkout() {
  const [searchParams]   = useSearchParams()
  const isFinanceMode    = searchParams.get('mode') === 'financiamiento'
  const formatPrice      = useFormatPrice()

  const [step, setStep]             = useState(1)
  const [contactData, setContactData] = useState(null)
  const [shippingData, setShippingData] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(
    isFinanceMode ? FINANCING_PLANS[2] : FINANCING_PLANS[0] // 6 MSI if finance mode, else full
  )
  const [orderNumber, setOrderNumber] = useState('')
  const navigate = useNavigate()

  const items     = useCartStore(s => s.items)
  const clearCart = useCartStore(s => s.clearCart)

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
  const shipping = subtotal >= 5000 ? 0 : 299
  const total    = subtotal + shipping

  const contactForm = useForm({ resolver: zodResolver(contactSchema) })
  const shippingForm = useForm({ resolver: zodResolver(shippingSchema) })

  useEffect(() => {
    if (isFinanceMode) setSelectedPlan(FINANCING_PLANS[2])
  }, [isFinanceMode])

  const INPUT = 'input-luxury mt-1'
  const LABEL = 'block text-xs font-medium tracking-wide text-obsidian-700 dark:text-cream-300 uppercase'
  const ERROR = 'text-red-500 text-xs mt-1'

  if (items.length === 0 && step < 4) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-obsidian-950 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBagEmpty />
          <p className="font-display text-2xl text-obsidian-400 mb-6">Tu carrito está vacío</p>
          <Link to="/catalogo" className="btn-gold">Ir al Catálogo</Link>
        </div>
      </div>
    )
  }

  const handlePay = async () => {
    setProcessing(true)
    await new Promise(r => setTimeout(r, 2500))
    clearCart()
    const num = `SGC-${Math.floor(Math.random() * 90000) + 10000}`
    setOrderNumber(num)
    setStep(4)
    setProcessing(false)
  }

  const monthly = selectedPlan.months > 0 ? getMonthlyPayment(total, selectedPlan) : null

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-obsidian-950 py-12">
      <div className="container-luxury max-w-5xl">
        {/* Back link */}
        {step < 4 && (
          <Link to="/catalogo" className="flex items-center gap-2 text-sm text-obsidian-500 hover:text-gold-600 mb-8 transition-colors">
            <ArrowLeft size={16} /> Continuar comprando
          </Link>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Page header */}
            <div className="mb-8">
              <h1 className="font-display text-3xl font-semibold text-obsidian-900 dark:text-cream-100 mb-2">
                {step === 4 ? '¡Pedido confirmado!' : 'Checkout'}
              </h1>
              <div className="w-12 h-px bg-gold-gradient" />
            </div>

            {step < 4 && <StepIndicator current={step} />}

            <AnimatePresence mode="wait">

              {/* ── Step 1: Contact ── */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="bg-white dark:bg-obsidian-900 border border-cream-200 dark:border-obsidian-800 p-6 lg:p-8">
                    <h2 className="font-display text-xl text-obsidian-900 dark:text-cream-100 mb-6">Datos de contacto</h2>
                    <form onSubmit={contactForm.handleSubmit(d => { setContactData(d); setStep(2) })}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className={LABEL}>Nombre</label>
                          <input {...contactForm.register('firstName')} className={INPUT} placeholder="María" id="first-name" />
                          {contactForm.formState.errors.firstName && <p className={ERROR}>{contactForm.formState.errors.firstName.message}</p>}
                        </div>
                        <div>
                          <label className={LABEL}>Apellido</label>
                          <input {...contactForm.register('lastName')} className={INPUT} placeholder="García" id="last-name" />
                          {contactForm.formState.errors.lastName && <p className={ERROR}>{contactForm.formState.errors.lastName.message}</p>}
                        </div>
                        <div>
                          <label className={LABEL}>Email</label>
                          <input {...contactForm.register('email')} type="email" className={INPUT} placeholder="maria@ejemplo.com" id="email" />
                          {contactForm.formState.errors.email && <p className={ERROR}>{contactForm.formState.errors.email.message}</p>}
                        </div>
                        <div>
                          <label className={LABEL}>Teléfono</label>
                          <input {...contactForm.register('phone')} type="tel" className={INPUT} placeholder="5512345678" id="phone" />
                          {contactForm.formState.errors.phone && <p className={ERROR}>{contactForm.formState.errors.phone.message}</p>}
                        </div>
                      </div>
                      <div className="mt-6 flex justify-end">
                        <button type="submit" className="btn-gold" id="next-to-shipping">
                          Continuar al envío <ArrowRight size={16} />
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}

              {/* ── Step 2: Shipping ── */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="bg-white dark:bg-obsidian-900 border border-cream-200 dark:border-obsidian-800 p-6 lg:p-8">
                    <h2 className="font-display text-xl text-obsidian-900 dark:text-cream-100 mb-6">Dirección de envío</h2>
                    <form onSubmit={shippingForm.handleSubmit(d => { setShippingData(d); setStep(3) })}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="sm:col-span-2">
                          <label className={LABEL}>Calle</label>
                          <input {...shippingForm.register('street')} className={INPUT} placeholder="Av. Presidente Masaryk" id="street" />
                          {shippingForm.formState.errors.street && <p className={ERROR}>{shippingForm.formState.errors.street.message}</p>}
                        </div>
                        <div>
                          <label className={LABEL}>Número</label>
                          <input {...shippingForm.register('number')} className={INPUT} placeholder="360" id="street-number" />
                          {shippingForm.formState.errors.number && <p className={ERROR}>{shippingForm.formState.errors.number.message}</p>}
                        </div>
                        <div>
                          <label className={LABEL}>Colonia</label>
                          <input {...shippingForm.register('colonia')} className={INPUT} placeholder="Polanco" id="colonia" />
                          {shippingForm.formState.errors.colonia && <p className={ERROR}>{shippingForm.formState.errors.colonia.message}</p>}
                        </div>
                        <div>
                          <label className={LABEL}>Ciudad</label>
                          <input {...shippingForm.register('city')} className={INPUT} placeholder="Ciudad de México" id="city" />
                          {shippingForm.formState.errors.city && <p className={ERROR}>{shippingForm.formState.errors.city.message}</p>}
                        </div>
                        <div>
                          <label className={LABEL}>Estado</label>
                          <input {...shippingForm.register('state')} className={INPUT} placeholder="CDMX" id="state" />
                          {shippingForm.formState.errors.state && <p className={ERROR}>{shippingForm.formState.errors.state.message}</p>}
                        </div>
                        <div>
                          <label className={LABEL}>Código Postal</label>
                          <input {...shippingForm.register('zip')} className={INPUT} placeholder="11560" maxLength={5} id="zip" />
                          {shippingForm.formState.errors.zip && <p className={ERROR}>{shippingForm.formState.errors.zip.message}</p>}
                        </div>
                      </div>
                      <div className="mt-6 flex justify-between">
                        <button type="button" onClick={() => setStep(1)} className="btn-ghost flex items-center gap-2">
                          <ArrowLeft size={16} /> Atrás
                        </button>
                        <button type="submit" className="btn-gold" id="next-to-payment">
                          Continuar al pago <ArrowRight size={16} />
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}

              {/* ── Step 3: Payment + Financing ── */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Financing selector */}
                  <div className="bg-white dark:bg-obsidian-900 border border-cream-200 dark:border-obsidian-800 p-6 lg:p-8">
                    <div className="flex items-center gap-2 mb-6">
                      <Landmark size={18} className="text-gold-500" />
                      <h2 className="font-display text-xl text-obsidian-900 dark:text-cream-100">Forma de pago</h2>
                    </div>
                    <FinancingSelector
                      total={total}
                      selectedPlan={selectedPlan}
                      onSelect={setSelectedPlan}
                    />
                  </div>

                  {/* Card form */}
                  <PaymentForm
                    selectedPlan={selectedPlan}
                    onBack={() => setStep(2)}
                    onPay={handlePay}
                    processing={processing}
                  />
                </motion.div>
              )}

              {/* ── Step 4: Confirmation ── */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-obsidian-900 border border-cream-200 dark:border-obsidian-800 p-8 lg:p-12 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="w-20 h-20 bg-gold-gradient rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <Check size={36} className="text-obsidian-950" />
                  </motion.div>

                  <h2 className="font-display text-3xl font-semibold text-obsidian-900 dark:text-cream-100 mb-3">
                    ¡Pedido confirmado!
                  </h2>
                  <div className="divider-gold" />

                  <p className="text-obsidian-600 dark:text-obsidian-400 mt-4 mb-2">
                    Tu número de pedido es:{' '}
                    <strong className="text-gold-600 font-display text-lg">#{orderNumber}</strong>
                  </p>

                  {/* Payment plan confirmation */}
                  {selectedPlan && selectedPlan.months > 0 && monthly && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="mt-6 mx-auto max-w-sm bg-gradient-to-r from-gold-50 to-amber-50 dark:from-gold-950/30 dark:to-amber-950/20 border border-gold-200 dark:border-gold-800 p-5 text-left"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Landmark size={16} className="text-gold-600" />
                        <span className="text-xs font-bold tracking-widest uppercase text-gold-700 dark:text-gold-400">
                          Plan de financiamiento
                        </span>
                      </div>
                      <p className="font-display text-xl font-semibold text-obsidian-900 dark:text-cream-100 mb-1">
                        {selectedPlan.label}
                      </p>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="font-display text-2xl font-semibold text-gold-gradient">
                          {formatPrice(monthly)}
                        </span>
                        <span className="text-sm text-obsidian-500">/mes</span>
                      </div>
                      <p className="text-xs text-obsidian-500">
                        {selectedPlan.months} cargos mensuales · primer cobro en 30 días
                      </p>
                      {selectedPlan.rate > 0 && (
                        <p className="text-[10px] text-obsidian-400 mt-1">
                          Total a pagar: {formatPrice(monthly * selectedPlan.months)} · CAT {(selectedPlan.rate * 100).toFixed(1)}% anual
                        </p>
                      )}
                    </motion.div>
                  )}

                  <p className="text-sm text-obsidian-500 mt-6 mb-8">
                    Recibirás un email de confirmación con los detalles y número de rastreo.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link to="/" className="btn-gold">Ir al Inicio</Link>
                    <Link to="/catalogo" className="btn-outline-gold">Seguir comprando</Link>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Sidebar */}
          {step < 4 && (
            <div className="lg:col-span-1">
              <div className="sticky top-28">
                <OrderSummary items={items} selectedPlan={selectedPlan} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Empty cart icon helper ─────────────────── */
function ShoppingBagEmpty() {
  return (
    <div className="w-24 h-24 bg-cream-100 dark:bg-obsidian-900 rounded-full flex items-center justify-center mx-auto mb-6">
      <CreditCard size={40} className="text-cream-300 dark:text-obsidian-700" />
    </div>
  )
}
