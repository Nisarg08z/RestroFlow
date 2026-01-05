import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true
      try {
        await api.post("/restaurant/refresh-token")
        return api(originalRequest)
      } catch (err) {
        window.location.href = "/login"
        return Promise.reject(err)
      }
    }
    return Promise.reject(error)
  }
)

export const restaurantLogin = (data) =>
  api.post("/restaurant/login", data)

export const restaurantLogout = () =>
  api.post("/restaurant/logout")

export const getCurrentRestaurant = () =>
  api.get("/restaurant/current-restaurant")


export const adminLogin = (data) =>
  api.post("/admin/login", data)

export const getAllRestaurants = () =>
  api.get("/admin/restaurants")

export const approveRestaurant = (id, data) =>
  api.patch(`/admin/approve/${id}`, data)

export default api
