import { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, Heart, User, LogOut, ChevronRight,
  Edit2, Save, X, Loader, MapPin, Phone, Mail,
  CheckCircle, Truck, Clock, XCircle, ShoppingBag
} from 'lucide-react'
import { toast } from 'sonner'
import useAuthStore from '../store/authStore'
import ProductCard from '../components/product/ProductCard'
import { MOCK_PRODUCTS } from '../lib/mockData'
import supabase from '../lib/supabase'

/* ─── Helpers ─────────────────────────────────────────────── */
const formatPrice = (n) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)

const formatDate = (d) =>
  new Date(d).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })

const STATUS = {
  'Entregado':  { color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30', icon: CheckCircle },
  'En camino':  { color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30',          icon: Truck       },
  'Procesando': { color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30',    icon: Clock       },
  'Cancelado':  { color: 'text-red-600 bg-red-50 dark:bg-red-950/30',             icon: XCircle     },
}

const TABS = [
  { id: 'orders',   label: 'Mis Pedidos', icon: Package },
  { id: 'wishlist', label: 'Wishlist',    icon: Heart   },
  { id: 'profile',  label: 'Mi Perfil',  icon: User    },
]

/* ─── Orders Tab ──────────────────────────────────────────── */
function OrdersTab({ userId }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error
        setOrders(data || [])
      } catch {
        // fallback silencioso — la tabla puede estar vacía
        setOrders([])
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [userId])

  if (loading) return (
    <div className="flex justify-center py-16">
      <Loader size={24} className="animate-spin text-gold-500" />
    </div>
  )

  if (orders.length === 0) return (
    <div className="text-center py-20 bg-white dark:bg-obsidian-900 border border-cream-200 dark:border-obsidian-800">
      <ShoppingBag size={48} className="text-cream-300 mx-auto mb-4" />
      <p className="font-display text-xl text-obsidian-400 mb-2">Aún no tienes pedidos</p>
      <p className="text-sm text-obsidian-400 mb-6">¡Explora nuestra colección y encuentra tu joya perfecta!</p>
      <Link to="/catalogo" className="btn-gold text-sm">Ver Catálogo</Link>
    </div>
  )

  return (
    <div className="space-y-4">
      {orders.map(order => {
        const S = STATUS[order.status] || STATUS['Procesando']
        const StatusIcon = S.icon
        return (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-obsidian-900 border border-cream-200 dark:border-obsidian-800 p-5"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="font-display text-base font-medium text-obsidian-900 dark:text-cream-100">
                  #{order.order_number}
                </p>
                <p className="text-xs text-obsidian-400 mt-0.5">
                  {formatDate(order.created_at)} · {order.order_items?.length ?? 0} artículo(s)
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 ${S.color}`}>
                  <StatusIcon size={12} />
                  {order.status}
                </span>
                <span className="font-display font-semibold text-gold-600">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
            {order.tracking_number && (
              <p className="text-xs text-obsidian-400 flex items-center gap-1.5">
                <Truck size={12} /> Guía: <span className="font-mono">{order.tracking_number}</span>
              </p>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

/* ─── Profile Tab ─────────────────────────────────────────── */
function ProfileTab({ user }) {
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ full_name: '', phone: '', address: '', city: '', state: '' })

  useEffect(() => {
    async function fetchProfile() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data)
        setForm({
          full_name: data.full_name || user.user_metadata?.full_name || '',
          phone:     data.phone    || '',
          address:   data.address  || '',
          city:      data.city     || '',
          state:     data.state    || '',
        })
      }
    }
    fetchProfile()
  }, [user])

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ...form, updated_at: new Date().toISOString() })
        .eq('id', user.id)

      if (error) throw error
      setProfile(prev => ({ ...prev, ...form }))
      setEditing(false)
      toast.success('Perfil actualizado')
    } catch (err) {
      toast.error(err.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const FIELD = 'w-full text-sm text-obsidian-900 dark:text-cream-100 py-3 px-4 border border-cream-200 dark:border-obsidian-700 bg-cream-50 dark:bg-obsidian-800 focus:outline-none focus:border-gold-400 transition-colors'
  const LABEL = 'block text-xs font-medium tracking-widest uppercase text-obsidian-500 dark:text-obsidian-400 mb-1'

  return (
    <div className="bg-white dark:bg-obsidian-900 border border-cream-200 dark:border-obsidian-800 p-6 lg:p-8 max-w-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-lg text-obsidian-900 dark:text-cream-100">Información Personal</h3>
        {!editing ? (
          <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-xs text-gold-600 hover:text-gold-700 font-medium">
            <Edit2 size={12} /> Editar
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={() => setEditing(false)} className="flex items-center gap-1 text-xs text-obsidian-400 hover:text-obsidian-700">
              <X size={12} /> Cancelar
            </button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 text-xs bg-gold-500 text-white px-3 py-1.5 hover:bg-gold-600 transition-colors">
              {saving ? <Loader size={12} className="animate-spin" /> : <Save size={12} />}
              Guardar
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Email (readonly) */}
        <div>
          <label className={LABEL}>
            <Mail size={10} className="inline mr-1" />Correo electrónico
          </label>
          <p className={FIELD + ' cursor-not-allowed opacity-60'}>{user.email}</p>
        </div>

        {/* Nombre */}
        <div>
          <label className={LABEL}>
            <User size={10} className="inline mr-1" />Nombre completo
          </label>
          {editing ? (
            <input
              className={FIELD}
              value={form.full_name}
              onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
              placeholder="Tu nombre completo"
            />
          ) : (
            <p className={FIELD}>{profile?.full_name || user.user_metadata?.full_name || '—'}</p>
          )}
        </div>

        {/* Teléfono */}
        <div>
          <label className={LABEL}>
            <Phone size={10} className="inline mr-1" />Teléfono
          </label>
          {editing ? (
            <input
              className={FIELD}
              value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              placeholder="+52 55 1234-5678"
            />
          ) : (
            <p className={FIELD}>{profile?.phone || '—'}</p>
          )}
        </div>

        {/* Dirección */}
        <div>
          <label className={LABEL}>
            <MapPin size={10} className="inline mr-1" />Dirección de envío
          </label>
          {editing ? (
            <input
              className={FIELD}
              value={form.address}
              onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
              placeholder="Calle y número"
            />
          ) : (
            <p className={FIELD}>{profile?.address || '—'}</p>
          )}
        </div>

        {/* Ciudad / Estado */}
        {editing && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Ciudad</label>
              <input className={FIELD} value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="Ciudad de México" />
            </div>
            <div>
              <label className={LABEL}>Estado</label>
              <input className={FIELD} value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} placeholder="CDMX" />
            </div>
          </div>
        )}
        {!editing && profile?.city && (
          <div>
            <label className={LABEL}>Ciudad / Estado</label>
            <p className={FIELD}>{[profile.city, profile.state].filter(Boolean).join(', ')}</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Account Page ────────────────────────────────────────── */
export default function Account() {
  const user    = useAuthStore(s => s.user)
  const logout  = useAuthStore(s => s.logout)
  const wishlist = useAuthStore(s => s.wishlist)
  const [activeTab, setActiveTab] = useState('orders')

  if (!user) return <Navigate to="/auth" replace />

  const wishedProducts = MOCK_PRODUCTS.filter(p => wishlist.includes(p.id))
  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario'

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-obsidian-950">
      {/* Header */}
      <div className="bg-obsidian-950 text-cream-100 py-14">
        <div className="container-luxury">
          <div className="text-gold-400 text-xs tracking-[0.5em] uppercase mb-3">Mi Cuenta</div>
          <h1 className="font-display text-3xl lg:text-4xl font-semibold mb-1">
            Bienvenida, <span className="text-gold-gradient">{name}</span>
          </h1>
          <p className="text-obsidian-400 text-sm">{user.email}</p>
        </div>
      </div>

      <div className="container-luxury py-10">
        <div className="flex gap-8 flex-col lg:flex-row">
          {/* Sidebar */}
          <aside className="w-full lg:w-56 flex-shrink-0">
            <nav className="bg-white dark:bg-obsidian-900 border border-cream-200 dark:border-obsidian-800">
              {TABS.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-5 py-4 text-sm text-left border-b border-cream-100 dark:border-obsidian-800 last:border-0 transition-colors
                      ${activeTab === tab.id
                        ? 'text-gold-600 bg-cream-50 dark:bg-obsidian-800 font-medium'
                        : 'text-obsidian-600 dark:text-obsidian-400 hover:text-gold-600'
                      }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                    {activeTab === tab.id && <ChevronRight size={14} className="ml-auto" />}
                  </button>
                )
              })}
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-5 py-4 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              >
                <LogOut size={16} /> Cerrar Sesión
              </button>
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'orders' && (
                  <>
                    <h2 className="font-display text-2xl text-obsidian-900 dark:text-cream-100 mb-6">Mis Pedidos</h2>
                    <OrdersTab userId={user.id} />
                  </>
                )}

                {activeTab === 'wishlist' && (
                  <>
                    <h2 className="font-display text-2xl text-obsidian-900 dark:text-cream-100 mb-6">
                      Mi Wishlist <span className="text-obsidian-400 text-lg">({wishedProducts.length})</span>
                    </h2>
                    {wishedProducts.length === 0 ? (
                      <div className="text-center py-20 bg-white dark:bg-obsidian-900 border border-cream-200 dark:border-obsidian-800">
                        <Heart size={48} className="text-cream-300 mx-auto mb-4" />
                        <p className="font-display text-xl text-obsidian-400 mb-2">Tu wishlist está vacía</p>
                        <p className="text-sm text-obsidian-400 mb-6">Guarda las joyas que más te gustan</p>
                        <Link to="/catalogo" className="btn-gold text-sm">Explorar Catálogo</Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {wishedProducts.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'profile' && (
                  <>
                    <h2 className="font-display text-2xl text-obsidian-900 dark:text-cream-100 mb-6">Mi Perfil</h2>
                    <ProfileTab user={user} />
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
