import { create } from 'zustand'
import type { Session } from '@/types/auth.types'

const SESSION_KEY = 'qlTD_session'

function loadSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session: Session = JSON.parse(raw)
    if (new Date(session.expiresAt) < new Date()) {
      sessionStorage.removeItem(SESSION_KEY)
      return null
    }
    return session
  } catch {
    return null
  }
}

interface AuthState {
  session: Session | null
  setSession: (session: Session) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  session: loadSession(),
  setSession: (session) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
    set({ session })
  },
  clearSession: () => {
    sessionStorage.removeItem(SESSION_KEY)
    set({ session: null })
  },
}))

export const useCurrentUserId = () => useAuthStore(s => s.session?.userId ?? '')
