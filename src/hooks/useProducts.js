import { useState, useEffect, useCallback } from 'react'
import supabase from '../lib/supabase'
import { MOCK_PRODUCTS } from '../lib/mockData'

/* ─── Normaliza producto de Supabase al formato de la app ─── */
const normalize = (p) => ({
  ...p,
  category: {
    id:   p.category_slug || 'sin-categoria',
    name: p.category_name || 'Sin categoría',
  },
  images: Array.isArray(p.images) ? p.images.filter(Boolean) : [],
  rating: p.rating?.toString() || '5.0',
  reviews_count: p.reviews_count || 0,
})

/* ─── Genera slug único ───────────────────────────────────── */
const makeSlug = (name) =>
  name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // quita acentos
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    + '-' + Date.now()

/* ─── Hook principal ──────────────────────────────────────── */
export function useProducts({ adminMode = false } = {}) {
  const [products, setProducts]   = useState([])
  const [loading,  setLoading]    = useState(true)
  const [error,    setError]      = useState(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (!adminMode) {
        query = query.eq('is_active', true)
      }

      const { data, error: qErr } = await query
      if (qErr) throw qErr

      if (data && data.length > 0) {
        setProducts(data.map(normalize))
      } else {
        // Fallback a datos de muestra si la BD está vacía
        const fallback = adminMode
          ? MOCK_PRODUCTS
          : MOCK_PRODUCTS.filter(p => p.is_active !== false)
        setProducts(fallback)
      }
    } catch (err) {
      console.error('[useProducts]', err.message)
      setError(err.message)
      setProducts(MOCK_PRODUCTS)
    } finally {
      setLoading(false)
    }
  }, [adminMode])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  /* ── Guardar (crear o actualizar) ─────────────────────── */
  const saveProduct = async (formData, existingProduct = null) => {
    const isEdit = Boolean(existingProduct?.id)

    const payload = {
      name:          formData.name.trim(),
      description:   formData.description || '',
      price:         Number(formData.price),
      compare_price: formData.compare_price ? Number(formData.compare_price) : null,
      stock:         Number(formData.stock),
      weight:        Number(formData.weight) || 0,
      images:        formData.images.filter(Boolean),
      material:      formData.material || '',
      category_name: formData.category?.name || '',
      category_slug: formData.category?.id   || '',
      is_active:     formData.is_active  ?? true,
      is_new:        formData.is_new     ?? false,
      is_bestseller: formData.is_bestseller ?? false,
      updated_at:    new Date().toISOString(),
    }

    try {
      if (isEdit) {
        const { data, error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', existingProduct.id)
          .select()
          .single()
        if (error) throw error
        return normalize(data)
      } else {
        payload.slug = makeSlug(payload.name)
        payload.rating = 0
        payload.reviews_count = 0
        const { data, error } = await supabase
          .from('products')
          .insert(payload)
          .select()
          .single()
        if (error) throw error
        return normalize(data)
      }
    } catch (err) {
      throw new Error(err.message)
    }
  }

  /* ── Eliminar ─────────────────────────────────────────── */
  const deleteProduct = async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw new Error(error.message)
  }

  /* ── Actualizar stock inline ──────────────────────────── */
  const updateStock = async (id, newStock) => {
    const { error } = await supabase
      .from('products')
      .update({ stock: newStock, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw new Error(error.message)
  }

  return {
    products,
    loading,
    error,
    setProducts,
    refetch: fetchProducts,
    saveProduct,
    deleteProduct,
    updateStock,
  }
}

/* ─── Hook para un solo producto por slug ─────────────────── */
export function useProductBySlug(slug) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    async function fetch() {
      setLoading(true)
      try {
        const { data } = await supabase
          .from('products')
          .select('*')
          .eq('slug', slug)
          .single()

        if (data) {
          setProduct(normalize(data))
        } else {
          // Fallback a mock
          const mock = MOCK_PRODUCTS.find(p => p.slug === slug)
          setProduct(mock || null)
        }
      } catch {
        const mock = MOCK_PRODUCTS.find(p => p.slug === slug)
        setProduct(mock || null)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [slug])

  return { product, loading }
}
