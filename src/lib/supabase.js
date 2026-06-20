// Mock Supabase client — replace with real credentials in .env
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://mock.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-key'

// Mock auth object
const mockAuth = {
  _listeners: [],
  _session: null,

  onAuthStateChange(callback) {
    this._listeners.push(callback)
    callback('INITIAL_SESSION', this._session)
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this._listeners = this._listeners.filter(l => l !== callback)
          }
        }
      }
    }
  },

  async getSession() {
    return { data: { session: this._session }, error: null }
  },

  async signInWithPassword({ email, password }) {
    if (email && password) {
      const user = { id: 'mock-user-id', email, user_metadata: { full_name: 'Usuario Demo' } }
      this._session = { user, access_token: 'mock-token' }
      this._listeners.forEach(l => l('SIGNED_IN', this._session))
      return { data: { user, session: this._session }, error: null }
    }
    return { data: null, error: { message: 'Credenciales inválidas' } }
  },

  async signUp({ email, password, options }) {
    const user = {
      id: 'mock-user-' + Date.now(),
      email,
      user_metadata: options?.data || {}
    }
    this._session = { user, access_token: 'mock-token' }
    this._listeners.forEach(l => l('SIGNED_IN', this._session))
    return { data: { user, session: this._session }, error: null }
  },

  async signInWithOAuth({ provider }) {
    console.log(`OAuth with ${provider} — configure Supabase for real OAuth`)
    return { error: { message: 'Configura Supabase para OAuth real' } }
  },

  async signOut() {
    this._session = null
    this._listeners.forEach(l => l('SIGNED_OUT', null))
    return { error: null }
  },

  async resetPasswordForEmail(email) {
    console.log('Password reset for:', email)
    return { error: null }
  },
}

// Mock database
const _mockData = {
  profiles: {},
  wishlist: {},
  orders: {},
  reviews: {},
}

const mockDb = {
  from(table) {
    return {
      select(cols = '*') {
        return this
      },
      eq(col, val) {
        return this
      },
      insert(data) {
        return { data, error: null }
      },
      upsert(data) {
        return { data, error: null }
      },
      update(data) {
        return this
      },
      delete() {
        return this
      },
      order() { return this },
      limit() { return this },
      single() {
        return { data: null, error: null }
      },
      async then(resolve) {
        resolve({ data: [], error: null })
      }
    }
  }
}

export const supabase = {
  auth: mockAuth,
  ...mockDb,
}

export default supabase
