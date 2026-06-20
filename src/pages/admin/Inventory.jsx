import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, Edit, Trash2, Eye, X, Filter, Download, Upload,
  ChevronDown, AlertTriangle, Check, Package, Image,
} from 'lucide-react'
import { MOCK_PRODUCTS, CATEGORIES } from '../../lib/mockData'
import { toast } from 'sonner'

const MATERIALS = ['Oro 24K', 'Oro 18K', 'Oro 14K', 'Oro Blanco', 'Oro Rosa', 'Platino']
const PAGE_SIZE = 15

const formatPrice = (n) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
          checked ? 'bg-yellow-500' : 'bg-slate-600'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </div>
      {label && <span className="text-sm text-slate-300">{label}</span>}
    </label>
  )
}

// ─── Product Modal ────────────────────────────────────────────────────────────
function ProductModal({ product, onClose, onSave }) {
  const isEdit = Boolean(product)
  const overlayRef = useRef(null)

  const [form, setForm] = useState({
    name: product?.name ?? '',
    category: product?.category ?? CATEGORIES[0],
    material: product?.material ?? MATERIALS[0],
    price: product?.price ?? '',
    compare_price: product?.compare_price ?? '',
    stock: product?.stock ?? '',
    weight: product?.weight ?? '',
    description: product?.description ?? '',
    images: product?.images ?? ['', '', ''],
    is_active: product?.is_active ?? true,
    is_new: product?.is_new ?? false,
    is_bestseller: product?.is_bestseller ?? false,
  })

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose()
  }

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }))

  const setImage = (index, val) =>
    setForm((prev) => {
      const imgs = [...prev.images]
      imgs[index] = val
      return { ...prev, images: imgs }
    })

  const handleCategoryChange = (id) => {
    const cat = CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0]
    set('category', cat)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('El nombre es obligatorio'); return }
    if (!form.price || Number(form.price) <= 0) { toast.error('El precio debe ser mayor a 0'); return }
    if (form.stock === '' || Number(form.stock) < 0) { toast.error('El stock no puede ser negativo'); return }

    const saved = {
      ...product,
      ...form,
      price: Number(form.price),
      compare_price: form.compare_price ? Number(form.compare_price) : null,
      stock: Number(form.stock),
      weight: Number(form.weight) || 0,
      images: form.images.filter(Boolean).length
        ? form.images
        : product?.images ?? ['', '', ''],
    }
    onSave(saved)
    toast.success(isEdit ? 'Producto actualizado' : 'Producto creado')
    onClose()
  }

  const inputCls =
    'w-full bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-400 rounded-lg px-3 py-2 text-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 focus:outline-none'
  const labelCls = 'block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1'

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.18 }}
        className="relative w-full max-w-2xl bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700">
          <div>
            <h2 className="text-lg font-bold text-slate-100">
              {isEdit ? `Editar: ${product.name}` : 'Nuevo Producto'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isEdit ? `ID: ${product.id}` : 'Completa los campos para crear el producto'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className={labelCls}>Nombre del Producto *</label>
            <input
              className={inputCls}
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Ej. Anillo Eternidad Diamante"
            />
          </div>

          {/* Category + Material */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Categoría</label>
              <div className="relative">
                <select
                  className={inputCls + ' appearance-none pr-8'}
                  value={form.category?.id ?? CATEGORIES[0].id}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Material</label>
              <div className="relative">
                <select
                  className={inputCls + ' appearance-none pr-8'}
                  value={form.material}
                  onChange={(e) => set('material', e.target.value)}
                >
                  {MATERIALS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Price + Compare Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Precio (MXN) *</label>
              <input
                type="number"
                min="0"
                className={inputCls}
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <label className={labelCls}>Precio tachado (MXN)</label>
              <input
                type="number"
                min="0"
                className={inputCls}
                value={form.compare_price}
                onChange={(e) => set('compare_price', e.target.value)}
                placeholder="Opcional"
              />
            </div>
          </div>

          {/* Stock + Weight */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Stock *</label>
              <input
                type="number"
                min="0"
                className={inputCls}
                value={form.stock}
                onChange={(e) => set('stock', e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <label className={labelCls}>Peso (g)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                className={inputCls}
                value={form.weight}
                onChange={(e) => set('weight', e.target.value)}
                placeholder="0.0"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Descripción</label>
            <textarea
              rows={3}
              className={inputCls + ' resize-none'}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Descripción del producto..."
            />
          </div>

          {/* Images */}
          <div>
            <label className={labelCls}>Imágenes (URL)</label>
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  {form.images[i] ? (
                    <img
                      src={form.images[i]}
                      alt={`img-${i}`}
                      className="w-9 h-9 rounded-md object-cover border border-slate-600 flex-shrink-0"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-md bg-slate-700 border border-slate-600 flex items-center justify-center flex-shrink-0">
                      <Image size={14} className="text-slate-500" />
                    </div>
                  )}
                  <input
                    className={inputCls}
                    value={form.images[i]}
                    onChange={(e) => setImage(i, e.target.value)}
                    placeholder={`Imagen ${i + 1} — URL completa`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-6 pt-1">
            <Toggle checked={form.is_active} onChange={(v) => set('is_active', v)} label="Activo" />
            <Toggle checked={form.is_new} onChange={(v) => set('is_new', v)} label="Nuevo" />
            <Toggle checked={form.is_bestseller} onChange={(v) => set('is_bestseller', v)} label="Más vendido" />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-700 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-slate-950 text-sm font-semibold transition-colors"
            >
              {isEdit ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteConfirmModal({ product, onClose, onConfirm }) {
  const overlayRef = useRef(null)

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-sm bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-900/40 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={18} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Eliminar producto</h3>
            <p className="text-xs text-slate-400">Esta acción no se puede deshacer</p>
          </div>
        </div>
        <p className="text-sm text-slate-300 mb-6">
          ¿Deseas eliminar permanentemente{' '}
          <span className="font-semibold text-slate-100">"{product.name}"</span>?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 text-sm font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors"
          >
            Eliminar
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Stock Cell (inline editable) ─────────────────────────────────────────────
function StockCell({ product, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(String(product.stock))
  const inputRef = useRef(null)

  const stockColor =
    product.stock === 0
      ? 'text-red-400'
      : product.stock <= 3
      ? 'text-red-400'
      : product.stock <= 10
      ? 'text-yellow-400'
      : 'text-emerald-400'

  const handleClick = () => {
    setEditing(true)
    setValue(String(product.stock))
    setTimeout(() => inputRef.current?.select(), 0)
  }

  const handleBlur = () => {
    const num = parseInt(value, 10)
    if (!isNaN(num) && num >= 0 && num !== product.stock) {
      onUpdate(num)
      toast.success(`Stock de "${product.name}" actualizado a ${num}`)
    }
    setEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') inputRef.current?.blur()
    if (e.key === 'Escape') { setEditing(false); setValue(String(product.stock)) }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        min="0"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-16 bg-slate-700 border border-yellow-500 text-slate-100 rounded px-2 py-0.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-yellow-500/30"
      />
    )
  }

  return (
    <button
      onClick={handleClick}
      title="Clic para editar stock"
      className={`font-semibold text-sm tabular-nums hover:underline decoration-dotted cursor-pointer ${stockColor}`}
    >
      {product.stock}
      {product.stock === 0 && (
        <span className="ml-1 text-xs text-red-400 font-normal">· agotado</span>
      )}
      {product.stock > 0 && product.stock <= 3 && (
        <span className="ml-1 text-xs text-red-400 font-normal">· bajo</span>
      )}
    </button>
  )
}

// ─── Sort Icon ────────────────────────────────────────────────────────────────
function SortIcon({ col, sortBy, sortDir }) {
  return (
    <span className="ml-1 inline-flex flex-col leading-none">
      <span className={`text-[10px] leading-none ${sortBy === col && sortDir === 'asc' ? 'text-yellow-400' : 'text-slate-600'}`}>▲</span>
      <span className={`text-[10px] leading-none ${sortBy === col && sortDir === 'desc' ? 'text-yellow-400' : 'text-slate-600'}`}>▼</span>
    </span>
  )
}

// ─── Main Inventory Page ──────────────────────────────────────────────────────
export default function Inventory() {
  const [products, setProducts] = useState(() => [...MOCK_PRODUCTS])
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterStock, setFilterStock] = useState('all')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [sortBy, setSortBy] = useState('name')
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)

  // ── Filtering & Sorting ──────────────────────────────────────────────────
  const filtered = products
    .filter((p) => {
      const q = search.toLowerCase()
      if (q && !p.name.toLowerCase().includes(q) && !p.id.toLowerCase().includes(q)) return false
      if (filterCategory !== 'all' && p.category.id !== filterCategory) return false
      if (filterStatus === 'active' && !p.is_active) return false
      if (filterStatus === 'inactive' && p.is_active) return false
      if (filterStock === 'low' && !(p.stock > 0 && p.stock <= 10)) return false
      if (filterStock === 'out' && p.stock !== 0) return false
      return true
    })
    .sort((a, b) => {
      let va, vb
      if (sortBy === 'name') { va = a.name; vb = b.name }
      else if (sortBy === 'price') { va = a.price; vb = b.price }
      else if (sortBy === 'stock') { va = a.stock; vb = b.stock }
      else if (sortBy === 'category') { va = a.category.name; vb = b.category.name }
      else { va = a.name; vb = b.name }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1) }, [search, filterCategory, filterStatus, filterStock, sortBy, sortDir])

  // ── Selection ────────────────────────────────────────────────────────────
  const allPageSelected = paginated.length > 0 && paginated.every((p) => selectedIds.has(p.id))
  const someSelected = selectedIds.size > 0

  const toggleAll = () => {
    if (allPageSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        paginated.forEach((p) => next.delete(p.id))
        return next
      })
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        paginated.forEach((p) => next.add(p.id))
        return next
      })
    }
  }

  const toggleOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // ── Bulk Actions ─────────────────────────────────────────────────────────
  const bulkSetActive = (active) => {
    setProducts((prev) =>
      prev.map((p) => (selectedIds.has(p.id) ? { ...p, is_active: active } : p))
    )
    toast.success(`${selectedIds.size} productos ${active ? 'activados' : 'desactivados'}`)
    setSelectedIds(new Set())
  }

  const bulkDelete = () => {
    const count = selectedIds.size
    setProducts((prev) => prev.filter((p) => !selectedIds.has(p.id)))
    toast.success(`${count} productos eliminados`)
    setSelectedIds(new Set())
  }

  // ── Row Actions ──────────────────────────────────────────────────────────
  const handleSaveProduct = (saved) => {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id)
      if (idx === -1) {
        const newProduct = {
          ...saved,
          id: `prod-new-${Date.now()}`,
          slug: `producto-nuevo-${Date.now()}`,
          rating: '4.5',
          reviews_count: 0,
          created_at: new Date().toISOString(),
        }
        return [newProduct, ...prev]
      }
      const next = [...prev]
      next[idx] = saved
      return next
    })
  }

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return
    setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id))
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(deleteTarget.id)
      return next
    })
    toast.success(`"${deleteTarget.name}" eliminado`)
    setDeleteTarget(null)
  }

  const handleStockUpdate = (productId, newStock) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
    )
  }

  // ── Sort Toggle ──────────────────────────────────────────────────────────
  const handleSort = (col) => {
    if (sortBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortBy(col); setSortDir('asc') }
  }

  // ── CSV Export ───────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    const headers = [
      'ID', 'Nombre', 'Categoría', 'Material', 'Precio', 'Precio Tachado',
      'Stock', 'Peso', 'Activo', 'Nuevo', 'Más Vendido', 'Creado',
    ]
    const rows = products.map((p) => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.category.name,
      p.material,
      p.price,
      p.compare_price ?? '',
      p.stock,
      p.weight,
      p.is_active ? 'Sí' : 'No',
      p.is_new ? 'Sí' : 'No',
      p.is_bestseller ? 'Sí' : 'No',
      new Date(p.created_at).toLocaleDateString('es-MX'),
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sahira-inventario-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exportado correctamente')
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  const filtersActive =
    filterCategory !== 'all' || filterStatus !== 'all' || filterStock !== 'all' || search !== ''

  const clearFilters = () => {
    setSearch('')
    setFilterCategory('all')
    setFilterStatus('all')
    setFilterStock('all')
  }

  const selectCls =
    'bg-slate-700 border border-slate-600 text-slate-100 rounded-lg px-3 py-2 text-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 focus:outline-none appearance-none cursor-pointer'

  // Pagination page numbers with ellipsis
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce((acc, p, idx, arr) => {
      if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…')
      acc.push(p)
      return acc
    }, [])

  // Stats
  const outOfStock = products.filter((p) => p.stock === 0).length
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 10).length

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-6"
      >
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Inventario</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {products.length} productos
              {outOfStock > 0 && (
                <span className="text-red-400"> · {outOfStock} agotados</span>
              )}
              {lowStock > 0 && (
                <span className="text-yellow-400"> · {lowStock} con stock bajo</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 text-sm font-medium transition-colors"
            >
              <Download size={15} />
              Exportar CSV
            </button>
            <button
              onClick={() => { setEditProduct(null); setShowModal(true) }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-slate-950 text-sm font-semibold transition-colors"
            >
              <Plus size={15} />
              Nuevo Producto
            </button>
          </div>
        </div>

        {/* ── Filter / Search Bar ── */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o ID..."
              className="w-full bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-400 rounded-lg pl-9 pr-3 py-2 text-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 focus:outline-none"
            />
          </div>

          {/* Category */}
          <div className="relative">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={selectCls + ' pr-8'}
            >
              <option value="all">Todas las categorías</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Status */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={selectCls + ' pr-8'}
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Stock filter */}
          <div className="relative">
            <select
              value={filterStock}
              onChange={(e) => setFilterStock(e.target.value)}
              className={selectCls + ' pr-8'}
            >
              <option value="all">Todo el stock</option>
              <option value="low">Stock bajo (≤10)</option>
              <option value="out">Sin stock</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Clear filters */}
          {filtersActive && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-700 border border-slate-600 transition-colors"
            >
              <X size={13} />
              Limpiar
            </button>
          )}
        </div>

        {/* ── Bulk Actions Bar ── */}
        <AnimatePresence>
          {someSelected && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-3 px-4 py-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
            >
              <div className="flex items-center gap-2 mr-1">
                <Check size={14} className="text-yellow-400" />
                <span className="text-sm font-semibold text-yellow-300">
                  {selectedIds.size} seleccionado{selectedIds.size !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={() => bulkSetActive(true)}
                className="px-3 py-1.5 rounded-lg bg-emerald-900/40 hover:bg-emerald-900/60 text-emerald-400 text-xs font-semibold border border-emerald-700/50 transition-colors"
              >
                Activar
              </button>
              <button
                onClick={() => bulkSetActive(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-semibold border border-slate-600 transition-colors"
              >
                Desactivar
              </button>
              <button
                onClick={bulkDelete}
                className="px-3 py-1.5 rounded-lg bg-red-900/40 hover:bg-red-900/60 text-red-400 text-xs font-semibold border border-red-700/50 transition-colors"
              >
                Eliminar
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="ml-auto p-1 text-slate-500 hover:text-slate-300 transition-colors"
                title="Deseleccionar todo"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Products Table ── */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px]">
              <thead>
                <tr className="bg-slate-800 border-b border-slate-700">
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allPageSelected}
                      onChange={toggleAll}
                      className="w-4 h-4 rounded border-slate-500 bg-slate-700 accent-yellow-500 cursor-pointer"
                    />
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-slate-400 tracking-widest uppercase cursor-pointer hover:text-slate-200 transition-colors select-none"
                    onClick={() => handleSort('name')}
                  >
                    <span className="flex items-center gap-1">
                      Producto
                      <SortIcon col="name" sortBy={sortBy} sortDir={sortDir} />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 tracking-widest uppercase">
                    SKU
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-slate-400 tracking-widest uppercase cursor-pointer hover:text-slate-200 transition-colors select-none"
                    onClick={() => handleSort('category')}
                  >
                    <span className="flex items-center gap-1">
                      Categoría
                      <SortIcon col="category" sortBy={sortBy} sortDir={sortDir} />
                    </span>
                  </th>
                  <th
                    className="px-4 py-3 text-right text-xs font-semibold text-slate-400 tracking-widest uppercase cursor-pointer hover:text-slate-200 transition-colors select-none"
                    onClick={() => handleSort('price')}
                  >
                    <span className="flex items-center justify-end gap-1">
                      Precio
                      <SortIcon col="price" sortBy={sortBy} sortDir={sortDir} />
                    </span>
                  </th>
                  <th
                    className="px-4 py-3 text-center text-xs font-semibold text-slate-400 tracking-widest uppercase cursor-pointer hover:text-slate-200 transition-colors select-none"
                    onClick={() => handleSort('stock')}
                  >
                    <span className="flex items-center justify-center gap-1">
                      Stock
                      <SortIcon col="stock" sortBy={sortBy} sortDir={sortDir} />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 tracking-widest uppercase">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 tracking-widest uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Package size={36} className="text-slate-600" />
                        <p className="text-slate-400 font-medium">No se encontraron productos</p>
                        {filtersActive && (
                          <button
                            onClick={clearFilters}
                            className="text-sm text-yellow-400 hover:text-yellow-300 underline"
                          >
                            Limpiar filtros
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((product, idx) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.015 }}
                      className={`border-b border-slate-700/50 transition-colors ${
                        selectedIds.has(product.id)
                          ? 'bg-yellow-500/5'
                          : 'bg-slate-800/50 hover:bg-slate-800'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(product.id)}
                          onChange={() => toggleOne(product.id)}
                          className="w-4 h-4 rounded border-slate-500 bg-slate-700 accent-yellow-500 cursor-pointer"
                        />
                      </td>

                      {/* Product Name + Thumbnail */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-700 flex-shrink-0 bg-slate-700">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.style.display = 'none' }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Image size={14} className="text-slate-500" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p
                              className="text-sm font-medium text-slate-100 truncate max-w-[160px]"
                              title={product.name}
                            >
                              {product.name}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                              {product.is_new && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-400 font-semibold leading-none">
                                  NUEVO
                                </span>
                              )}
                              {product.is_bestseller && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-900/40 text-yellow-400 font-semibold leading-none">
                                  TOP
                                </span>
                              )}
                              <span className="text-[10px] text-slate-500">{product.material}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-slate-400">
                          SGC-{product.id.replace('prod-', '').padStart(4, '0')}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-300">{product.category.name}</span>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-semibold text-yellow-400">
                          {formatPrice(product.price)}
                        </span>
                        {product.compare_price && (
                          <p className="text-xs text-slate-500 line-through">
                            {formatPrice(product.compare_price)}
                          </p>
                        )}
                      </td>

                      {/* Stock (inline editable) */}
                      <td className="px-4 py-3 text-center">
                        <StockCell
                          product={product}
                          onUpdate={(val) => handleStockUpdate(product.id, val)}
                        />
                      </td>

                      {/* Status badge */}
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            product.is_active
                              ? 'bg-emerald-900/30 text-emerald-400'
                              : 'bg-slate-700 text-slate-400'
                          }`}
                        >
                          {product.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <a
                            href={`/producto/${product.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-900/20 transition-colors"
                            title="Ver en tienda"
                          >
                            <Eye size={15} />
                          </a>
                          <button
                            onClick={() => { setEditProduct(product); setShowModal(true) }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-yellow-400 hover:bg-yellow-900/20 transition-colors"
                            title="Editar producto"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(product)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                            title="Eliminar producto"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          {filtered.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-700">
              <p className="text-sm text-slate-400">
                Mostrando{' '}
                <span className="text-slate-200 font-medium">
                  {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)}
                </span>{' '}
                de{' '}
                <span className="text-slate-200 font-medium">{filtered.length}</span>{' '}
                productos
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Anterior
                </button>
                <div className="flex items-center gap-1">
                  {pageNumbers.map((p, i) =>
                    p === '…' ? (
                      <span key={`ellipsis-${i}`} className="px-2 text-slate-500 text-sm select-none">
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          page === p
                            ? 'bg-yellow-500 text-slate-950 font-semibold'
                            : 'bg-slate-700 hover:bg-slate-600 text-slate-300 border border-slate-600'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Modals (rendered outside main flow) ── */}
      <AnimatePresence>
        {showModal && (
          <ProductModal
            key="product-modal"
            product={editProduct}
            onClose={() => { setShowModal(false); setEditProduct(null) }}
            onSave={handleSaveProduct}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {deleteTarget && (
          <DeleteConfirmModal
            key="delete-modal"
            product={deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDeleteConfirm}
          />
        )}
      </AnimatePresence>
    </>
  )
}
