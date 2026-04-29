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
    localStorage.setItem('accessToken', data.accessToken)
    document.cookie = 'epati-logged-in=1; path=/; max-age=604800'
    return data
  },

  async register(payload: {
    fullName: string
    email: string
    phone?: string
    password: string
  }): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', payload)
    localStorage.setItem('accessToken', data.accessToken)
    document.cookie = 'epati-logged-in=1; path=/; max-age=604800'
    return data
  },

  async logout(): Promise<void> {
    try { await api.post('/auth/logout') } catch { }
    localStorage.removeItem('accessToken')
    document.cookie = 'epati-logged-in=; path=/; max-age=0'
  },

  async me(): Promise<AuthUser> {
    const { data } = await api.get<AuthUser>('/auth/me')
    return data
  },
}
