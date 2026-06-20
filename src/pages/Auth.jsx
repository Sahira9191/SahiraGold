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
                onClick={() => supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: { redirectTo: `${window.location.origin}/cuenta` }
                })}
                className="w-full border border-cream-200 dark:border-obsidian-700 py-3.5 flex items-center justify-center gap-3 text-sm text-obsidian-700 dark:text-cream-200 hover:border-gold-400 transition-colors group"
              >
                {/* Google SVG icon */}
                <svg width="18" height="18" viewBox="0 0 48 48" className="flex-shrink-0">
                  <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19.1 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                  <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.2 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8H6.4C9.7 35.7 16.3 44 24 44z"/>
                  <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6.2 5.2C41.1 35.5 44 30.1 44 24c0-1.3-.1-2.6-.4-3.9z"/>
                </svg>
                Continuar con Google
              </button>

              {/* Apple OAuth */}
              <button
                type="button"
                onClick={() => supabase.auth.signInWithOAuth({
                  provider: 'apple',
                  options: { redirectTo: `${window.location.origin}/cuenta` }
                })}
                className="w-full bg-obsidian-950 dark:bg-white border border-obsidian-950 dark:border-white py-3.5 flex items-center justify-center gap-3 text-sm text-white dark:text-obsidian-950 hover:bg-obsidian-800 dark:hover:bg-cream-100 transition-colors"
              >
                {/* Apple SVG icon */}
                <svg width="18" height="18" viewBox="0 0 814 1000" className="flex-shrink-0 fill-current">
                  <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 405.8 8.2 279.5 8.2 198c0-101.7 67.5-200.8 192.7-200.8 56.5 0 105.7 37.6 139.5 37.6 32.5 0 83.4-39.5 151.6-39.5 24.4 0 108.1 1.9 172.9 81.9zm-203.1-125.3c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
                </svg>
                Continuar con Apple
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
