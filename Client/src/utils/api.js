import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  withCredentials: true,
})

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
        } else if (role === "RESTAURANT") {
          await refreshRestaurantToken()
        }

        return api(original)
      } catch {
        localStorage.removeItem("role")
        window.location.href = "/login"
      }
    }

    return Promise.reject(error)
  }
)

export default api
