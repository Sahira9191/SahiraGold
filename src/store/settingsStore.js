import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const DEFAULT = {
  nombre:    'Sahira Gold Collection',
  email:     'hola@sahiragoldcollection.com',
  telefono:  '+52 55 1234 5678',
  direccion: '',
  moneda:    'MXN',   // 'MXN' | 'USD'
  zona:      'America/New_York',
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
    {
      name: 'sg_settings_v2',   // nuevo key para evitar conflicto con el formato viejo
      // Solo persiste los datos, NUNCA las funciones
      partialize: (state) => ({
        nombre:    state.nombre,
        email:     state.email,
        telefono:  state.telefono,
        direccion: state.direccion,
        moneda:    state.moneda,
        zona:      state.zona,
      }),
    }
  )
)

export default useSettingsStore

