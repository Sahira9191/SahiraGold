import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const DEFAULT = {
  nombre:  'Sahira Gold Collection',
  email:   'hola@sahiragoldcollection.com',
  telefono: '+52 55 1234 5678',
  direccion: '',
  moneda:  'MXN',   // 'MXN' | 'USD'
  zona:    'America/New_York',
}

const useSettingsStore = create(
  persist(
    (set, get) => ({
      ...DEFAULT,
      setSettings: (partial) => set(partial),
      formatPrice: (amount) => {
        const { moneda } = get()
        return new Intl.NumberFormat(
          moneda === 'USD' ? 'en-US' : 'es-MX',
          { style: 'currency', currency: moneda, maximumFractionDigits: 0 }
        ).format(amount)
      },
    }),
    { name: 'sg_settings_tienda' }   // mismo key que el localStorage existente
  )
)

export default useSettingsStore
