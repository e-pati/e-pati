import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'

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
    SecureStore.setItemAsync('auth-user', JSON.stringify(user)).catch(() => {})
  },

  clearUser: () => {
    set({ user: null })
    SecureStore.deleteItemAsync('auth-user').catch(() => {})
  },

  loadUser: async () => {
    try {
      const raw = await SecureStore.getItemAsync('auth-user')
      if (raw) set({ user: JSON.parse(raw) })
    } catch {}
  },
}))
