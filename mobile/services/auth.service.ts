import { api } from '@/lib/api'
import { secureStorage } from '@/lib/secure-storage'

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

export interface RegisterResponse {
  email: string
  otpExpiresIn: number
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password })
    await secureStorage.setItem('accessToken', data.accessToken)
    await secureStorage.setItem('refreshToken', data.refreshToken)
    await secureStorage.setItem('auth-user', JSON.stringify(data.user))
    return data
  },

  async register(payload: {
    fullName: string
    email: string
    password: string
  }): Promise<RegisterResponse> {
    const { data } = await api.post<RegisterResponse>('/auth/register', payload)
    return data
  },

  async sendOtp(email: string): Promise<{ email: string; otpExpiresIn: number }> {
    const { data } = await api.post('/auth/send-otp', { email })
    return data
  },

  async verifyOtp(email: string, code: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/verify-otp', { email, code })
    await secureStorage.setItem('accessToken', data.accessToken)
    await secureStorage.setItem('refreshToken', data.refreshToken)
    await secureStorage.setItem('auth-user', JSON.stringify(data.user))
    return data
  },

  async logout(): Promise<void> {
    try { await api.post('/auth/logout') } catch { }
    await secureStorage.deleteItem('accessToken')
    await secureStorage.deleteItem('refreshToken')
    await secureStorage.deleteItem('auth-user')
  },

  async isLoggedIn(): Promise<boolean> {
    const token = await secureStorage.getItem('accessToken')
    return !!token
  },
}
