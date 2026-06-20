import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import { ArrowRight, Play, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from '../components/product/ProductCard'
import { MOCK_PRODUCTS, FEATURED_COLLECTIONS, TESTIMONIALS } from '../lib/mockData'

/* ─── Newsletter Popup ───────────────────────────── */
function NewsletterPopup() {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(() => !!localStorage.getItem('newsletter-dismissed'))
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (dismissed) return
    const t = setTimeout(() => setVisible(true), 8000)
    return () => clearTimeout(t)
  }, [dismissed])

  const dismiss = () => {
    setVisible(false)
    localStorage.setItem('newsletter-dismissed', '1')
    setDismissed(true)
  }

  const submit = (e) => {
    e.preventDefault()
    setDone(true)
    setTimeout(dismiss, 3000)
  }

  if (!visible) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={dismiss}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        className="relative w-full max-w-lg bg-obsidian-950 text-cream-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gold accent top */}
        <div className="h-1 bg-gold-gradient" />

        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-obsidian-500 hover:text-cream-100 transition-colors"
        >
          ✕
        </button>

        <div className="p-10">
          <div className="text-gold-400 text-xs tracking-[0.4em] uppercase mb-3">Bienvenida/o</div>
          <h2 className="font-display text-3xl font-semibold mb-3">
            10% de descuento<br />en tu primera compra
          </h2>
          <div className="w-12 h-px bg-gold-gradient mb-5" />
          <p className="text-sm text-obsidian-400 mb-8">
            Suscríbete a nuestra lista exclusiva y recibe el código de bienvenida, además de acceso anticipado a nuevas colecciones.
          </p>

          {done ? (
            <div className="text-center py-4">
              <div className="text-gold-400 text-2xl mb-2">✦</div>
              <p className="font-display text-lg">¡Gracias! Tu código es <strong className="text-gold-400">BIENVENIDA</strong></p>
            </div>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Tu correo electrónico"
                className="px-4 py-3 bg-obsidian-900 border border-obsidian-700 text-cream-100
                           placeholder-obsidian-500 text-sm focus:outline-none focus:border-gold-500"
              />
              <button type="submit" className="btn-gold justify-center">
                Obtener mi descuento <ArrowRight size={16} />
              </button>
            </form>
          )}

          <p className="text-[10px] text-obsidian-600 mt-4 text-center">
            Sin spam. Cancela cuando quieras.
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ─── Hero Slides data ───────────────────────────── */
const HERO_SLIDES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1920&q=90',
    stone: 'Diamante',
    tag: '✦ Pureza Eterna ✦',
    title: ['Brillos que', 'Conquistan', 'el Tiempo'],
    subtitle: 'Diamantes certificados GIA engastados en oro 18K artesanal.',
    overlay: 'from-obsidian-950/70 via-obsidian-950/30 to-obsidian-950/85',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1920&q=90',
    stone: 'Rubí',
    tag: '✦ Pasión & Elegancia ✦',
    title: ['El Fuego del', 'Rubí', 'en tus Manos'],
    subtitle: 'Rubíes birmanos de primera calidad, color sangre de paloma.',
    overlay: 'from-red-950/65 via-obsidian-950/35 to-obsidian-950/85',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1920&q=90',
    stone: 'Esmeralda',
    tag: '✦ Naturaleza Pura ✦',
    title: ['El Verde', 'Profundo de la', 'Esmeralda'],
    subtitle: 'Esmeraldas colombianas de talla rectangular, engaste en garra.',
    overlay: 'from-emerald-950/65 via-obsidian-950/30 to-obsidian-950/85',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&q=90',
    stone: 'Perla',
    tag: '✦ Gracia Natural ✦',
    title: ['Perlas que', 'Cuentan una', 'Historia'],
    subtitle: 'Perlas Tahití y Akoya seleccionadas a mano para cada pieza.',
    overlay: 'from-obsidian-950/55 via-obsidian-950/20 to-obsidian-950/80',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1920&q=90',
    stone: 'Zafiro',
    tag: '✦ Profundidad Real ✦',
    title: ['Zafiros', 'Azules de la', 'Realeza'],
    subtitle: 'Zafiros de Cachemira y Ceilán, el color del cielo en tus joyas.',
    overlay: 'from-blue-950/65 via-obsidian-950/30 to-obsidian-950/85',
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1573408301185-9519f94815b5?w=1920&q=90',
    stone: 'Oro',
    tag: '✦ Artesanía Ancestral ✦',
    title: ['El Arte del', 'Oro en cada', 'Detalle'],
    subtitle: 'Colecciones de oro 24K y 18K trabajadas a mano por maestros artesanos.',
    overlay: 'from-obsidian-950/65 via-obsidian-950/30 to-obsidian-950/85',
  },
]

