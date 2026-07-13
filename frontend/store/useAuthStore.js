import { create } from 'zustand'
import { authAPI } from '@/lib/api'

const useAuthStore = create((set, get) => ({
  user: null,
  loading: false,
  error: null,
  // Fix: previously there was no way to distinguish "haven't checked
  // session yet" from "confirmed logged out" — both looked like
  // user === null. Pages like AccountPage checked `if (!user) redirect`
  // immediately on mount, which fired on that initial null and bounced
  // valid logged-in users before the real check even finished.
  // `initialized` lets consumers wait for the real answer.
  initialized: false,

  // Fix: init() used to read the JWT straight out of localStorage. Now
  // that the token lives in an httpOnly cookie, JS can't read it at all
  // — so the only way to know if a session is valid is to ask the
  // server. This calls GET /auth/me, which succeeds only if the browser
  // has a valid cookie attached (handled automatically since api.js has
  // withCredentials: true).
  checkAuth: async () => {
    try {
      const res = await authAPI.getMe()
      const user = res.data.user
      localStorage.setItem('user', JSON.stringify(user)) // cache for instant UI on next load only, not a security boundary
      set({ user, initialized: true })
    } catch {
      localStorage.removeItem('user')
      set({ user: null, initialized: true })
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const res = await authAPI.login({ email, password })
      // Fix: response no longer includes `token` — the cookie is set
      // automatically by the Set-Cookie header on this response, the
      // browser handles it, nothing to store manually here.
      const user = res.data.user
      localStorage.setItem('user', JSON.stringify(user))
      set({ user, loading: false, initialized: true })
      return { success: true }
    } catch (err) {
      const error = err.response?.data?.message || 'Login failed'
      set({ error, loading: false })
      return { success: false, error }
    }
  },

  register: async (name, email, password) => {
    set({ loading: true, error: null })
    try {
      const res = await authAPI.register({ name, email, password })
      const user = res.data.user
      localStorage.setItem('user', JSON.stringify(user))
      set({ user, loading: false, initialized: true })
      return { success: true }
    } catch (err) {
      const error = err.response?.data?.message || 'Registration failed'
      set({ error, loading: false })
      return { success: false, error }
    }
  },

  // Update user in state + localStorage (e.g. after role upgrade to shopowner)
  setUser: (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser))
    set({ user: updatedUser })
  },

  logout: async () => {
    // Fix: previously only cleared local state — the httpOnly cookie on
    // the server was never touched, so the session was technically still
    // valid. This now calls the backend to actually expire the cookie.
    try {
      await authAPI.logout()
    } catch {
      // even if the request fails (e.g. offline), still clear local state below
    }
    localStorage.removeItem('user')
    set({ user: null })
  },

  clearError: () => set({ error: null }),
}))

export default useAuthStore