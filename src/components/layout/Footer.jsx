import { Link } from 'react-router-dom'
import { useState } from 'react'
import {
  MapPin, Phone, Mail, ArrowRight, Shield, Truck, RefreshCw, Award
} from 'lucide-react'

const FOOTER_LINKS = {
  'Colecciones': [
    { label: 'Anillos', href: '/catalogo?cat=anillos' },
    { label: 'Collares', href: '/catalogo?cat=collares' },
    { label: 'Aretes', href: '/catalogo?cat=aretes' },
    { label: 'Pulseras', href: '/catalogo?cat=pulseras' },
    { label: 'Conjuntos', href: '/catalogo?cat=conjuntos' },
    { label: 'Nuevos Productos', href: '/catalogo?sort=newest' },
  ],
  'Ayuda': [
    { label: 'Guía de Tallas', href: '/guia-tallas' },
    { label: 'Cómo Cuidar tus Joyas', href: '/cuidado-joyas' },
    { label: 'Seguimiento de Pedido', href: '/cuenta/pedidos' },
    { label: 'Devoluciones', href: '/devoluciones' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Contacto', href: '/contacto' },
  ],
  'Empresa': [
    { label: 'Nuestra Historia', href: '/#historia' },
    { label: 'Certificaciones', href: '/certificaciones' },
    { label: 'Prensa', href: '/prensa' },
    { label: 'Trabaja con Nosotros', href: '/empleo' },
    { label: 'Términos y Condiciones', href: '/terminos' },
    { label: 'Privacidad', href: '/privacidad' },
  ],
}

const SOCIALS = [
  {
    label: 'Instagram',
    href: 'https://instagram.com/sahiragoldcollection',
    svg: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: 'https://facebook.com/sahiragold',
    svg: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com/sahiragold',
    svg: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
      </svg>
    ),
  },
  {
    label: 'Twitter / X',
    href: 'https://twitter.com/sahiragold',
    svg: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
]

const TRUST_BADGES = [
  { icon: Shield, label: 'Pago 100% Seguro' },
  { icon: Truck, label: 'Envío Express' },
  { icon: RefreshCw, label: '30 días para devolver' },
  { icon: Award, label: 'Certificado de Autenticidad' },
]

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
    }
  }

  return (
    <footer className="bg-obsidian-950 text-cream-100">
      {/* Trust badges */}
      <div className="border-y border-obsidian-800 py-6">
        <div className="container-luxury">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_BADGES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="p-2 border border-gold-500/30 text-gold-400">
                  <Icon size={18} />
                </div>
                <span className="text-sm font-sans text-obsidian-300 tracking-wide">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container-luxury py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <Link to="/">
                <img
                  src="/logo-clean.png"
                  alt="Sahira Gold Collection"
                  className="h-16 w-auto object-contain"
                />
              </Link>
            </div>

            <p className="text-sm text-obsidian-400 leading-relaxed mb-8 max-w-xs">
              Joyería de lujo artesanal creada para quienes aprecian la belleza auténtica.
              Cada pieza es única, certificada y diseñada para perdurar generaciones.
            </p>

            {/* Social links */}
            <div className="flex gap-3 mb-8">
              {SOCIALS.map(({ svg, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 border border-obsidian-700 hover:border-gold-500 text-obsidian-400 hover:text-gold-400
                             flex items-center justify-center transition-all duration-300"
                >
                  {svg}
                </a>
              ))}
            </div>

            {/* Contact */}
            <div className="space-y-3 text-sm text-obsidian-400">
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-gold-500 flex-shrink-0" />
                <span>+52 (55) 1234-5678</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-gold-500 flex-shrink-0" />
                <span>hola@sahiragoldcollection.com</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-gold-500 flex-shrink-0 mt-0.5" />
                <span>Av. Presidente Masaryk 360, Polanco, CDMX</span>
              </div>
            </div>
          </div>

          {/* Links columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-gold-400 mb-6">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-obsidian-400 hover:text-cream-100 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-16 pt-12 border-t border-obsidian-800">
          <div className="max-w-lg">
            <h4 className="font-display text-xl text-cream-100 mb-2">Únete a la colección exclusiva</h4>
            <p className="text-sm text-obsidian-400 mb-6">
              Recibe primero las nuevas colecciones, ofertas exclusivas y contenido sobre joyería de lujo.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-gold-400 text-sm">
                <span className="text-lg">✦</span>
                <span>¡Gracias! Recibirás nuestras novedades pronto.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-0">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Tu correo electrónico"
                  className="flex-1 px-4 py-3 bg-obsidian-900 border border-obsidian-700
                             text-cream-100 placeholder-obsidian-500 text-sm
                             focus:outline-none focus:border-gold-500 transition-colors"
                />
                <button type="submit" className="btn-gold px-5 py-3 flex items-center gap-2 text-xs">
                  <span className="hidden sm:inline">Suscribirse</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-obsidian-800">
        <div className="container-luxury py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-obsidian-500 tracking-wide">
              © {new Date().getFullYear()} SahiraGoldCollection.com — Todos los derechos reservados
            </p>

            {/* Payment methods */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-obsidian-600 mr-2">Métodos de pago:</span>
              {['VISA', 'MC', 'AMEX', 'PayPal', 'OXXO'].map((method) => (
                <span
                  key={method}
                  className="text-[9px] font-bold tracking-wider px-2 py-1 border border-obsidian-700 text-obsidian-400"
                >
                  {method}
                </span>
              ))}
            </div>

            {/* SSL badge */}
            <div className="flex items-center gap-1.5 text-xs text-obsidian-500">
              <Shield size={12} className="text-gold-500" />
              <span>SSL Seguro</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
