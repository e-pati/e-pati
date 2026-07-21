import { api } from '@/lib/api'

export interface AuthUser {
  id: string
  email: string
  fullName: string
  role: string
  clinicId?: string
}

export interface AuthResponse {
  accessToken?: string
  refreshToken?: string
  user: AuthUser
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password })
    document.cookie = 'epati-logged-in=1; path=/; max-age=604800'
    return data
  },

  async loginClinic(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/clinic/login', { email, password })
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
    document.cookie = 'epati-logged-in=1; path=/; max-age=604800'
    return data
  },

  async logout(): Promise<void> {
    try { await api.post('/auth/logout') } catch { }
    document.cookie = 'epati-logged-in=; path=/; max-age=0'
  },

  async me(): Promise<AuthUser> {
    const { data } = await api.get<AuthUser>('/auth/me')
    return data
  },
}
