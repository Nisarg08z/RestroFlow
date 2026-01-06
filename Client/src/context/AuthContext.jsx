import React, { createContext, useEffect, useState } from "react"
import {
  getCurrentAdmin,
  getCurrentRestaurant,
} from "../utils/api"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  const checkAuth = async () => {
    try {
      const savedRole = localStorage.getItem("role")

      if (savedRole === "ADMIN") {
        const res = await getCurrentAdmin()
        setUser(res.data)
        setRole("ADMIN")
      } else if (savedRole === "RESTAURANT") {
        const res = await getCurrentRestaurant()
        setUser(res.data)
        setRole("RESTAURANT")
      } else {
        setUser(null)
        setRole(null)
      }
    } catch {
      setUser(null)
      setRole(null)
      localStorage.removeItem("role")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        isLoggedIn: !!user,
        setUser,
        setRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
