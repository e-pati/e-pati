import { api } from '@/lib/api'
import { clearSessionMarker, setSessionMarker } from '@/lib/auth-session'

export interface AuthUser {
  id: string
  email: string
  fullName: string
  role: string
  clinicId?: string
}

export interface AuthResponse {
  user: AuthUser
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password })
    setSessionMarker()
    return data
  },

  async loginClinic(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/clinic/login', { email, password })
    setSessionMarker()
    return data
  },

  async register(payload: {
    fullName: string
    email: string
    phone?: string
    password: string
  }): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', payload)
    return data
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } catch {
      // Yerel oturum, backend erişilemese de kapatılmalıdır.
    } finally {
      clearSessionMarker()
    }
  },

  async me(): Promise<AuthUser> {
    const { data } = await api.get<AuthUser>('/auth/me')
    return data
  },
}
