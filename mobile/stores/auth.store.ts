import { create } from 'zustand'
import { secureStorage } from '@/lib/secure-storage'

export interface AuthUser {
  id: string
  email: string
  fullName: string
  role: string
}

interface AuthStore {
  user: AuthUser | null
  setUser: (user: AuthUser) => void
  clearUser: () => void
  loadUser: () => Promise<void>
}

export const useAuthStore = create<AuthStore>(set => ({
  user: null,

  setUser: (user) => {
    set({ user })
    secureStorage.setItem('auth-user', JSON.stringify(user)).catch(() => {})
  },

  clearUser: () => {
    set({ user: null })
    secureStorage.deleteItem('auth-user').catch(() => {})
  },

  loadUser: async () => {
    try {
      const raw = await secureStorage.getItem('auth-user')
      if (raw) set({ user: JSON.parse(raw) })
    } catch {}
  },
}))
