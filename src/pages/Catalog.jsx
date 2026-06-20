import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, Grid, List, ChevronDown, X, Search } from 'lucide-react'
import ProductCard from '../components/product/ProductCard'
import { MOCK_PRODUCTS, CATEGORIES, MATERIALS } from '../lib/mockData'
import useFilterStore from '../store/filterStore'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Más recientes' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'rating', label: 'Mejor valorados' },
  { value: 'popular', label: 'Más populares' },
]

/* ─── Skeleton ──────────────────────────── */
function ProductSkeleton() {
  return (
    <div className="border border-cream-200 dark:border-obsidian-800">
      <div className="aspect-square skeleton" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-5 w-1/3 rounded" />
      </div>
    </div>
  )
}

/* ─── Filter Sidebar ────────────────────── */
function FilterSidebar({ onClose }) {
  const {
    category, setCategory,
    material, setMaterial,
    priceRange, setPriceRange,
    onlyAvailable, setOnlyAvailable,
    resetFilters,
  } = useFilterStore()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-obsidian-900 dark:text-cream-100">Filtros</h3>
        <div className="flex gap-3">
          <button onClick={resetFilters} className="text-xs text-gold-600 hover:text-gold-700 font-medium">
            Limpiar todo
          </button>
          {onClose && (
            <button onClick={onClose} className="text-obsidian-500 hover:text-obsidian-700 lg:hidden">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Category */}
      <div>
        <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-obsidian-600 dark:text-obsidian-400 mb-4">
          Categoría
        </h4>
        <div className="space-y-2">
          <button
            onClick={() => setCategory(null)}
            className={`w-full text-left text-sm py-1.5 px-2 transition-colors ${
              !category ? 'text-gold-600 font-medium' : 'text-obsidian-600 dark:text-obsidian-400 hover:text-gold-600'
            }`}
          >
            Todas las categorías
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(category?.id === cat.id ? null : cat)}
              className={`w-full text-left text-sm py-1.5 px-2 flex justify-between items-center transition-colors ${
                category?.id === cat.id ? 'text-gold-600 font-medium' : 'text-obsidian-600 dark:text-obsidian-400 hover:text-gold-600'
              }`}
            >
              <span>{cat.name}</span>
              <span className="text-xs text-obsidian-400">({cat.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Material */}
      <div>
        <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-obsidian-600 dark:text-obsidian-400 mb-4">
          Material
        </h4>
        <div className="space-y-2">
          {MATERIALS.map((mat) => (
            <label key={mat} className="flex items-center gap-3 cursor-pointer group">
              <div
                className={`w-4 h-4 border transition-colors flex items-center justify-center
                  ${material === mat ? 'border-gold-500 bg-gold-500' : 'border-cream-300 dark:border-obsidian-600 group-hover:border-gold-400'}`}
                onClick={() => setMaterial(material === mat ? null : mat)}
              >
                {material === mat && <span className="text-obsidian-950 text-[10px] font-bold">✓</span>}
              </div>
              <span
                className={`text-sm cursor-pointer ${material === mat ? 'text-gold-600 font-medium' : 'text-obsidian-600 dark:text-obsidian-400'}`}
                onClick={() => setMaterial(material === mat ? null : mat)}
              >
                {mat}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-obsidian-600 dark:text-obsidian-400 mb-4">
          Precio
        </h4>
        <div className="space-y-3">
          <input
            type="range"
            min={0}
            max={50000}
            step={500}
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
            className="w-full accent-gold-500"
          />
          <div className="flex justify-between text-xs text-obsidian-500">
            <span>${priceRange[0].toLocaleString('es-MX')}</span>
            <span>${priceRange[1].toLocaleString('es-MX')}</span>
          </div>
        </div>
      </div>

      {/* Availability */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            className={`w-4 h-4 border transition-colors flex items-center justify-center
              ${onlyAvailable ? 'border-gold-500 bg-gold-500' : 'border-cream-300 dark:border-obsidian-600'}`}
            onClick={() => setOnlyAvailable(!onlyAvailable)}
          >
            {onlyAvailable && <span className="text-obsidian-950 text-[10px] font-bold">✓</span>}
          </div>
          <span
            className="text-sm text-obsidian-600 dark:text-obsidian-400 cursor-pointer"
            onClick={() => setOnlyAvailable(!onlyAvailable)}
          >
            Solo disponibles
          </span>
        </label>
      </div>
    </div>
  )
}

/* ─── Catalog Page ─────────────────────── */
export default function Catalog() {
  const [searchParams] = useSearchParams()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

  const {
    category, material, priceRange, onlyAvailable, sortBy, setSortBy, view, setView
  } = useFilterStore()

  const urlSearch = searchParams.get('search') || ''

  const filtered = useMemo(() => {
    let products = [...MOCK_PRODUCTS]

    if (urlSearch) {
      products = products.filter(p =>
        p.name.toLowerCase().includes(urlSearch.toLowerCase()) ||
        p.material.toLowerCase().includes(urlSearch.toLowerCase())
      )
    }
    if (category) {
      products = products.filter(p => p.category?.id === category.id)
    }
    if (material) {
      products = products.filter(p => p.material === material)
    }
    if (onlyAvailable) {
      products = products.filter(p => p.stock > 0)
    }
    products = products.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])

    switch (sortBy) {
      case 'price_asc':  products.sort((a, b) => a.price - b.price); break
      case 'price_desc': products.sort((a, b) => b.price - a.price); break
      case 'rating':     products.sort((a, b) => b.rating - a.rating); break
      case 'popular':    products.sort((a, b) => b.reviews_count - a.reviews_count); break
      default:           products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }

    return products
  }, [category, material, priceRange, onlyAvailable, sortBy, urlSearch])

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-obsidian-950">
      {/* Page header */}
      <div className="bg-obsidian-950 text-cream-100 py-16">
        <div className="container-luxury text-center">
          <div className="text-gold-400 text-xs tracking-[0.5em] uppercase mb-3">Joyas de Lujo</div>
          <h1 className="font-display text-4xl lg:text-5xl font-semibold mb-3">
            {urlSearch ? `Resultados: "${urlSearch}"` : category ? category.name : 'Catálogo'}
          </h1>
          <div className="divider-gold" />
        </div>
      </div>

      <div className="container-luxury py-10">
        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-28 bg-white dark:bg-obsidian-900 border border-cream-200 dark:border-obsidian-800 p-6">
              <FilterSidebar />
            </div>
          </aside>

          {/* Products */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden btn-outline-gold text-xs px-4 py-2.5 flex items-center gap-2"
                >
                  <SlidersHorizontal size={14} /> Filtros
                </button>
                <span className="text-sm text-obsidian-500 dark:text-obsidian-400">
                  <strong className="text-obsidian-900 dark:text-cream-100">{filtered.length}</strong> productos
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort */}
                <div className="relative">
                  <button
                    onClick={() => setSortOpen(!sortOpen)}
                    className="flex items-center gap-2 text-sm text-obsidian-600 dark:text-obsidian-400 border border-cream-200 dark:border-obsidian-700 px-3 py-2 hover:border-gold-400 transition-colors"
                  >
                    {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                    <ChevronDown size={14} />
                  </button>
                  <AnimatePresence>
                    {sortOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-obsidian-900 border border-cream-200 dark:border-obsidian-700 shadow-lg z-20"
                      >
                        {SORT_OPTIONS.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => { setSortBy(opt.value); setSortOpen(false) }}
                            className={`block w-full text-left px-4 py-2.5 text-sm transition-colors
                              ${sortBy === opt.value ? 'text-gold-600 font-medium bg-cream-50 dark:bg-obsidian-800' : 'text-obsidian-600 dark:text-obsidian-400 hover:bg-cream-50 dark:hover:bg-obsidian-800'}`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* View toggle */}
                <div className="flex border border-cream-200 dark:border-obsidian-700">
                  <button
                    onClick={() => setView('grid')}
                    className={`p-2 transition-colors ${view === 'grid' ? 'bg-gold-500 text-obsidian-950' : 'text-obsidian-400 hover:text-gold-600'}`}
                    aria-label="Vista grid"
                  >
                    <Grid size={16} />
                  </button>
                  <button
                    onClick={() => setView('list')}
                    className={`p-2 transition-colors ${view === 'list' ? 'bg-gold-500 text-obsidian-950' : 'text-obsidian-400 hover:text-gold-600'}`}
                    aria-label="Vista lista"
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Products grid */}
            {filtered.length === 0 ? (
              <div className="text-center py-24">
                <Search size={48} className="text-cream-300 mx-auto mb-4" />
                <p className="font-display text-xl text-obsidian-400 mb-2">No se encontraron productos</p>
                <p className="text-sm text-obsidian-400">Intenta ajustar los filtros de búsqueda</p>
              </div>
            ) : (
              <div className={view === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'
                : 'flex flex-col gap-4'
              }>
                {filtered.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filters drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30 }}
              className="fixed top-0 left-0 h-full w-80 bg-white dark:bg-obsidian-900 z-50 p-6 overflow-y-auto"
            >
              <FilterSidebar onClose={() => setMobileFiltersOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
