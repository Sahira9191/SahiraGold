import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown, ChevronLeft, ChevronRight, Heart, ShoppingBag,
  Share2, Star, Truck, Shield, RefreshCw, Award, Check
} from 'lucide-react'
import useCartStore from '../store/cartStore'
import useAuthStore from '../store/authStore'
import ProductCard from '../components/product/ProductCard'
import { MOCK_PRODUCTS, MOCK_REVIEWS } from '../lib/mockData'
import useSettingsStore from '../store/settingsStore'

const useFormatPrice = () => useSettingsStore(s => s.formatPrice)

/* ─── Image Gallery ──────────────────── */
function ImageGallery({ images, name }) {
  const [current, setCurrent] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div
        className="relative aspect-square overflow-hidden bg-cream-100 dark:bg-obsidian-900 cursor-zoom-in"
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          src={images[current]}
          alt={`${name} — imagen ${current + 1}`}
          className="w-full h-full object-cover transition-all duration-500"
          style={zoomed ? {
            transform: 'scale(2)',
            transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
          } : {}}
        />

        {/* Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrent((c) => (c - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 flex items-center justify-center hover:bg-gold-500 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setCurrent((c) => (c + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 flex items-center justify-center hover:bg-gold-500 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {zoomed && (
          <div className="absolute bottom-3 right-3 bg-obsidian-950/60 text-cream-100 text-xs px-2 py-1">
            🔍 Zoom activo
          </div>
        )}
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`flex-shrink-0 w-20 h-20 overflow-hidden border-2 transition-all
              ${current === i ? 'border-gold-500' : 'border-cream-200 dark:border-obsidian-700 hover:border-gold-300'}`}
          >
            <img src={img} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  )
}

/* ─── Reviews Section ─────────────────── */
function ReviewsSection({ reviews, rating, count }) {
  const [showForm, setShowForm] = useState(false)
  const [newRating, setNewRating] = useState(5)
  const [comment, setComment] = useState('')

  return (
    <div className="mt-16 pt-12 border-t border-cream-200 dark:border-obsidian-800">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-2xl text-obsidian-900 dark:text-cream-100 mb-1">Reseñas</h2>
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={14} className={s <= Math.round(parseFloat(rating)) ? 'fill-gold-500 text-gold-500' : 'fill-cream-200 text-cream-200'} />
              ))}
            </div>
            <span className="font-display text-xl font-semibold text-gold-600">{rating}</span>
            <span className="text-sm text-obsidian-400">({count} reseñas)</span>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-outline-gold text-xs">
          Escribir reseña
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-8"
          >
            <div className="bg-cream-50 dark:bg-obsidian-900 border border-cream-200 dark:border-obsidian-800 p-6">
              <h3 className="font-display text-lg mb-4 text-obsidian-900 dark:text-cream-100">Tu reseña</h3>
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => setNewRating(s)}>
                    <Star size={24} className={s <= newRating ? 'fill-gold-500 text-gold-500' : 'text-cream-300'} />
                  </button>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Cuéntanos tu experiencia con este producto..."
                rows={4}
                className="input-luxury mb-4 resize-none"
              />
              <button className="btn-gold text-xs">Publicar reseña</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {reviews.map(review => (
          <div key={review.id} className="border-b border-cream-100 dark:border-obsidian-800 pb-6 last:border-0">
            <div className="flex items-start gap-4">
              <img src={review.user.avatar} alt={review.user.full_name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-obsidian-900 dark:text-cream-100">{review.user.full_name}</span>
                  <span className="text-xs text-obsidian-400">{review.created_at}</span>
                </div>
                <div className="flex gap-0.5 mb-2">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={12} className={s <= review.rating ? 'fill-gold-500 text-gold-500' : 'fill-cream-200 text-cream-200'} />
                  ))}
                </div>
                <p className="text-sm text-obsidian-600 dark:text-obsidian-400 leading-relaxed">{review.comment}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Product Detail Page ─────────────── */
export default function ProductDetail() {
  const { slug } = useParams()
  const product = MOCK_PRODUCTS.find(p => p.slug === slug) || MOCK_PRODUCTS[0]
  const related = MOCK_PRODUCTS.filter(p => p.id !== product.id && p.category?.id === product.category?.id).slice(0, 4)
  const formatPrice = useFormatPrice()

  const [selectedVariant, setSelectedVariant] = useState(null)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [openAccordion, setOpenAccordion] = useState('descripcion')

  const addItem = useCartStore(s => s.addItem)
  const openCart = useCartStore(s => s.openCart)
  const toggleWishlist = useAuthStore(s => s.toggleWishlist)
  const isWishlisted = useAuthStore(s => s.isWishlisted(product.id))

  const discountPct = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100) : null

  const finalPrice = product.price + (selectedVariant?.price_modifier || 0)

  const handleAdd = () => {
    addItem(product, selectedVariant, qty)
    setAdded(true)
    openCart()
    setTimeout(() => setAdded(false), 2500)
  }

  const ACCORDIONS = [
    {
      id: 'descripcion',
      title: 'Descripción',
      content: product.description,
    },
    {
      id: 'materiales',
      title: 'Materiales y Certificación',
      content: `Material: ${product.material} | Peso: ${product.weight}g. Todas nuestras joyas cuentan con certificado de autenticidad Sahira Gold y son verificadas por gemólogos certificados. Libre de níquel.`,
    },
    {
      id: 'envio',
      title: 'Envío y Entrega',
      content: 'Envío express en 1-3 días hábiles. Envío estándar en 5-7 días hábiles. Envío gratis en compras mayores a $5,000 MXN. Seguimiento en tiempo real incluido.',
    },
    {
      id: 'devoluciones',
      title: 'Devoluciones',
      content: '30 días para devoluciones sin preguntas. La pieza debe estar en condiciones originales y con caja. Proceso de reembolso en 3-5 días hábiles.',
    },
  ]

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-obsidian-950">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-obsidian-900 border-b border-cream-100 dark:border-obsidian-800">
        <div className="container-luxury py-3">
          <nav className="flex items-center gap-2 text-xs text-obsidian-400">
            <Link to="/" className="hover:text-gold-600">Inicio</Link>
            <span>/</span>
            <Link to="/catalogo" className="hover:text-gold-600">Catálogo</Link>
            <span>/</span>
            <Link to={`/catalogo?cat=${product.category?.slug}`} className="hover:text-gold-600">{product.category?.name}</Link>
            <span>/</span>
            <span className="text-obsidian-700 dark:text-cream-200 truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container-luxury py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
          {/* Gallery */}
          <div>
            <ImageGallery images={product.images} name={product.name} />
          </div>

          {/* Info */}
          <div>
            {/* Badges */}
            <div className="flex gap-2 mb-4">
              {product.is_new && <span className="badge-new">Nuevo</span>}
              {product.is_bestseller && <span className="badge-gold">★ Bestseller</span>}
              {discountPct && <span className="badge-sale">-{discountPct}%</span>}
            </div>

            {/* Category */}
            <div className="text-gold-500 text-xs tracking-widest uppercase mb-2">{product.category?.name} · {product.material}</div>

            {/* Title */}
            <h1 className="font-display text-3xl lg:text-4xl font-semibold text-obsidian-900 dark:text-cream-100 mb-4 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={14} className={s <= Math.round(parseFloat(product.rating)) ? 'fill-gold-500 text-gold-500' : 'fill-cream-200 text-cream-200'} />
                ))}
              </div>
              <span className="text-sm text-gold-600 font-medium">{product.rating}</span>
              <span className="text-sm text-obsidian-400">({product.reviews_count} reseñas)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4 mb-8 pb-8 border-b border-cream-200 dark:border-obsidian-800">
              <span className="font-display text-4xl font-semibold text-gold-gradient">
                {formatPrice(finalPrice)}
              </span>
              {product.compare_price && (
                <span className="price-compare text-lg">{formatPrice(product.compare_price + (selectedVariant?.price_modifier || 0))}</span>
              )}
              {discountPct && (
                <span className="price-discount">Ahorras {discountPct}%</span>
              )}
            </div>

            {/* Variants */}
            {product.variants?.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-obsidian-700 dark:text-cream-200">
                    Talla: <strong>{selectedVariant?.value || 'Seleccionar'}</strong>
                  </span>
                  <button className="text-xs text-gold-600 hover:text-gold-700">Guía de tallas</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(selectedVariant?.id === v.id ? null : v)}
                      disabled={v.stock === 0}
                      className={`w-12 h-12 border text-sm font-medium transition-all duration-200
                        ${selectedVariant?.id === v.id
                          ? 'border-gold-500 bg-gold-500 text-obsidian-950 font-semibold'
                          : v.stock === 0
                            ? 'border-cream-200 text-cream-300 cursor-not-allowed line-through'
                            : 'border-cream-300 dark:border-obsidian-600 text-obsidian-700 dark:text-cream-200 hover:border-gold-400'
                        }`}
                    >
                      {v.value}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock indicator */}
            <div className="mb-6">
              {product.stock === 0 ? (
                <span className="badge-sold-out">Agotado — notifícame</span>
              ) : product.stock <= 3 ? (
                <span className="text-sm text-red-500 font-medium">⚡ ¡Últimas {product.stock} unidades!</span>
              ) : (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <Check size={14} /> En stock ({product.stock} disponibles)
                </span>
              )}
            </div>

            {/* Qty + Add */}
            <div className="flex gap-3 mb-6">
              <div className="flex border border-cream-200 dark:border-obsidian-700">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-12 h-14 flex items-center justify-center text-obsidian-500 hover:text-gold-600 transition-colors"
                >
                  −
                </button>
                <span className="w-12 h-14 flex items-center justify-center font-medium text-obsidian-900 dark:text-cream-100">
                  {qty}
                </span>
                <button
                  onClick={() => setQty(q => q + 1)}
                  className="w-12 h-14 flex items-center justify-center text-obsidian-500 hover:text-gold-600 transition-colors"
                >
                  +
                </button>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAdd}
                disabled={product.stock === 0}
                className={`flex-1 h-14 flex items-center justify-center gap-3 text-sm font-medium tracking-widest uppercase transition-all
                  ${added
                    ? 'bg-green-500 text-white'
                    : product.stock === 0
                      ? 'bg-cream-200 text-obsidian-400 cursor-not-allowed'
                      : 'btn-gold'
                  }`}
              >
                {added ? (
                  <><Check size={18} /> ¡Añadido al carrito!</>
                ) : (
                  <><ShoppingBag size={18} /> Añadir al carrito</>
                )}
              </motion.button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`w-14 h-14 border flex items-center justify-center transition-all
                  ${isWishlisted ? 'border-red-400 text-red-400 bg-red-50 dark:bg-red-950/20' : 'border-cream-200 dark:border-obsidian-700 text-obsidian-500 hover:border-red-300 hover:text-red-400'}`}
                aria-label="Añadir a favoritos"
              >
                <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Share */}
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-cream-200 dark:border-obsidian-800">
              <span className="text-xs text-obsidian-500 tracking-wide uppercase">Compartir:</span>
              {['Facebook', 'Instagram', 'WhatsApp'].map(s => (
                <button key={s} className="text-xs text-obsidian-500 hover:text-gold-600 transition-colors">{s}</button>
              ))}
              <button className="ml-auto text-obsidian-400 hover:text-gold-600 transition-colors">
                <Share2 size={16} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { icon: Truck, label: 'Envío gratis +$5,000' },
                { icon: Shield, label: 'Pago 100% seguro' },
                { icon: RefreshCw, label: '30 días devolución' },
                { icon: Award, label: 'Certificado de autenticidad' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-xs text-obsidian-600 dark:text-obsidian-400">
                  <Icon size={14} className="text-gold-500 flex-shrink-0" />
                  {label}
                </div>
              ))}
            </div>

            {/* Accordion */}
            <div className="border-t border-cream-200 dark:border-obsidian-800">
              {ACCORDIONS.map(acc => (
                <div key={acc.id} className="border-b border-cream-200 dark:border-obsidian-800">
                  <button
                    onClick={() => setOpenAccordion(openAccordion === acc.id ? null : acc.id)}
                    className="w-full flex items-center justify-between py-4 text-left"
                  >
                    <span className="text-sm font-medium tracking-wide text-obsidian-700 dark:text-cream-200">{acc.title}</span>
                    <ChevronDown
                      size={16}
                      className={`text-obsidian-400 transition-transform ${openAccordion === acc.id ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <AnimatePresence>
                    {openAccordion === acc.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="text-sm text-obsidian-600 dark:text-obsidian-400 leading-relaxed pb-4">
                          {acc.content}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <ReviewsSection reviews={MOCK_REVIEWS} rating={product.rating} count={product.reviews_count} />

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-20 pt-12 border-t border-cream-200 dark:border-obsidian-800">
            <h2 className="font-display text-2xl lg:text-3xl text-obsidian-900 dark:text-cream-100 mb-2">
              También te puede interesar
            </h2>
            <div className="w-12 h-px bg-gold-gradient mb-8" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
