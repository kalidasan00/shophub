import axios from 'axios'

// Fix: the token is no longer read from localStorage or sent as a
// manual Authorization header. The backend now sets it as an httpOnly
// cookie on login, so `withCredentials: true` makes the browser attach
// it automatically on every request — JavaScript never touches the
// token directly, closing the XSS-can-steal-the-session-from-localStorage
// hole. `user` (name/role/avatar for UI display only, not the token
// itself) is still cached in localStorage below purely for fast client
// re-renders; it carries no authorization weight since every real
// request is still verified server-side via the cookie.
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user')
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login?session=expired'
        }
      }
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  // New: httpOnly cookies can't be cleared by client-side JS, so logout
  // now has to be a real request that lets the server expire the cookie.
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/update', data),
  updatePassword: (data) => api.put('/auth/password', data),
}

export const shopsAPI = {
  getAll: (params) => api.get('/shops', { params }),
  getOne: (id) => api.get(`/shops/${id}`),
  create: (data) => api.post('/shops', data),
  update: (id, data) => api.put(`/shops/${id}`, data),
  delete: (id) => api.delete(`/shops/${id}`),
  follow: (id) => api.post(`/shops/${id}/follow`),
}

export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getByShop: (shopId) => api.get('/products', { params: { shop: shopId } }),
  getOne: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  addReview: (id, data) => api.post(`/products/${id}/review`, data),
}

export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my'),
  getOne: (id) => api.get(`/orders/${id}`),
  getShopOrders: (shopId) => api.get(`/orders/shop/${shopId}`),
  getShopAnalytics: (shopId) => api.get(`/orders/shop/${shopId}/analytics`),
  updateShopOrderStatus: (orderId, data) => api.put(`/orders/${orderId}/shop-status`, data),
}

export default api