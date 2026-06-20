import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader } from 'lucide-react'
import useAuthStore from '../store/authStore'
import supabase from '../lib/supabase'
import { toast } from 'sonner'

const loginSchema = z.object({
  email:    z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

const registerSchema = loginSchema.extend({
  fullName:  z.string().min(2, 'Nombre requerido'),
  confirmPassword: z.string().min(6),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

export default function AuthPage() {
  const [mode, setMode] = useState('login') // 'login' | 'register' | 'magic'
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setSession = useAuthStore(s => s.setSession)

  const schema = mode === 'register' ? registerSchema : loginSchema
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
  })

  const changeMode = (m) => { setMode(m); reset() }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      if (mode === 'login') {
        const { data: auth, error } = await supabase.auth.signInWithPassword({
          email: data.email, password: data.password,
        })
        if (error) throw error
        setSession(auth.session)
        toast.success('¡Bienvenida de nuevo!')
        navigate('/cuenta')
      } else if (mode === 'register') {
        const { data: auth, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: { data: { full_name: data.fullName } },
        })
        if (error) throw error
        setSession(auth.session)
        toast.success('¡Cuenta creada exitosamente!')
        navigate('/cuenta')
      } else if (mode === 'magic') {
        const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
          redirectTo: `${window.location.origin}/auth?reset=true`,
        })
        if (error) throw error
        toast.success('Revisa tu email para el enlace mágico')
      }
    } catch (err) {
      toast.error(err.message || 'Ocurrió un error')
    } finally {
      setLoading(false)
    }
  }

  const INPUT = 'input-luxury mt-1 pl-10'
  const LABEL = 'block text-xs font-medium tracking-wide text-obsidian-700 dark:text-cream-300 uppercase'
  const ERROR = 'text-red-500 text-xs mt-1'

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-obsidian-950 flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1000&q=90"
          alt="Joyería Sahira"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-obsidian-950/60" />
        <div className="absolute inset-0 flex flex-col justify-center p-16">
          <div className="text-gold-400 text-xs tracking-[0.5em] uppercase mb-4">Bienvenida/o</div>
          <h2 className="font-display text-5xl text-white font-semibold mb-4 leading-tight">
            Tu colección<br />
            <span className="text-gold-gradient italic">te espera</span>
          </h2>
          <div className="w-12 h-px bg-gold-gradient mb-6" />
          <p className="text-cream-200/70 text-lg leading-relaxed">
            Accede a tu cuenta para gestionar tus pedidos, wishlist y colección de joyas exclusivas.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex flex-col items-center mb-10">
            <span className="font-display text-3xl font-semibold text-gold-gradient">SAHIRA</span>
            <span className="text-[10px] tracking-[0.4em] text-obsidian-400 uppercase">Gold Collection</span>
          </Link>

          {/* Mode tabs */}
          <div className="flex border-b border-cream-200 dark:border-obsidian-800 mb-8">
            {[
              { id: 'login', label: 'Iniciar Sesión' },
              { id: 'register', label: 'Crear Cuenta' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => changeMode(tab.id)}
                className={`flex-1 pb-3 text-sm font-medium tracking-wide transition-colors
                  ${mode === tab.id
                    ? 'text-gold-600 border-b-2 border-gold-500 -mb-px'
                    : 'text-obsidian-400 hover:text-obsidian-700'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >
              {mode === 'register' && (
                <div>
                  <label className={LABEL}>Nombre completo</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-obsidian-400 mt-0.5" />
                    <input {...register('fullName')} className={INPUT} placeholder="María García" />
                  </div>
                  {errors.fullName && <p className={ERROR}>{errors.fullName.message}</p>}
                </div>
              )}

              <div>
                <label className={LABEL}>Correo electrónico</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-obsidian-400 mt-0.5" />
                  <input {...register('email')} type="email" className={INPUT} placeholder="tu@correo.com" />
                </div>
                {errors.email && <p className={ERROR}>{errors.email.message}</p>}
              </div>

              {mode !== 'magic' && (
                <div>
                  <label className={LABEL}>Contraseña</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-obsidian-400 mt-0.5" />
                    <input
                      {...register('password')}
                      type={showPwd ? 'text' : 'password'}
                      className={INPUT + ' pr-10'}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-obsidian-400 hover:text-obsidian-700 mt-0.5"
                    >
                      {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.password && <p className={ERROR}>{errors.password.message}</p>}
                </div>
              )}

              {mode === 'register' && (
                <div>
                  <label className={LABEL}>Confirmar contraseña</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-obsidian-400 mt-0.5" />
                    <input {...register('confirmPassword')} type="password" className={INPUT} placeholder="••••••••" />
                  </div>
                  {errors.confirmPassword && <p className={ERROR}>{errors.confirmPassword.message}</p>}
                </div>
              )}

              {mode === 'login' && (
                <div className="flex justify-end">
                  <button type="button" onClick={() => changeMode('magic')} className="text-xs text-gold-600 hover:text-gold-700">
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-gold w-full justify-center py-4">
                {loading ? (
                  <Loader size={18} className="animate-spin" />
                ) : mode === 'login' ? (
                  <>Iniciar Sesión <ArrowRight size={16} /></>
                ) : mode === 'register' ? (
                  <>Crear mi cuenta <ArrowRight size={16} /></>
                ) : (
                  'Enviar enlace de acceso'
                )}
              </button>

              {/* Divider */}
              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-cream-200 dark:bg-obsidian-700" />
                <span className="text-xs text-obsidian-400">o continúa con</span>
                <div className="flex-1 h-px bg-cream-200 dark:bg-obsidian-700" />
              </div>

              {/* Google OAuth */}
              <button
                type="button"
                onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
                className="w-full border border-cream-200 dark:border-obsidian-700 py-3.5 flex items-center justify-center gap-3 text-sm text-obsidian-700 dark:text-cream-200 hover:border-gold-400 transition-colors"
              >
                <span className="text-lg">G</span> Continuar con Google
              </button>
            </motion.form>
          </AnimatePresence>

          {mode === 'magic' && (
            <button onClick={() => changeMode('login')} className="btn-ghost w-full justify-center mt-4 text-sm">
              Volver al inicio de sesión
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
