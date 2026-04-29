import * as SecureStore from 'expo-secure-store'
import { api } from '@/lib/api'

export interface AuthUser {
  id: string
  email: string
  fullName: string
  role: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password })
    await SecureStore.setItemAsync('accessToken', data.accessToken)
    await SecureStore.setItemAsync('refreshToken', data.refreshToken)
    return data
  },

  async register(payload: {
    fullName: string
    email: string
    phone?: string
    password: string
  }): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', payload)
    await SecureStore.setItemAsync('accessToken', data.accessToken)
    await SecureStore.setItemAsync('refreshToken', data.refreshToken)
    return data
  },

  async logout(): Promise<void> {
    try { await api.post('/auth/logout') } catch { }
    await SecureStore.deleteItemAsync('accessToken')
    await SecureStore.deleteItemAsync('refreshToken')
  },

  async isLoggedIn(): Promise<boolean> {
    const token = await SecureStore.getItemAsync('accessToken')
    return !!token
  },
}
