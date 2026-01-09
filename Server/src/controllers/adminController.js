import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Admin } from "../models/adminModel.js"
import { Restaurant } from "../models/restaurantModel.js"
import { generateAccessAndRefreshTokens } from "../utils/generateTokens.js"
import jwt from "jsonwebtoken"

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw new ApiError(400, "Email and password required")
  }

  const admin = await Admin.findOne({ email })

  if (!admin) {
    throw new ApiError(404, "Admin not found")
  }

  const isPasswordValid = await admin.isPasswordCorrect(password)

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials")
  }

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshTokens(Admin, admin._id)

  const loggedInAdmin = await Admin.findById(admin._id)
    .select("-password -refreshToken")

  return res.status(200).json(
    new ApiResponse(
      200,
      { admin: loggedInAdmin, accessToken, refreshToken },
      "Admin logged in successfully"
    )
  )
})

const getCurrentAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin._id)
    .select("-password -refreshToken")

  if (!admin) {
    throw new ApiError(404, "Admin not found")
  }

  return res.status(200).json(
    new ApiResponse(200, admin, "Current admin fetched successfully")
  )
})

const logoutAdmin = asyncHandler(async (req, res) => {
  await Admin.findByIdAndUpdate(
    req.admin._id,
    {
      $unset: { refreshToken: 1 }
    },
    { new: true }
  )

  return res.status(200).json(
    new ApiResponse(200, {}, "Admin logged out successfully")
  )
})

const approveRestaurant = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params
  const { pricePerMonth } = req.body

  const restaurant = await Restaurant.findById(restaurantId)

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found")
  }

  restaurant.status = "APPROVED"
  restaurant.approvedByAdmin = true
  restaurant.approvedAt = new Date()
  restaurant.subscription = {
    pricePerMonth,
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    isActive: true,
  }

  await restaurant.save()

  return res.status(200).json(
    new ApiResponse(200, restaurant, "Restaurant approved successfully")
  )
})

const getAllRestaurants = asyncHandler(async (req, res) => {
  const restaurants = await Restaurant.find()
    .select("-password -refreshToken")

  return res
    .status(200)
    .json(new ApiResponse(200, restaurants, "All restaurants fetched"))
})

const refreshAdminToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request")
  }

  const decoded = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  )

  const admin = await Admin.findById(decoded._id)

  if (!admin || admin.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Invalid refresh token")
  }

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshTokens(Admin, admin._id)

  return res.status(200).json(
    new ApiResponse(
      200,
      { accessToken, refreshToken },
      "Admin access token refreshed"
    )
  )
})


export {
  loginAdmin,
  approveRestaurant,
  getAllRestaurants,
  getCurrentAdmin,
  logoutAdmin,
  refreshAdminToken
}
