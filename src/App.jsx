import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { HelmetProvider } from 'react-helmet-async'
import Layout from './components/layout/Layout'
import supabase from './lib/supabase'
import useAuthStore from './store/authStore'

// Lazy-loaded pages for code splitting
const Home          = lazy(() => import('./pages/Home'))
const Catalog       = lazy(() => import('./pages/Catalog'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Checkout      = lazy(() => import('./pages/Checkout'))
const Auth          = lazy(() => import('./pages/Auth'))
const Account       = lazy(() => import('./pages/Account'))

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
                <Route path="/"                  element={<Home />} />
                <Route path="/catalogo"          element={<Catalog />} />
                <Route path="/producto/:slug"    element={<ProductDetail />} />
                <Route path="/checkout"          element={<Checkout />} />
                <Route path="/cuenta"            element={<Account />} />
                <Route path="/cuenta/wishlist"   element={<Account />} />
                <Route path="/cuenta/pedidos"    element={<Account />} />
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
