import axios, { type InternalAxiosRequestConfig } from 'axios'
import { announceSessionExpired } from '@/lib/auth-session'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

const NO_REFRESH_PATHS = [
  '/auth/login',
  '/auth/clinic/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
]

let refreshRequest: Promise<void> | null = null

function shouldSkipRefresh(url?: string): boolean {
  return NO_REFRESH_PATHS.some(path => url?.includes(path))
}

function refreshSession(): Promise<void> {
  if (!refreshRequest) {
    refreshRequest = axios
      .post(`${API_URL}/auth/refresh`, {}, { withCredentials: true })
      .then(() => undefined)
      .finally(() => {
        refreshRequest = null
      })
  }

  return refreshRequest
}

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

api.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config as RetryableRequestConfig | undefined
    const isUnauthorized = error.response?.status === 401

    if (!isUnauthorized || !original || shouldSkipRefresh(original.url)) {
      return Promise.reject(error)
    }

    if (original._retry) {
      announceSessionExpired()
      return Promise.reject(error)
    }

    original._retry = true

    try {
      await refreshSession()
      return api(original)
    } catch (refreshError) {
      announceSessionExpired()
      return Promise.reject(refreshError)
    }
  },
)
