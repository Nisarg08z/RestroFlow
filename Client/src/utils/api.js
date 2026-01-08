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

export const verifySignupToken = (token) =>
  api.get(`/requests/verify-token/${token}`)

export const createPaymentOrder = (data) =>
  api.post("/requests/create-payment-order", data)

export const completeSignup = (data) =>
  api.post("/requests/complete-signup", data)

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
