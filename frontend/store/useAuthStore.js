import { create } from 'zustand'
import { authAPI } from '@/lib/api'

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  loading: false,
  error: null,

  init: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      if (token && user) {
        set({ token, user: JSON.parse(user) })
      }
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const res = await authAPI.login({ email, password })
      const { token, user } = res.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      set({ token, user, loading: false })
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
      const { token, user } = res.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      set({ token, user, loading: false })
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

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null })
  },

  clearError: () => set({ error: null }),
}))

export default useAuthStore