export const AUTH_SESSION_EXPIRED_EVENT = 'vetcep:auth-session-expired'

const SESSION_MARKER = 'epati-logged-in'
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60

export function setSessionMarker(): void {
  if (typeof document === 'undefined') return

  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${SESSION_MARKER}=1; Path=/; Max-Age=${SESSION_MAX_AGE_SECONDS}; SameSite=Lax${secure}`
}

export function clearSessionMarker(): void {
  if (typeof document === 'undefined') return

  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${SESSION_MARKER}=; Path=/; Max-Age=0; SameSite=Lax${secure}`
}

export function announceSessionExpired(): void {
  if (typeof window === 'undefined') return

  clearSessionMarker()
  window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT))
}