/* ─── Hero Section ───────────────────────────────── */
function HeroSection() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setCurrent(c => (c + 1) % HERO_SLIDES.length)
    }, 5500)
    return () => clearInterval(t)
  }, [])

  const slide = HERO_SLIDES[current]

  return (
    <section className="relative h-screen min-h-[620px] flex items-center justify-center overflow-hidden">

      {/* ── Slideshow backgrounds ── */}
      {HERO_SLIDES.map((s, i) => (
        <motion.div
          key={s.id}
          className="absolute inset-0"
          animate={{
            opacity: i === current ? 1 : 0,
            scale: i === current ? 1 : 1.06,
          }}
          transition={{ duration: 1.6, ease: 'easeInOut' }}
          style={{ zIndex: i === current ? 1 : 0 }}
        >
          <img
            src={s.image}
            alt={s.stone}
            className="w-full h-full object-cover"
            loading={i === 0 ? 'eager' : 'lazy'}
          />
          <div className={`absolute inset-0 bg-gradient-to-b ${s.overlay}`} />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian-950/30 via-transparent to-obsidian-950/30" />
        </motion.div>
      ))}

      {/* ── Decorative side line ── */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-4 z-10">
        <div className="w-px h-24 bg-gold-gradient" />
        <span className="writing-vertical text-[10px] tracking-[0.4em] text-gold-400 uppercase">Lujo Atemporal</span>
        <div className="w-px h-24 bg-gold-gradient" />
      </div>

      {/* ── Dot navigation (right side) ── */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3 z-10">
        {HERO_SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setCurrent(i)}
            aria-label={`Ver ${s.stone}`}
            className="group flex items-center justify-end gap-2"
          >
            <span className={`text-[9px] tracking-[0.3em] uppercase transition-all duration-300 ${
              i === current ? 'text-gold-400 opacity-100 mr-1' : 'text-cream-300/0 group-hover:text-cream-300/60 group-hover:opacity-100'
            }`}>
              {s.stone}
            </span>
            <span className={`block rounded-full transition-all duration-500 ${
              i === current ? 'w-2.5 h-2.5 bg-gold-400 shadow-[0_0_8px_rgba(201,168,76,0.8)]' : 'w-1.5 h-1.5 bg-white/40 group-hover:bg-white/70'
            }`} />
          </button>
        ))}
      </div>

      {/* ── Hero content ── */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">

        <AnimatePresence mode="wait">
          <motion.div
            key={`tag-${current}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5 }}
            className="text-gold-400 text-xs tracking-[0.5em] uppercase mb-6"
          >
            {slide.tag}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.h1
            key={`h1-${current}`}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.65, delay: 0.08 }}
            className="font-display text-5xl sm:text-6xl lg:text-8xl font-semibold leading-none mb-6"
          >
            {slide.title[0]}
            <br />
            <span className="text-gold-gradient italic">{slide.title[1]}</span>
            <br />
            {slide.title[2]}
          </motion.h1>
        </AnimatePresence>

        <div className="w-24 h-px bg-gold-gradient mx-auto mb-6" />

        <AnimatePresence mode="wait">
          <motion.p
            key={`sub-${current}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-cream-200/80 text-lg sm:text-xl font-light tracking-wide mb-12 max-w-lg mx-auto"
          >
            {slide.subtitle}
          </motion.p>
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/catalogo" className="btn-gold px-10 py-4 text-sm">
            Explorar Colección <ArrowRight size={16} />
          </Link>
          <Link to="/#historia" className="btn-ghost text-white hover:text-gold-300 flex items-center gap-2">
            <Play size={16} className="fill-current" /> Nuestra Historia
          </Link>
        </motion.div>
      </div>

      {/* ── Progress bar ── */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex">
        {HERO_SLIDES.map((s, i) => (
          <div key={s.id} className="flex-1 h-0.5 bg-white/10 overflow-hidden">
            {i === current && (
              <motion.div
                className="h-full bg-gold-400"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 5.5, ease: 'linear' }}
              />
            )}
          </div>
        ))}
      </div>

      {/* ── Scroll indicator ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
        <span className="text-[10px] text-cream-300/60 tracking-widest uppercase">Descubrir</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-px h-8 bg-gradient-to-b from-gold-400 to-transparent"
        />
      </div>
    </section>
  )
}

/* ─── Collections Grid ────────────────────────────── */
function CollectionsSection() {
  return (
    <section className="py-24 bg-cream-50 dark:bg-obsidian-950">
      <div className="container-luxury">
        <div className="text-center mb-16">
          <div className="text-gold-500 text-xs tracking-[0.5em] uppercase mb-4">Descubre</div>
          <h2 className="section-title mb-4">Nuestras Colecciones</h2>
          <div className="divider-gold" />
          <p className="section-subtitle mt-4 max-w-md mx-auto">
            Cada colección cuenta una historia única de elegancia y artesanía excepcional
          </p>
        </div>

        {/* Asymmetric grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {FEATURED_COLLECTIONS.map((col, i) => (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`group relative overflow-hidden cursor-pointer
                ${i === 0 ? 'col-span-2 lg:col-span-1 lg:row-span-2 aspect-[4/3] lg:aspect-auto lg:min-h-[500px]' : 'aspect-[3/4]'}`}
            >
              <img
                src={col.image}
                alt={col.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="overlay-dark" />

              {/* Hover reveal */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">
                <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
                  <div className="text-gold-400 text-[10px] tracking-widest uppercase mb-2">{col.count} piezas</div>
                  <h3 className="font-display text-xl lg:text-2xl text-white font-semibold mb-2">{col.name}</h3>
                  <p className="text-cream-200/70 text-sm mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                    {col.subtitle}
                  </p>
                  <Link
                    to={`/catalogo?col=${col.slug}`}
                    className="inline-flex items-center gap-2 text-gold-400 text-sm font-medium tracking-wide
                               opacity-0 group-hover:opacity-100 transition-all duration-300 delay-150 hover:gap-3"
                  >
                    Ver colección <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── New Arrivals Carousel ───────────────────────── */
function NewArrivalsSection() {
  const newProducts = MOCK_PRODUCTS.slice(0, 12)

  return (
    <section className="py-24 bg-white dark:bg-obsidian-900">
      <div className="container-luxury">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="text-gold-500 text-xs tracking-[0.5em] uppercase mb-4">Recién Llegado</div>
            <h2 className="section-title">Nuevas Llegadas</h2>
            <div className="w-12 h-px bg-gold-gradient mt-4" />
          </div>
          <Link to="/catalogo?sort=newest" className="btn-outline-gold text-xs hidden sm:flex items-center gap-2">
            Ver Todo <ArrowRight size={14} />
          </Link>
        </div>

        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          spaceBetween={20}
          slidesPerView={1.2}
          breakpoints={{
            480:  { slidesPerView: 2 },
            768:  { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
          }}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          className="pb-10"
        >
          {newProducts.map((product, i) => (
            <SwiperSlide key={product.id}>
              <ProductCard product={product} index={i} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}

/* ─── Our Story Parallax ──────────────────────────── */
function OurStorySection() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-10%', '10%'])

  return (
    <section id="historia" ref={ref} className="relative py-0 overflow-hidden min-h-[600px] flex items-center">
      {/* Background parallax */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.img
          style={{ y }}
          src="https://images.unsplash.com/photo-1573408301185-9519f94815b5?w=1600&q=90"
          alt="Taller de joyería Sahira"
          className="w-full h-[120%] object-cover -mt-[10%]"
        />
        <div className="absolute inset-0 bg-obsidian-950/75" />
      </div>

      <div className="relative z-10 container-luxury py-32">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-gold-400 text-xs tracking-[0.5em] uppercase mb-6">Nuestra Historia</div>
            <h2 className="font-display text-4xl lg:text-5xl text-white font-semibold mb-6 leading-tight">
              Cuatro décadas<br />
              <span className="text-gold-gradient italic">de artesanía</span><br />
              y pasión
            </h2>
            <div className="w-16 h-px bg-gold-gradient mb-8" />
            <p className="text-cream-200/80 text-lg leading-relaxed mb-6">
              Desde 1985, la familia Sahira ha dedicado cada día a crear piezas únicas que trascienden el tiempo.
              Nuestros artesanos combinan técnicas ancestrales con diseño contemporáneo para crear joyas que
              se convierten en herencias familiares.
            </p>
            <p className="text-cream-200/60 leading-relaxed mb-10">
              Cada pieza lleva el sello de autenticidad Sahira, garantizando los más altos estándares de
              calidad en materiales y acabados.
            </p>
            <Link to="/colecciones" className="btn-gold">
              Conocer las Colecciones <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-20 max-w-lg">
          {[
            { num: '40+', label: 'Años de experiencia' },
            { num: '50K+', label: 'Piezas creadas' },
            { num: '100%', label: 'Oro certificado' },
          ].map(({ num, label }) => (
            <div key={label} className="text-center">
              <div className="font-display text-3xl lg:text-4xl font-semibold text-gold-gradient mb-1">{num}</div>
              <div className="text-xs text-obsidian-400 tracking-wide">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Bestsellers Grid ────────────────────────────── */
function BestsellersSection() {
  const bestsellers = MOCK_PRODUCTS.filter((p) => p.is_bestseller).slice(0, 4)

  return (
    <section className="py-24 bg-cream-100 dark:bg-obsidian-900/50">
      <div className="container-luxury">
        <div className="text-center mb-16">
          <div className="text-gold-500 text-xs tracking-[0.5em] uppercase mb-4">Los más amados</div>
          <h2 className="section-title mb-4">Bestsellers</h2>
          <div className="divider-gold" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestsellers.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </div>
    </section>
  )
}

/* ─── Testimonials ────────────────────────────────── */
function TestimonialsSection() {
  return (
    <section className="py-24 bg-obsidian-950">
      <div className="container-luxury">
        <div className="text-center mb-16">
          <div className="text-gold-400 text-xs tracking-[0.5em] uppercase mb-4">Testimonios</div>
          <h2 className="font-display text-3xl lg:text-4xl text-cream-100 font-semibold mb-4">
            Lo que dicen nuestras clientas
          </h2>
          <div className="divider-gold" />
        </div>

        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={32}
          slidesPerView={1}
          breakpoints={{
            768:  { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          className="pb-12"
        >
          {TESTIMONIALS.map((t) => (
            <SwiperSlide key={t.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-obsidian-900 border border-obsidian-800 p-8 h-full"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} className="fill-gold-500 text-gold-500" />
                  ))}
                </div>

                {/* Quote */}
                <div className="text-gold-400 text-3xl font-display leading-none mb-4">"</div>
                <p className="text-cream-200/80 text-sm leading-relaxed mb-6">{t.text}</p>
                <p className="text-gold-500 text-xs italic mb-6">{t.product}</p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-obsidian-800">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="text-cream-200 text-sm font-medium">{t.name}</div>
                    <div className="text-obsidian-500 text-xs">{t.location}</div>
                  </div>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}

/* ─── Banner CTA ──────────────────────────────────── */
function BannerCTA() {
  return (
    <section className="py-20 bg-cream-50 dark:bg-obsidian-900">
      <div className="container-luxury">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center border border-gold-200 dark:border-gold-800 p-12 lg:p-20 relative overflow-hidden"
        >
          {/* Decorative corners */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-gold-400" />
          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-gold-400" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-gold-400" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-gold-400" />

          <div className="text-gold-500 text-xs tracking-[0.5em] uppercase mb-4">Experiencia Exclusiva</div>
          <h2 className="section-title mb-4">¿Buscas algo especial?</h2>
          <div className="divider-gold" />
          <p className="section-subtitle mt-4 mb-10 max-w-md mx-auto">
            Nuestros expertos te ayudarán a encontrar o crear la joya perfecta para ese momento único.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/catalogo" className="btn-gold px-10">
              Ver Catálogo Completo <ArrowRight size={16} />
            </Link>
            <a href="tel:+525512345678" className="btn-outline-gold px-10">
              Llamar a un asesor
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Home Page ───────────────────────────────────── */
export default function Home() {
  return (
    <>
      <HeroSection />
      <CollectionsSection />
      <NewArrivalsSection />
      <OurStorySection />
      <BestsellersSection />
      <TestimonialsSection />
      <BannerCTA />
      <NewsletterPopup />
    </>
  )
}
