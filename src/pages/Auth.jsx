import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader, ShieldCheck } from 'lucide-react'
import useAuthStore from '../store/authStore'
import supabase from '../lib/supabase'
import { toast } from 'sonner'

const ADMIN_EMAIL    = 'admin@sahira.com'
const ADMIN_PASSWORD = 'admin2024'

export default function AuthPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const navigate    = useNavigate()
  const setSession  = useAuthStore(s => s.setSession)

  // ── Admin local bypass ──────────────────────────────────────────────────────
  const loginAsAdmin = () => {
    const fakeSession = {
      user: {
        id: 'local-admin',
        email: ADMIN_EMAIL,
        user_metadata: { role: 'admin', full_name: 'Admin Sahira' },
      },
    }
    setSession(fakeSession)
    toast.success('¡Bienvenido, Admin!')
    navigate('/admin')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) { toast.error('Ingresa tu correo y contraseña'); return }

    setLoading(true)
    try {
      // Bypass local para admin
      if (email.trim() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        loginAsAdmin()
        return
      }
      // Intento con Supabase
      const { data: auth, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      setSession(auth.session)
      toast.success('¡Bienvenido!')
      navigate('/admin')
    } catch (err) {
      toast.error('Correo o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-obsidian-950 flex items-center justify-center p-4">
      {/* Background subtle pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-950/30 via-obsidian-950 to-obsidian-950 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-slate-800 text-center">
            <Link to="/" className="inline-flex flex-col items-center mb-5">
              <span className="font-display text-3xl font-semibold text-gold-gradient">SAHIRA</span>
              <span className="text-[10px] tracking-[0.4em] text-slate-400 uppercase">Gold Collection</span>
            </Link>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
              <ShieldCheck size={14} className="text-yellow-400" />
              <span className="text-xs font-semibold text-yellow-400">Panel de Administración</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@sahira.com"
                  className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-sm rounded-lg pl-9 pr-4 py-3 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none placeholder-slate-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-sm rounded-lg pl-9 pr-10 py-3 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none placeholder-slate-500 transition-colors"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 text-slate-950 font-bold text-sm rounded-lg transition-colors mt-2"
            >
              {loading
                ? <><Loader size={16} className="animate-spin" /> Verificando...</>
                : <><ArrowRight size={16} /> Acceder al panel</>
              }
            </button>
          </form>

          {/* Quick admin access */}
          <div className="px-8 pb-7">
            <div className="border-t border-slate-800 pt-5">
              <p className="text-center text-xs text-slate-600 mb-3">Acceso rápido</p>
              <button
                onClick={loginAsAdmin}
                className="w-full py-3 px-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10 text-yellow-500 text-sm font-semibold transition-all flex items-center justify-center gap-2"
              >
                🔑 Entrar como Admin (un clic)
              </button>
              <p className="text-center text-[11px] text-slate-600 mt-2">
                admin@sahira.com · admin2024
              </p>
            </div>
          </div>
        </div>

        {/* Back to store */}
        <div className="text-center mt-5">
          <Link to="/" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
            ← Volver a la tienda
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
