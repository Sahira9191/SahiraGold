import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react'
import useCartStore from '../../store/cartStore'
import useAuthStore from '../../store/authStore'

const formatPrice = (n) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)

export default function ProductCard({ product, index = 0 }) {
  const [hovered, setHovered] = useState(false)
  const [added, setAdded] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const toggleWishlist = useAuthStore((s) => s.toggleWishlist)
  const isWishlisted = useAuthStore((s) => s.isWishlisted(product.id))

  const discountPct = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : null

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
    setAdded(true)
    openCart()
    setTimeout(() => setAdded(false), 2000)
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product.id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.4) }}
      className="card-product group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link to={`/producto/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-cream-100 dark:bg-obsidian-900">
          {/* Skeleton */}
          {!imgLoaded && <div className="absolute inset-0 skeleton" />}

          <img
            src={hovered && product.images?.[1] ? product.images[1] : product.images?.[0]}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-700
              ${hovered ? 'scale-110' : 'scale-100'}
              ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
          />

          {/* Overlay actions */}
          <div className={`absolute inset-0 bg-obsidian-950/20 flex items-center justify-center gap-3
                          transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleAddToCart}
              className={`w-10 h-10 flex items-center justify-center transition-colors
                         ${added ? 'bg-green-500 text-white' : 'bg-white text-obsidian-900 hover:bg-gold-500 hover:text-obsidian-950'}`}
              aria-label="Añadir al carrito"
            >
              {added ? '✓' : <ShoppingBag size={16} />}
            </motion.button>
            <Link
              to={`/producto/${product.slug}`}
              className="w-10 h-10 flex items-center justify-center bg-white text-obsidian-900 hover:bg-gold-500 hover:text-obsidian-950 transition-colors"
              aria-label="Ver producto"
            >
              <Eye size={16} />
            </Link>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.is_new && <span className="badge-new text-[10px]">Nuevo</span>}
            {discountPct && <span className="badge-sale text-[10px]">-{discountPct}%</span>}
            {product.is_bestseller && <span className="badge-gold text-[10px]">★ Top</span>}
            {product.stock === 0 && <span className="badge-sold-out text-[10px]">Agotado</span>}
          </div>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            className={`absolute top-3 right-3 w-8 h-8 flex items-center justify-center
                       bg-white/90 backdrop-blur-sm transition-all duration-200
                       ${isWishlisted ? 'text-red-500' : 'text-obsidian-400 hover:text-red-400'}`}
            aria-label="Añadir a favoritos"
          >
            <Heart size={14} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-[10px] text-gold-600 dark:text-gold-400 tracking-widest uppercase font-sans mb-1">
            {product.material}
          </p>
          <h3 className="font-display text-sm font-medium text-obsidian-900 dark:text-cream-100 leading-snug mb-2 line-clamp-2 group-hover:text-gold-600 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={11}
                  className={star <= Math.round(parseFloat(product.rating)) ? 'text-gold-500 fill-gold-500' : 'text-cream-300 fill-cream-300'}
                />
              ))}
            </div>
            <span className="text-[10px] text-obsidian-400">({product.reviews_count})</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="price-current">{formatPrice(product.price)}</span>
            {product.compare_price && (
              <span className="price-compare">{formatPrice(product.compare_price)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
