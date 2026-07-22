'use client'

import { create } from 'zustand'
import type { AuthUser } from '@/services/auth.service'

export type AuthStatus = 'idle' | 'checking' | 'authenticated' | 'unauthenticated'

interface AuthStore {
  user: AuthUser | null
  status: AuthStatus
  setChecking: () => void
  setUser: (user: AuthUser) => void
  clearUser: () => void
}

export const useAuthStore = create<AuthStore>()(set => ({
  user: null,
  status: 'idle',
  setChecking: () => set({ status: 'checking' }),
  setUser: user => set({ user, status: 'authenticated' }),
  clearUser: () => set({ user: null, status: 'unauthenticated' }),
}))
