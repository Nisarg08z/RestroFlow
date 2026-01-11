import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/* ================= RESTAURANT ================= */

export const restaurantLogin = (data) =>
  api.post("/restaurant/login", data)

export const getCurrentRestaurant = () =>
  api.get("/restaurant/me")

export const refreshRestaurantToken = () =>
  api.post("/restaurant/refresh-token")

export const restaurantLogout = () =>
  api.post("/restaurant/logout")

/* ================= ADMIN ================= */

export const adminLogin = (data) =>
  api.post("/admin/login", data)

export const getCurrentAdmin = () =>
  api.get("/admin/me")

export const refreshAdminToken = () =>
  api.post("/admin/refresh-token")

export const adminLogout = () =>
  api.post("/admin/logout")

export const getAllRestaurants = () =>
  api.get("/admin/restaurants")

/* ================= RESTAURANT REQUESTS ================= */

export const submitRestaurantRequest = (data) =>
  api.post("/requests/submit", data)

export const getAllRestaurantRequests = (params = {}) =>
  api.get("/requests", { params })

export const getRestaurantRequestById = (id) =>
  api.get(`/requests/${id}`)

export const updateRequestStatus = (id, data) =>
  api.patch(`/requests/${id}/status`, data)

export const deleteRestaurantRequest = (id) =>
  api.delete(`/requests/${id}`)

export const sendRestaurantRequestReply = (id, data) =>
  api.post(`/requests/${id}/reply`, data)

export const verifySignupToken = (token) =>
  api.get(`/requests/verify-token/${token}`)

export const createPaymentOrder = (data) =>
  api.post("/requests/create-payment-order", data)

export const completeSignup = (data) =>
  api.post("/requests/complete-signup", data)

/* ================= SUBSCRIPTIONS ================= */

export const getAllSubscriptions = (params = {}) =>
  api.get("/subscriptions", { params })

export const getSubscriptionById = (restaurantId) =>
  api.get(`/subscriptions/${restaurantId}`)

export const updateSubscription = (restaurantId, data) =>
  api.patch(`/subscriptions/${restaurantId}`, data)

export const renewSubscription = (restaurantId, data) =>
  api.post(`/subscriptions/${restaurantId}/renew`, data)

export const cancelSubscription = (restaurantId) =>
  api.post(`/subscriptions/${restaurantId}/cancel`)

export const getSubscriptionStats = () =>
  api.get("/subscriptions/stats")

/* ================= INVOICES ================= */

export const getInvoiceByToken = (token) =>
  api.get(`/invoices/payment/${token}`)

export const createInvoicePaymentOrder = (data) =>
  api.post("/invoices/payment/create-order", data)

export const verifyInvoicePayment = (data) =>
  api.post("/invoices/payment/verify", data)

export const getAllInvoices = (params = {}) =>
  api.get("/invoices", { params })

export const getInvoiceById = (invoiceId) =>
  api.get(`/invoices/${invoiceId}`)

/* ================= INTERCEPTOR ================= */

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true

      try {
        const role = localStorage.getItem("role")

        if (role === "ADMIN") {
          await refreshAdminToken()
          return api(original)
        } else if (role === "RESTAURANT") {
          await refreshRestaurantToken()
          return api(original)
        }
      } catch {
        localStorage.removeItem("role")
        localStorage.removeItem("accessToken")
        const currentPath = window.location.pathname
        if (currentPath.startsWith("/admin")) {
          window.location.href = "/admin/login"
        } else {
          window.location.href = "/login"
        }
      }
    }

    return Promise.reject(error)
  }
)

export default api
