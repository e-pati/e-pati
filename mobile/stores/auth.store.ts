import { create } from 'zustand'
import { secureStorage } from '@/lib/secure-storage'

export interface AuthUser {
  id: string
  email: string
  fullName: string
  role: string
  phone?: string
  clinicId?: string
}

interface AuthStore {
  user: AuthUser | null
  pendingEmail: string | null
  setUser: (user: AuthUser) => void
  clearUser: () => void
  loadUser: () => Promise<void>
  setPendingEmail: (email: string) => void
  clearPendingEmail: () => void
}

export const useAuthStore = create<AuthStore>(set => ({
  user: null,
  pendingEmail: null,

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

  setPendingEmail: (email) => set({ pendingEmail: email }),
  clearPendingEmail: () => set({ pendingEmail: null }),
}))
