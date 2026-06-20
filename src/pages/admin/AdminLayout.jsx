import { useState, useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Globe,
  Tag,
  Settings,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Bell,
  Store,
} from 'lucide-react'
import useAuthStore from '../../store/authStore'

/* ─── Nav config ─────────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { path: '/admin',              icon: LayoutDashboard, label: 'Dashboard',      exact: true  },
  { path: '/admin/inventario',   icon: Package,         label: 'Inventario',     exact: false },
  { path: '/admin/pedidos',      icon: ShoppingCart,    label: 'Pedidos',        exact: false, badge: 3 },
  { path: '/admin/clientes',     icon: Users,           label: 'Clientes',       exact: false },
  { path: '/admin/contenido',    icon: Globe,           label: 'Contenido Web',  exact: false },
  { path: '/admin/cupones',      icon: Tag,             label: 'Cupones',        exact: false },
  { path: '/admin/configuracion',icon: Settings,        label: 'Configuración',  exact: false },
]

/* Map of admin route paths → page titles shown in the topbar */
const PAGE_TITLES = {
  '/admin':               'Dashboard',
  '/admin/inventario':    'Inventario',
  '/admin/pedidos':       'Pedidos',
  '/admin/clientes':      'Clientes',
  '/admin/contenido':     'Contenido Web',
  '/admin/cupones':       'Cupones',
  '/admin/configuracion': 'Configuración',
}

/* ─── Sidebar Nav Item ───────────────────────────────────────────────────── */
function NavItem({ link, onClick }) {
  const location = useLocation()
  const isActive = link.exact
    ? location.pathname === link.path
    : location.pathname.startsWith(link.path)

  const Icon = link.icon

  return (
    <Link
      to={link.path}
      onClick={onClick}
      className={`
        relative flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-150 select-none
        ${isActive
          ? 'border-l-2 border-yellow-400 bg-slate-800 text-yellow-400 pl-[14px]'
          : 'border-l-2 border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900 pl-[14px]'
        }
      `}
    >
      <Icon size={16} className="flex-shrink-0" />
      <span className="flex-1 truncate">{link.label}</span>
      {link.badge != null && (
        <span className="flex-shrink-0 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-yellow-500 text-slate-950 text-[10px] font-bold px-1">
          {link.badge}
        </span>
      )}
      {isActive && <ChevronRight size={12} className="flex-shrink-0 text-yellow-400/60" />}
    </Link>
  )
}

/* ─── Sidebar Contents ───────────────────────────────────────────────────── */
function SidebarContents({ onNavClick }) {
  const logout = useAuthStore((s) => s.logout)
  const user   = useAuthStore((s) => s.user)

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex flex-col items-center py-6 px-4 border-b border-slate-800">
        <img
          src="/logo-clean.png"
          alt="Sahira Gold"
          className="h-12 w-auto object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
        <span className="mt-2 text-[10px] tracking-[0.2em] uppercase text-slate-400 font-medium">
          Admin Panel
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto">
        {NAV_LINKS.map((link) => (
          <NavItem key={link.path} link={link} onClick={onNavClick} />
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-slate-800 p-4 space-y-1">
        <Link
          to="/"
          onClick={onNavClick}
          className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors rounded-none w-full"
        >
          <Store size={15} />
          <span>Ver tienda</span>
        </Link>
        <button
          onClick={() => { logout(); onNavClick?.() }}
          className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-400 hover:text-red-400 hover:bg-red-900/10 transition-colors w-full text-left"
        >
          <LogOut size={15} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  )
}

/* ─── Admin Layout ───────────────────────────────────────────────────────── */
export default function AdminLayout() {
  const user    = useAuthStore((s) => s.user)
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  /* Close mobile drawer on route change */
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  /* Escape key closes mobile drawer */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  /* Auth guards — comentar para desarrollo local */
  // if (!user) return <Navigate to="/auth" replace />
  // if (!isAdmin()) return <Navigate to="/" replace />

  /* Derive topbar page title */
  const pageTitle =
    PAGE_TITLES[location.pathname] ??
    Object.entries(PAGE_TITLES).find(([k]) => location.pathname.startsWith(k) && k !== '/admin')?.[1] ??
    'Admin'

  return (
    <div className="flex min-h-screen bg-slate-900">

      {/* ── Desktop Sidebar ────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-[240px] flex-shrink-0 bg-slate-950 border-r border-slate-800">
        <SidebarContents onNavClick={undefined} />
      </aside>

      {/* ── Mobile Drawer ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer panel */}
            <motion.aside
              key="drawer"
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: 'tween', duration: 0.22, ease: 'easeOut' }}
              className="fixed inset-y-0 left-0 z-50 w-[240px] bg-slate-950 border-r border-slate-800 flex flex-col lg:hidden"
            >
              {/* Close button */}
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-100 transition-colors"
                aria-label="Cerrar menú"
              >
                <X size={18} />
              </button>

              <SidebarContents onNavClick={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main area ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Topbar */}
        <header className="flex-shrink-0 flex items-center justify-between gap-4 h-16 px-4 lg:px-6 bg-slate-900 border-b border-slate-700">

          {/* Left: hamburger (mobile) + title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors rounded-none"
              aria-label="Abrir menú"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-slate-100 font-semibold text-base tracking-tight">
              {pageTitle}
            </h1>
          </div>

          {/* Right: bell + avatar */}
          <div className="flex items-center gap-3">
            {/* Bell with badge */}
            <button className="relative p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1 right-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full bg-yellow-500 text-slate-950 text-[9px] font-bold leading-none px-0.5">
                3
              </span>
            </button>

            {/* Admin info */}
            <div className="flex items-center gap-2.5">
              <span className="hidden sm:block text-xs text-slate-400 max-w-[160px] truncate">
                {user?.email ?? 'admin@sahiragold.mx'}
              </span>
              <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-slate-950 font-bold text-sm flex-shrink-0">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Page content via Outlet */}
        <main className="flex-1 overflow-auto bg-slate-900 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
