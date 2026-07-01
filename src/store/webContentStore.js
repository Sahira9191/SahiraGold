/**
 * useWebContent — bridge between admin edits and the public website.
 * Admin writes to localStorage; public pages read from this hook.
 */
import { create } from 'zustand'
import { lsGet, lsSet } from '../lib/storage'

// ─── Default data (mirrors WebContent.jsx INITIAL_* and Home.jsx HERO_SLIDES) ──

const DEFAULT_BANNERS = [
  { id: 1, stone: 'Diamante', tag: '✦ Pureza Eterna ✦', title: 'Brillos que / Conquistan / el Tiempo', subtitle: 'Diamantes certificados GIA engastados en oro 18K artesanal.', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1920&q=90', active: true },
  { id: 2, stone: 'Rubí',     tag: '✦ Pasión & Elegancia ✦', title: 'El Fuego del / Rubí / en tus Manos', subtitle: 'Rubíes birmanos de primera calidad, color sangre de paloma.', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1920&q=90', active: true },
  { id: 3, stone: 'Esmeralda',tag: '✦ Naturaleza Pura ✦', title: 'El Verde / Profundo de la / Esmeralda', subtitle: 'Esmeraldas colombianas de talla rectangular, engaste en garra.', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1920&q=90', active: true },
  { id: 4, stone: 'Perla',    tag: '✦ Gracia Natural ✦', title: 'Perlas que / Cuentan una / Historia', subtitle: 'Perlas Tahití y Akoya seleccionadas a mano.', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&q=90', active: true },
  { id: 5, stone: 'Zafiro',   tag: '✦ Profundidad Real ✦', title: 'Zafiros / Azules de la / Realeza', subtitle: 'Zafiros de Cachemira y Ceilán.', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1920&q=90', active: true },
  { id: 6, stone: 'Oro',      tag: '✦ Artesanía Ancestral ✦', title: 'El Arte del / Oro en cada / Detalle', subtitle: 'Colecciones de oro 24K y 18K trabajadas a mano.', image: 'https://images.unsplash.com/photo-1573408301185-9519f94815b5?w=1920&q=90', active: true },
]

const DEFAULT_COLLECTIONS = [
  { id: 'c1', name: 'Anillos',   subtitle: 'Desde solitarios hasta eternidades', slug: 'anillos',   count: 48, image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80' },
  { id: 'c2', name: 'Collares',  subtitle: 'Elegancia alrededor de tu cuello',  slug: 'collares',  count: 35, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80' },
  { id: 'c3', name: 'Aretes',    subtitle: 'Del día a la noche',                slug: 'aretes',    count: 62, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80' },
  { id: 'c4', name: 'Pulseras',  subtitle: 'Brillos en tu muñeca',             slug: 'pulseras',  count: 29, image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80' },
]

const DEFAULT_TESTIMONIALS = [
  { id: 't1', name: 'Valentina Ríos',      location: 'Ciudad de México', product: 'Anillo Diamante Solitario', rating: 5, text: 'La pieza llegó perfectamente empacada y superó mis expectativas. La calidad del oro es impresionante y el diamante brilla de manera extraordinaria.', avatarUrl: 'https://i.pravatar.cc/80?img=47' },
  { id: 't2', name: 'Mariana Gutiérrez',   location: 'Monterrey, NL',     product: 'Collar Esmeralda',          rating: 5, text: 'Compré el collar de esmeralda como regalo de aniversario y mi esposo quedó encantado. La atención fue personalizada y muy profesional.', avatarUrl: 'https://i.pravatar.cc/80?img=32' },
  { id: 't3', name: 'Sofía Mendoza',       location: 'Guadalajara, JAL',  product: 'Aretes de Rubí',            rating: 5, text: 'Los aretes de rubí son simplemente mágicos. Los uso en cada ocasión especial y siempre recibo cumplidos. Definitivamente volvería a comprar.', avatarUrl: 'https://i.pravatar.cc/80?img=25' },
  { id: 't4', name: 'Isabella Torres',     location: 'Puebla, PUE',       product: 'Pulsera Perla Tahití',      rating: 5, text: 'Mi pulsera de perlas llegó en tiempo y forma. La caja de joyería de regalo fue un detalle precioso. Excelente experiencia de compra.', avatarUrl: 'https://i.pravatar.cc/80?img=56' },
]

const DEFAULT_ANNOUNCEMENT = {
  text: '✦ Envío gratis en compras mayores a $2,000 MXN · Garantía de autenticidad certificada ✦',
  color: 'black',
}

// ─── Store ─────────────────────────────────────────────────────────────────────

const useWebContentStore = create((set) => ({
  banners:      lsGet('banners',            DEFAULT_BANNERS),
  collections:  lsGet('collections',        DEFAULT_COLLECTIONS),
  testimonials: lsGet('testimonials',       DEFAULT_TESTIMONIALS),
  announcement: lsGet('announcement_text',  DEFAULT_ANNOUNCEMENT.text) !== DEFAULT_ANNOUNCEMENT.text
    ? { text: lsGet('announcement_text', DEFAULT_ANNOUNCEMENT.text), color: lsGet('announcement_color', DEFAULT_ANNOUNCEMENT.color) }
    : DEFAULT_ANNOUNCEMENT,

  // Called by admin when saving
  setBanners:      (v) => { lsSet('banners', v);            set({ banners: v }) },
  setCollections:  (v) => { lsSet('collections', v);        set({ collections: v }) },
  setTestimonials: (v) => { lsSet('testimonials', v);       set({ testimonials: v }) },
  setAnnouncement: (v) => {
    lsSet('announcement_text',  v.text)
    lsSet('announcement_color', v.color)
    set({ announcement: v })
  },
}))

export default useWebContentStore
