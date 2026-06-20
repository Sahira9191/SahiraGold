import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, ShoppingBag, Heart, User, Menu, X, ChevronDown,
  Sun, Moon, Phone, Mail
} from 'lucide-react'
import useCartStore from '../../store/cartStore'
import useAuthStore from '../../store/authStore'

const NAV_LINKS = [
  { label: 'Inicio', href: '/' },
  {
    label: 'Catálogo',
    href: '/catalogo',
    children: [
      { label: 'Anillos', href: '/catalogo?cat=anillos' },
      { label: 'Collares', href: '/catalogo?cat=collares' },
      { label: 'Aretes', href: '/catalogo?cat=aretes' },
      { label: 'Pulseras', href: '/catalogo?cat=pulseras' },
      { label: 'Cadenas', href: '/catalogo?cat=cadenas' },
      { label: 'Ver Todo', href: '/catalogo' },
    ],
  },
  { label: 'Colecciones', href: '/colecciones' },
  { label: 'Nuestra Historia', href: '/#historia' },
  { label: 'Contacto', href: '/contacto' },
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [dark, setDark] = useState(false)
  const searchRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  const items = useCartStore((s) => s.items)
  const openCart = useCartStore((s) => s.openCart)
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0)

  const user = useAuthStore((s) => s.user)
  const wishlist = useAuthStore((s) => s.wishlist)

  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    if (dark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [dark])

  useEffect(() => {
    setMobileOpen(false)
    setSearchOpen(false)
  }, [location.pathname])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/catalogo?search=${encodeURIComponent(searchQuery)}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const isHome = location.pathname === '/'
  const transparentBg = isHome && !isScrolled && !searchOpen && !mobileOpen

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-obsidian-950 text-cream-100 text-xs py-2 px-4 text-center tracking-widest">
        <span className="text-gold-400">✦</span>
        {' '}ENVÍO GRATIS en compras mayores a $5,000 MXN — Certificado de autenticidad incluido{' '}
        <span className="text-gold-400">✦</span>
      </div>

      {/* Main Navbar */}
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          transparentBg
            ? 'bg-white/10 backdrop-blur-md border-b border-white/10'
            : 'bg-white/95 dark:bg-obsidian-950/95 backdrop-blur-md shadow-sm border-b border-cream-200 dark:border-obsidian-800'
        }`}
      >
        <div className="container-luxury">
          <div className="flex items-center justify-between h-24 lg:h-32">

            {/* Logo */}
            <Link to="/" className="flex items-center flex-shrink-0 group" aria-label="Sahira Gold Collection — Inicio">
              <img
                src="/logo-clean.png"
                alt="Sahira Gold Collection"
                className="h-24 lg:h-32 w-auto object-contain transition-all duration-300 group-hover:scale-105"
                loading="eager"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => link.children && setActiveDropdown(link.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    to={link.href}
                    className={`nav-link px-4 py-2 flex items-center gap-1 ${
                      transparentBg ? 'text-white hover:text-gold-300' : ''
                    }`}
                  >
                    {link.label}
                    {link.children && <ChevronDown size={13} className="opacity-60" />}
                  </Link>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {link.children && activeDropdown === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-obsidian-900
                                   border border-cream-200 dark:border-obsidian-700 shadow-luxury py-2"
                      >
                        {link.children.map((child) => (
                          <Link
                            key={child.label}
                            to={child.href}
                            className="block px-4 py-2.5 text-sm font-sans text-obsidian-700 dark:text-cream-200
                                       hover:bg-cream-50 dark:hover:bg-obsidian-800 hover:text-gold-600
                                       tracking-wide transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className={`p-2.5 rounded-none transition-colors ${
                  transparentBg ? 'text-white hover:text-gold-300' : 'text-obsidian-700 dark:text-cream-200 hover:text-gold-600'
                }`}
                aria-label="Buscar"
              >
                <Search size={20} />
              </button>

              {/* Dark mode */}
              <button
                onClick={() => setDark(!dark)}
                className={`p-2.5 hidden lg:flex rounded-none transition-colors ${
                  transparentBg ? 'text-white hover:text-gold-300' : 'text-obsidian-700 dark:text-cream-200 hover:text-gold-600'
                }`}
                aria-label="Modo oscuro"
              >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* Wishlist */}
              <Link
                to="/cuenta/wishlist"
                className={`p-2.5 relative rounded-none transition-colors ${
                  transparentBg ? 'text-white hover:text-gold-300' : 'text-obsidian-700 dark:text-cream-200 hover:text-gold-600'
                }`}
                aria-label="Lista de deseos"
              >
                <Heart size={20} />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-gold-500 text-obsidian-950 text-[9px] font-bold flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Account */}
              <Link
                to={user ? '/cuenta' : '/auth'}
                className={`p-2.5 hidden sm:flex rounded-none transition-colors ${
                  transparentBg ? 'text-white hover:text-gold-300' : 'text-obsidian-700 dark:text-cream-200 hover:text-gold-600'
                }`}
                aria-label="Mi cuenta"
              >
                <User size={20} />
              </Link>

              {/* Cart */}
              <button
                onClick={openCart}
                className={`p-2.5 relative rounded-none transition-colors ${
                  transparentBg ? 'text-white hover:text-gold-300' : 'text-obsidian-700 dark:text-cream-200 hover:text-gold-600'
                }`}
                aria-label="Carrito de compras"
              >
                <ShoppingBag size={20} />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      key={itemCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute top-1 right-1 w-4 h-4 rounded-full bg-gold-500 text-obsidian-950 text-[9px] font-bold flex items-center justify-center"
                    >
                      {itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Mobile menu */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={`p-2.5 lg:hidden rounded-none transition-colors ${
                  transparentBg ? 'text-white hover:text-gold-300' : 'text-obsidian-700 dark:text-cream-200 hover:text-gold-600'
                }`}
                aria-label="Menú"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-t border-cream-200 dark:border-obsidian-800 bg-white dark:bg-obsidian-950"
            >
              <form onSubmit={handleSearch} className="container-luxury py-4">
                <div className="relative max-w-2xl mx-auto">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-obsidian-400" />
                  <input
                    ref={searchRef}
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar anillos, collares, aretes..."
                    className="input-luxury pl-12 pr-4"
                  />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 btn-gold py-1.5 px-4 text-xs">
                    Buscar
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 h-full w-80 bg-white dark:bg-obsidian-950 z-50 lg:hidden overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-cream-200 dark:border-obsidian-800">
                <Link to="/" onClick={() => setMobileOpen(false)}>
                  <img
                    src="/logo-clean.png"
                    alt="Sahira Gold Collection"
                    className="h-12 w-auto object-contain"
                  />
                </Link>
                <button onClick={() => setMobileOpen(false)} className="p-2 text-obsidian-500 hover:text-gold-600">
                  <X size={20} />
                </button>
              </div>

              <nav className="p-6 space-y-1">
                {NAV_LINKS.map((link) => (
                  <div key={link.label}>
                    <Link
                      to={link.href}
                      className="block py-3 px-2 font-sans text-sm tracking-widest uppercase text-obsidian-700 dark:text-cream-200 hover:text-gold-600 border-b border-cream-100 dark:border-obsidian-800"
                    >
                      {link.label}
                    </Link>
                    {link.children && (
                      <div className="ml-4 mt-1 space-y-1">
                        {link.children.map((child) => (
                          <Link
                            key={child.label}
                            to={child.href}
                            className="block py-2 px-2 text-sm text-obsidian-500 dark:text-obsidian-400 hover:text-gold-600"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>

              <div className="p-6 border-t border-cream-200 dark:border-obsidian-800 space-y-4">
                <Link to={user ? '/cuenta' : '/auth'} className="flex items-center gap-3 text-sm text-obsidian-700 dark:text-cream-200 hover:text-gold-600">
                  <User size={18} /> {user ? 'Mi Cuenta' : 'Iniciar Sesión'}
                </Link>
                <div className="flex items-center gap-3 text-sm text-obsidian-500">
                  <Phone size={16} /> +52 (55) 1234-5678
                </div>
                <div className="flex items-center gap-3 text-sm text-obsidian-500">
                  <Mail size={16} /> hola@sahiragold.com
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
