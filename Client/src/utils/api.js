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

export const requestPasswordReset = (data) =>
  api.post("/restaurant/forgot-password", data)

export const verifyOTP = (data) =>
  api.post("/restaurant/verify-otp", data)

export const resetPassword = (data) =>
  api.post("/restaurant/reset-password", data)

export const createLocationPaymentOrder = (data) =>
  api.post("/restaurant/locations/create-payment-order", data)

export const verifyLocationPaymentAndAdd = (data) =>
  api.post("/restaurant/locations/verify-payment", data)

export const updateRestaurantProfile = (data) =>
  api.patch("/restaurant/me", data)

export const updateLocation = (locationId, data) =>
  api.patch(`/restaurant/locations/${locationId}`, data)

export const generateLocationQRCodes = (locationId) =>
  api.post(`/restaurant/locations/${locationId}/generate-qr`)

export const regenerateTableQRCode = (locationId, tableNumber) =>
  api.post(`/restaurant/locations/${locationId}/qr/${tableNumber}/regenerate`)

export const getMySubscription = () =>
  api.get("/restaurant/subscription")

export const renewMySubscription = (data) =>
  api.post("/restaurant/subscription/renew", data)

export const getMyInvoices = (params = {}) =>
  api.get("/restaurant/invoices", { params })

/* ================= MENU ================= */

export const getMenu = () =>
  api.get("/restaurant/menu")

export const addCategory = (data) =>
  api.post("/restaurant/menu/categories", data)

export const updateCategory = (categoryId, data) =>
  api.patch(`/restaurant/menu/categories/${categoryId}`, data)

export const deleteCategory = (categoryId) =>
  api.delete(`/restaurant/menu/categories/${categoryId}`)

export const addMenuItem = (data) =>
  api.post("/restaurant/menu/items", data)

export const updateMenuItem = (itemId, data) =>
  api.patch(`/restaurant/menu/items/${itemId}`, data)

export const deleteMenuItem = (itemId) =>
  api.delete(`/restaurant/menu/items/${itemId}`)

export const getLocationMenu = (locationId) =>
  api.get(`/restaurant/menu/locations/${locationId}`)

export const hideItemFromLocation = (locationId, data) =>
  api.post(`/restaurant/menu/locations/${locationId}/hide-item`, data)

export const showItemInLocation = (locationId, data) =>
  api.post(`/restaurant/menu/locations/${locationId}/show-item`, data)

export const addLocationMenuItem = (locationId, data) =>
  api.post(`/restaurant/menu/locations/${locationId}/items`, data)

export const updateLocationMenuItem = (locationId, itemId, data) =>
  api.patch(`/restaurant/menu/locations/${locationId}/items/${itemId}`, data)

export const deleteLocationMenuItem = (locationId, itemId) =>
  api.delete(`/restaurant/menu/locations/${locationId}/items/${itemId}`)

export const getPublicMenu = (restaurantId, locationId) =>
  api.get(`/restaurant/public/menu/${restaurantId}/${locationId}`)

/* ================= CUSTOMER (Table Menu) ================= */

export const sendCustomerOTP = (data) =>
  api.post("/customer/send-otp", data)

export const verifyCustomerOTP = (data) =>
  api.post("/customer/verify-otp", data)

export const getCustomerOrders = (restaurantId, locationId, tableNumber, phone) =>
  api.get("/customer/orders", { params: { restaurantId, locationId, tableNumber, phone } })

export const addToCustomerOrder = (data) =>
  api.post("/customer/orders/add", data)

export const submitCustomerOrder = (data) =>
  api.post("/customer/orders/submit", data)

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

export const getRestaurantById = (restaurantId) =>
  api.get(`/admin/restaurants/${restaurantId}`)

export const toggleRestaurantBlock = (restaurantId) =>
  api.patch(`/admin/restaurants/${restaurantId}/toggle-block`)

export const deleteRestaurant = (restaurantId) =>
  api.delete(`/admin/restaurants/${restaurantId}`)

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

/* ================= TICKETS / SUPPORT ================= */

export const createTicket = (data) =>
  api.post("/tickets/create", data)

export const getRestaurantTickets = () =>
  api.get("/tickets/my-tickets")

export const getAdminTickets = () =>
  api.get("/tickets/admin/all")

export const updateTicketStatus = (ticketId, data) =>
  api.patch(`/tickets/admin/${ticketId}`, data)

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
