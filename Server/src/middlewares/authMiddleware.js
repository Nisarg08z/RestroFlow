import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js"
import { Admin } from "../models/adminModel.js"
import { Restaurant } from "../models/restaurantModel.js"

export const verifyAdminJWT = async (req, _, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    if (!token) {
      throw new ApiError(401, "Unauthorized - No token provided")
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    const admin = await Admin.findById(decoded._id).select("-password -refreshToken")
    if (!admin) {
      throw new ApiError(401, "Invalid admin token")
    }

    req.user = admin
    req.admin = admin
    next()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(401, "Invalid or expired token")
  }
}

export const verifyRestaurantJWT = async (req, _, next) => {
  const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
  if (!token) throw new ApiError(401, "Unauthorized")

  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
  const restaurant = await Restaurant.findById(decoded._id).select("-password -refreshToken")
  if (!restaurant) throw new ApiError(401, "Invalid restaurant token")

  req.user = restaurant
  next()
}
