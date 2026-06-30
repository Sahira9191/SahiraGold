import { useState, useEffect, useCallback } from 'react'
import { MOCK_PRODUCTS } from '../lib/mockData'
import { lsGet, lsSet } from '../lib/storage'

const LS_KEY = 'products'

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const makeSlug = (name) =>
  name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-') + '-' + Date.now()

function loadProducts() {
  const saved = lsGet(LS_KEY, null)
  if (saved && Array.isArray(saved) && saved.length > 0) return saved
  return MOCK_PRODUCTS
}

function persistProducts(list) {
  lsSet(LS_KEY, list)
}

/* ─── Hook principal ──────────────────────────────────────────────────────── */
export function useProducts({ adminMode = false } = {}) {
  const [products, setProductsState] = useState([])
  const [loading, setLoading] = useState(true)

  const setProducts = useCallback((updater) => {
    setProductsState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      persistProducts(next)
      return next
    })
  }, [])

  // Carga inicial desde localStorage (o fallback a mock)
  useEffect(() => {
    const all = loadProducts()
    const visible = adminMode ? all : all.filter(p => p.is_active !== false)
    setProductsState(visible)
    setLoading(false)
  }, [adminMode])

  /* ── Guardar (crear o actualizar) ───────────────────────────────────────── */
  const saveProduct = useCallback(async (formData, existingProduct = null) => {
    const isEdit = Boolean(existingProduct?.id)

    const payload = {
      name:          formData.name?.trim() || '',
      description:   formData.description || '',
      price:         Number(formData.price) || 0,
      compare_price: formData.compare_price ? Number(formData.compare_price) : null,
      stock:         Number(formData.stock) || 0,
      weight:        Number(formData.weight) || 0,
      images:        (formData.images || []).filter(Boolean),
      material:      formData.material || '',
      category:      formData.category || { id: 'otros', name: 'Otros' },
      category_name: formData.category?.name || '',
      category_slug: formData.category?.id || '',
      is_active:     formData.is_active ?? true,
      is_new:        formData.is_new ?? false,
      is_bestseller: formData.is_bestseller ?? false,
      updated_at:    new Date().toISOString(),
    }

    if (isEdit) {
      const updated = { ...existingProduct, ...payload }
      setProducts(prev => {
        const all = lsGet(LS_KEY, MOCK_PRODUCTS)
        return all.map(p => p.id === existingProduct.id ? updated : p)
      })
      // Also update the local displayed list
      setProductsState(prev => prev.map(p => p.id === existingProduct.id ? updated : p))
      persistProducts(lsGet(LS_KEY, MOCK_PRODUCTS).map(p => p.id === existingProduct.id ? updated : p))
      return updated
    } else {
      const newProduct = {
        ...payload,
        id: Date.now(),
        slug: makeSlug(payload.name),
        rating: '5.0',
        reviews_count: 0,
        created_at: new Date().toISOString(),
      }
      const all = lsGet(LS_KEY, MOCK_PRODUCTS)
      const next = [newProduct, ...all]
      persistProducts(next)
      setProductsState(prev => adminMode ? [newProduct, ...prev] : (newProduct.is_active ? [newProduct, ...prev] : prev))
      return newProduct
    }
  }, [adminMode, setProducts])

  /* ── Eliminar ──────────────────────────────────────────────────────────── */
  const deleteProduct = useCallback(async (id) => {
    const all = lsGet(LS_KEY, MOCK_PRODUCTS)
    const next = all.filter(p => p.id !== id)
    persistProducts(next)
    setProductsState(prev => prev.filter(p => p.id !== id))
  }, [])

  /* ── Actualizar stock inline ───────────────────────────────────────────── */
  const updateStock = useCallback(async (id, newStock) => {
    const all = lsGet(LS_KEY, MOCK_PRODUCTS)
    const next = all.map(p => p.id === id ? { ...p, stock: newStock, updated_at: new Date().toISOString() } : p)
    persistProducts(next)
    setProductsState(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p))
  }, [])

  return {
    products,
    loading,
    error: null,
    setProducts,
    refetch: () => {
      const all = loadProducts()
      const visible = adminMode ? all : all.filter(p => p.is_active !== false)
      setProductsState(visible)
    },
    saveProduct,
    deleteProduct,
    updateStock,
  }
}

/* ─── Hook para un solo producto por slug ─────────────────────────────────── */
export function useProductBySlug(slug) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    const all = loadProducts()
    const found = all.find(p => p.slug === slug) || null
    setProduct(found)
    setLoading(false)
  }, [slug])

  return { product, loading }
}
