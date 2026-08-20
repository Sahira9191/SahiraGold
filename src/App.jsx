import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { HelmetProvider } from 'react-helmet-async'
import Layout from './components/layout/Layout'
import supabase from './lib/supabase'
import useAuthStore from './store/authStore'

// ─── Seed default coupons if localStorage is empty ──────────────────────────────────
;(function initCoupons() {
  if (localStorage.getItem('sg_coupons')) return
  const seed = [
    { id: 'cp1', code: 'SAHIRA10',   type: 'percent', value: 10,  minPurchase: 0,    maxUses: 100, uses: 0, expires: '2027-12-31', active: true },
    { id: 'cp2', code: 'BIENVENIDA', type: 'percent', value: 15,  minPurchase: 0,    maxUses: 500, uses: 0, expires: '2027-12-31', active: true },
    { id: 'cp3', code: 'SAHIRA500',  type: 'fixed',   value: 500, minPurchase: 2000, maxUses: 50,  uses: 0, expires: '2027-12-31', active: true },
    { id: 'cp4', code: 'VIP2026',    type: 'percent', value: 20,  minPurchase: 5000, maxUses: 30,  uses: 0, expires: '2027-12-31', active: true },
  ]
  try { localStorage.setItem('sg_coupons', JSON.stringify(seed)) } catch { /* ignore */ }
})()

// ─── Seed default orders so Dashboard always has data ───────────────────────────────
;(function initOrders() {
  if (localStorage.getItem('sg_orders')) return
  const seed = [
    { id: 'SGC-51029', customer: { name: 'Sofía Martínez', email: 'sofia@email.com', phone: '+52 55 1234-5678' }, date: '2026-08-18', items: [{ name: 'Anillo Eternidad', qty: 1, price: 2800 }, { name: 'Aretes Pavé', qty: 2, price: 1200 }], total: 5200, status: 'Procesando', address: 'Av. Insurgentes Sur 1234, CDMX', tracking: '', notes: '' },
    { id: 'SGC-48291', customer: { name: 'Ana Pérez', email: 'ana@email.com', phone: '+52 33 9876-5432' }, date: '2026-08-15', items: [{ name: 'Collar Perla Tahití', qty: 1, price: 4800 }], total: 4800, status: 'Entregado', address: 'Calle Madero 567, Guadalajara', tracking: 'FX9281047MX', notes: '' },
    { id: 'SGC-39145', customer: { name: 'Carmen Villanueva', email: 'carmen@email.com', phone: '+52 81 5555-1234' }, date: '2026-08-10', items: [{ name: 'Pulsera Tennis', qty: 1, price: 12500 }], total: 12500, status: 'Entregado', address: 'Av. Garza Sada 2501, Monterrey', tracking: 'FX1928374MX', notes: '' },
    { id: 'SGC-55821', customer: { name: 'Isabella Fuentes', email: 'isa@email.com', phone: '+52 998 123-4567' }, date: '2026-08-19', items: [{ name: 'Aretes Rubí Lágrima', qty: 1, price: 1900 }], total: 1900, status: 'En camino', address: 'Blvd. Kukulcán Km 12, Cancún', tracking: 'FX7654321MX', notes: '' },
    { id: 'SGC-47103', customer: { name: 'Gabriela Moreno', email: 'gaby@email.com', phone: '+52 55 8888-9999' }, date: '2026-08-12', items: [{ name: 'Anillo Solitario', qty: 1, price: 6700 }], total: 6700, status: 'Entregado', address: 'Polanco, CDMX', tracking: 'FX3344556MX', notes: '' },
    { id: 'SGC-61002', customer: { name: 'Mariana Ríos', email: 'mari@email.com', phone: '+52 442 333-4444' }, date: '2026-08-20', items: [{ name: 'Collar Gargantilla', qty: 1, price: 3400 }], total: 3400, status: 'Procesando', address: 'Centro Histórico, Querétaro', tracking: '', notes: '' },
  ]
  try { localStorage.setItem('sg_orders', JSON.stringify(seed)) } catch { /* ignore */ }
})()


// Lazy-loaded pages for code splitting
const Home          = lazy(() => import('./pages/Home'))
const Catalog       = lazy(() => import('./pages/Catalog'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Checkout      = lazy(() => import('./pages/Checkout'))
const Auth          = lazy(() => import('./pages/Auth'))

// Admin modules
const AdminLayout   = lazy(() => import('./pages/admin/AdminLayout'))
const AdminDash     = lazy(() => import('./pages/admin/Dashboard'))
const AdminInventory= lazy(() => import('./pages/admin/Inventory'))
const AdminOrders   = lazy(() => import('./pages/admin/Orders'))
const AdminCustomers= lazy(() => import('./pages/admin/Customers'))
const AdminContent  = lazy(() => import('./pages/admin/WebContent'))
const AdminCoupons  = lazy(() => import('./pages/admin/Coupons'))
const AdminSettings = lazy(() => import('./pages/admin/Settings'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5 },
  },
})

// Full-screen loading spinner
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50 dark:bg-obsidian-950">
      <div className="flex flex-col items-center gap-6">
        <img
          src="/logo-clean.png"
          alt="Sahira Gold Collection"
          className="h-20 w-auto object-contain animate-pulse"
        />
        <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )
}

export default function App() {
  const setSession = useAuthStore(s => s.setSession)
  const setLoading = useAuthStore(s => s.setLoading)

  // Listen for auth state changes
  useEffect(() => {
    setLoading(true)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription?.unsubscribe()
  }, [setSession, setLoading])

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Main layout routes */}
              <Route element={<Layout />}>
                <Route path="/"               element={<Home />} />
                <Route path="/catalogo"       element={<Catalog />} />
                <Route path="/producto/:slug" element={<ProductDetail />} />
                <Route path="/checkout"       element={<Checkout />} />
              </Route>

              {/* Auth — standalone layout */}
              <Route path="/auth" element={<Auth />} />

              {/* Admin — standalone layout with nested routes */}
              <Route element={<AdminLayout />}>
                <Route path="/admin"               element={<AdminDash />} />
                <Route path="/admin/inventario"    element={<AdminInventory />} />
                <Route path="/admin/pedidos"       element={<AdminOrders />} />
                <Route path="/admin/clientes"      element={<AdminCustomers />} />
                <Route path="/admin/contenido"     element={<AdminContent />} />
                <Route path="/admin/cupones"       element={<AdminCoupons />} />
                <Route path="/admin/configuracion" element={<AdminSettings />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>

          {/* Global toast notifications */}
          <Toaster
            position="bottom-right"
            expand={false}
            richColors
            toastOptions={{
              classNames: {
                toast: 'font-sans text-sm',
              },
            }}
          />
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  )
}
