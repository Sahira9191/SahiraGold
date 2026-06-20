import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package, Heart, MapPin, User, LogOut, ChevronRight, Star } from 'lucide-react'
import useAuthStore from '../store/authStore'
import ProductCard from '../components/product/ProductCard'
import { MOCK_PRODUCTS } from '../lib/mockData'

const MOCK_ORDERS = [
  { id: 'SGC-48291', date: '2025-11-20', status: 'Entregado', total: 4800, items: 2 },
  { id: 'SGC-39145', date: '2025-10-08', status: 'Entregado', total: 12500, items: 1 },
  { id: 'SGC-51029', date: '2025-12-01', status: 'En camino', total: 3200, items: 3 },
]

const STATUS_COLORS = {
  'Entregado': 'text-green-600 bg-green-50 dark:bg-green-950/20',
  'En camino': 'text-blue-600 bg-blue-50 dark:bg-blue-950/20',
  'Procesando': 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20',
  'Cancelado': 'text-red-600 bg-red-50 dark:bg-red-950/20',
}

const formatPrice = (n) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)

const TABS = [
  { id: 'orders', label: 'Mis Pedidos', icon: Package },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'profile', label: 'Mi Perfil', icon: User },
]

export default function Account() {
  const user = useAuthStore(s => s.user)
  const logout = useAuthStore(s => s.logout)
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
                      ${activeTab === tab.id ? 'text-gold-600 bg-cream-50 dark:bg-obsidian-800 font-medium' : 'text-obsidian-600 dark:text-obsidian-400 hover:text-gold-600'}`}
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
            {/* Orders */}
            {activeTab === 'orders' && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="font-display text-2xl text-obsidian-900 dark:text-cream-100 mb-6">Mis Pedidos</h2>
                <div className="space-y-4">
                  {MOCK_ORDERS.map(order => (
                    <div key={order.id} className="bg-white dark:bg-obsidian-900 border border-cream-200 dark:border-obsidian-800 p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <p className="font-display text-base font-medium text-obsidian-900 dark:text-cream-100">#{order.id}</p>
                          <p className="text-xs text-obsidian-400 mt-0.5">{order.date} · {order.items} artículo(s)</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-none ${STATUS_COLORS[order.status]}`}>
                            {order.status}
                          </span>
                          <span className="font-display font-semibold text-gold-600">{formatPrice(order.total)}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-obsidian-400">
                          {order.status === 'En camino' ? '📦 Guía: FX9281047MX' : ''}
                        </p>
                        <button className="text-xs text-gold-600 hover:text-gold-700 font-medium">
                          Ver detalles →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Wishlist */}
            {activeTab === 'wishlist' && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
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
              </motion.div>
            )}

            {/* Profile */}
            {activeTab === 'profile' && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="font-display text-2xl text-obsidian-900 dark:text-cream-100 mb-6">Mi Perfil</h2>
                <div className="bg-white dark:bg-obsidian-900 border border-cream-200 dark:border-obsidian-800 p-6 lg:p-8 max-w-lg">
                  <div className="space-y-5">
                    {[
                      { label: 'Nombre completo', value: name },
                      { label: 'Correo electrónico', value: user.email },
                      { label: 'Teléfono', value: '—' },
                    ].map(field => (
                      <div key={field.label}>
                        <label className="block text-xs font-medium tracking-widest uppercase text-obsidian-500 dark:text-obsidian-400 mb-1">
                          {field.label}
                        </label>
                        <p className="text-sm text-obsidian-900 dark:text-cream-100 py-3 px-4 border border-cream-200 dark:border-obsidian-700 bg-cream-50 dark:bg-obsidian-800">
                          {field.value}
                        </p>
                      </div>
                    ))}
                    <button className="btn-gold text-xs mt-2">Editar perfil</button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
