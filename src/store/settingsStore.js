import { create } from 'zustand'

const LS_KEY = 'sg_settings_v2'

function load() {
  try { const v = localStorage.getItem(LS_KEY); return v ? JSON.parse(v) : {} } catch { return {} }
}
function save(data) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)) } catch {}
}

const DEFAULT = {
  nombre:    'Sahira Gold Collection',
  email:     'hola@sahiragoldcollection.com',
  telefono:  '+52 55 1234 5678',
  direccion: '',
  moneda:    'MXN',
  zona:      'America/New_York',
}

const useSettingsStore = create((set, get) => ({
  ...DEFAULT,
  ...load(),                          // aplica lo que hay en localStorage

  setSettings: (partial) => {
    set(partial)
    save({ ...DEFAULT, ...load(), ...partial })  // persiste manualmente
  },

  formatPrice: (amount) => {
    const { moneda } = get()
    return new Intl.NumberFormat(
      moneda === 'USD' ? 'en-US' : 'es-MX',
      { style: 'currency', currency: moneda, maximumFractionDigits: 0 }
    ).format(amount)
  },
}))

export default useSettingsStore

