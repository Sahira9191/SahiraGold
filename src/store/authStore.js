import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import supabase from '../lib/supabase'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      loading: true,
      wishlist: [],

      setSession: (session) => {
        set({
          user: session?.user || null,
          session,
          loading: false,
        })
      },

      setLoading: (loading) => set({ loading }),

      logout: async () => {
        await supabase.auth.signOut()
        set({ user: null, session: null, wishlist: [] })
      },

      isAdmin: () => {
        const { user } = get()
        return user?.user_metadata?.role === 'admin' || user?.email?.includes('admin')
      },

      toggleWishlist: (productId) => {
        const { wishlist } = get()
        const exists = wishlist.includes(productId)
        set({
          wishlist: exists
            ? wishlist.filter((id) => id !== productId)
            : [...wishlist, productId],
        })
      },

      isWishlisted: (productId) => {
        return get().wishlist.includes(productId)
      },
    }),
    {
      name: 'sahira-auth',
      partialize: (state) => ({ wishlist: state.wishlist }),
    }
  )
)

export default useAuthStore
