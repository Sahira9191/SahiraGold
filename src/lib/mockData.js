// Mock data for the jewelry store
export const CATEGORIES = [
  { id: 'c1', name: 'Anillos', slug: 'anillos', count: 142 },
  { id: 'c2', name: 'Collares', slug: 'collares', count: 98 },
  { id: 'c3', name: 'Aretes', slug: 'aretes', count: 115 },
  { id: 'c4', name: 'Pulseras', slug: 'pulseras', count: 76 },
  { id: 'c5', name: 'Cadenas', slug: 'cadenas', count: 54 },
  { id: 'c6', name: 'Conjuntos', slug: 'conjuntos', count: 38 },
]

export const MATERIALS = ['Oro 24K', 'Oro 18K', 'Oro 14K', 'Oro Blanco', 'Oro Rosa', 'Platino']

const PRODUCT_IMAGES = [
  'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80',
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80',
  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80',
  'https://images.unsplash.com/photo-1573408301185-9519f94815b5?w=600&q=80',
  'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&q=80',
  'https://images.unsplash.com/photo-1630020085330-9bcb6f1e4e3f?w=600&q=80',
  'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=600&q=80',
  'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80',
  'https://images.unsplash.com/photo-1624913503273-5f9c4e980dba?w=600&q=80',
  'https://images.unsplash.com/photo-1575863438850-fb1c06a38585?w=600&q=80',
]

const PRODUCT_NAMES = [
  'Anillo Eternidad Diamante', 'Collar Gargantilla Vintage', 'Aretes Aro Grande Pavé',
  'Pulsera Esclava Elegante', 'Anillo Solitario Clásico', 'Collar Perla Tahití',
  'Aretes Lágrima Rubí', 'Pulsera Tennis Diamantes', 'Anillo Trilogía Esmeraldas',
  'Collar Corazón Engastado', 'Aretes Candado Art Déco', 'Cadena Veneciana 60cm',
  'Anillo Signet Grabado', 'Collar Serpiente Italiana', 'Aretes Perla Barroca',
  'Pulsera Charm Oro', 'Anillo Flor de Diamante', 'Collar Choker Multi-hilo',
  'Aretes Huggies Pavé', 'Pulsera Infinity Diamond',
]

const generateProduct = (index) => {
  const price = Math.floor(Math.random() * 15000) + 800
  const hasDiscount = Math.random() > 0.6
  const categoryIndex = index % CATEGORIES.length
  const imageIndex = index % PRODUCT_IMAGES.length

  return {
    id: `prod-${index + 1}`,
    name: PRODUCT_NAMES[index % PRODUCT_NAMES.length],
    slug: `producto-${index + 1}`,
    price,
    compare_price: hasDiscount ? Math.floor(price * 1.25) : null,
    category: CATEGORIES[categoryIndex],
    material: MATERIALS[index % MATERIALS.length],
    weight: (Math.random() * 8 + 1).toFixed(1),
    stock: Math.floor(Math.random() * 20),
    images: [
      PRODUCT_IMAGES[imageIndex],
      PRODUCT_IMAGES[(imageIndex + 1) % PRODUCT_IMAGES.length],
      PRODUCT_IMAGES[(imageIndex + 2) % PRODUCT_IMAGES.length],
    ],
    is_active: true,
    is_new: index < 6,
    is_bestseller: [1, 3, 5, 8, 12].includes(index),
    rating: (Math.random() * 1.5 + 3.5).toFixed(1),
    reviews_count: Math.floor(Math.random() * 80) + 5,
    description: `Exquisita pieza de joyería artesanal elaborada en ${MATERIALS[index % MATERIALS.length]}. Cada detalle ha sido cuidadosamente diseñado para realzar tu elegancia natural. Certificada y garantizada por SahiraGoldCollection.`,
    variants: [
      { id: `v${index}-1`, name: 'Talla', value: '16', stock: 5, price_modifier: 0 },
      { id: `v${index}-2`, name: 'Talla', value: '17', stock: 3, price_modifier: 0 },
      { id: `v${index}-3`, name: 'Talla', value: '18', stock: 2, price_modifier: 150 },
    ],
    created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
  }
}

export const MOCK_PRODUCTS = Array.from({ length: 48 }, (_, i) => generateProduct(i))

export const FEATURED_COLLECTIONS = [
  {
    id: 'col-1',
    name: 'Colección Eternidad',
    subtitle: 'Diamantes que perduran para siempre',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=90',
    slug: 'eternidad',
    count: 24,
  },
  {
    id: 'col-2',
    name: 'Colección Imperial',
    subtitle: 'El lujo en su máxima expresión',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=90',
    slug: 'imperial',
    count: 18,
  },
  {
    id: 'col-3',
    name: 'Colección Romance',
    subtitle: 'Para los momentos que importan',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900&q=90',
    slug: 'romance',
    count: 32,
  },
  {
    id: 'col-4',
    name: 'Colección Vintage',
    subtitle: 'Arte joyero de otra época',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&q=90',
    slug: 'vintage',
    count: 15,
  },
]

export const TESTIMONIALS = [
  {
    id: 1,
    name: 'María Elena Rodríguez',
    location: 'Ciudad de México',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    rating: 5,
    text: 'El anillo de compromiso que compré es absolutamente espectacular. La calidad supera con creces el precio. Mi prometida llora cada vez que lo ve. ¡Gracias Sahira!',
    product: 'Anillo Solitario Clásico',
  },
  {
    id: 2,
    name: 'Carmen Villanueva',
    location: 'Guadalajara',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    rating: 5,
    text: 'Llevo comprando en Sahira Gold por 3 años y cada pieza es una obra de arte. El collar de perlas tahití que recibí fue exactamente como en las fotos, pero 10 veces más hermoso en persona.',
    product: 'Collar Perla Tahití',
  },
  {
    id: 3,
    name: 'Sofía Monterroso',
    location: 'Monterrey',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80',
    rating: 5,
    text: 'El servicio al cliente es excepcional y el empaque de lujo hace que cada compra se sienta como un regalo especial. Definitivamente mi joyería favorita.',
    product: 'Aretes Aro Grande Pavé',
  },
  {
    id: 4,
    name: 'Isabella Fuentes',
    location: 'Cancún',
    avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100&q=80',
    rating: 5,
    text: 'Me regalé la pulsera tennis para mi cumpleaños y fue la mejor decisión de mi vida. Es el tipo de joya que se convierte en herencia familiar.',
    product: 'Pulsera Tennis Diamantes',
  },
]

export const MOCK_REVIEWS = [
  {
    id: 'r1',
    user: { full_name: 'Ana P.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&q=80' },
    rating: 5,
    comment: 'Joya impecable, llegó en perfecto estado y el empaque es de lujo. ¡100% recomendada!',
    created_at: '2025-11-12',
  },
  {
    id: 'r2',
    user: { full_name: 'Gabriela M.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&q=80' },
    rating: 5,
    comment: 'Compré este anillo para mi aniversario y mi esposa quedó encantada. Calidad excepcional.',
    created_at: '2025-10-28',
  },
  {
    id: 'r3',
    user: { full_name: 'Daniela R.', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&q=80' },
    rating: 4,
    comment: 'Muy bella pieza. La talla fue correcta y el brillo del oro es espectacular.',
    created_at: '2025-10-05',
  },
]
