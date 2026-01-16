import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Restaurant } from "../models/restaurantModel.js"
import jwt from "jsonwebtoken"
import { generateAccessAndRefreshTokens } from "../utils/generateTokens.js"
import { sendOTPEmail } from "../utils/emailService.js"

const restaurantLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw new ApiError(400, "Email and password required")
  }

  const restaurant = await Restaurant.findOne({ email })

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found")
  }

  if (restaurant.status !== "APPROVED") {
    throw new ApiError(403, "Account not approved by admin")
  }

  if (restaurant.isBlocked) {
    throw new ApiError(403, "Your account has been suspended. Please contact admin for assistance.")
  }

  const isPasswordValid = await restaurant.isPasswordCorrect(password)

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials")
  }

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshTokens(Restaurant, restaurant._id)

  const loggedInRestaurant = await Restaurant.findById(restaurant._id)
    .select("-password -refreshToken")

  return res.status(200).json(
    new ApiResponse(
      200,
      { restaurant: loggedInRestaurant, accessToken, refreshToken },
      "Restaurant logged in successfully"
    )
  )
})

const restaurantLogout = asyncHandler(async (req, res) => {
  await Restaurant.findByIdAndUpdate(req.user._id, {
    $unset: { refreshToken: 1 },
  })

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Restaurant logged out"))
})

const refreshRestaurantToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request")
  }

  const decoded = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  )

  const restaurant = await Restaurant.findById(decoded._id)

  if (!restaurant || incomingRefreshToken !== restaurant.refreshToken) {
    throw new ApiError(401, "Invalid refresh token")
  }

  if (restaurant.isBlocked) {
    throw new ApiError(403, "Your account has been suspended. Please contact admin for assistance.")
  }

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshTokens(Restaurant, restaurant._id)

  return res.status(200).json(
    new ApiResponse(
      200,
      { accessToken, refreshToken },
      "Access token refreshed"
    )
  )
})

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body

  if (!email) {
    throw new ApiError(400, "Email is required")
  }

  const restaurant = await Restaurant.findOne({ email })

  if (!restaurant) {
    throw new ApiError(404, "User with this email does not exist")
  }

  // Generate 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString()

  restaurant.resetPasswordOTP = otp
  restaurant.resetPasswordExpiry = Date.now() + 10 * 60 * 1000 // 10 minutes
  await restaurant.save({ validateBeforeSave: false })

  try {
    await sendOTPEmail(email, otp)
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "OTP sent to your email"))
  } catch (error) {
    restaurant.resetPasswordOTP = undefined
    restaurant.resetPasswordExpiry = undefined
    await restaurant.save({ validateBeforeSave: false })
    throw new ApiError(500, "Failed to send OTP. Please try again.")
  }
})

const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body

  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required")
  }

  const restaurant = await Restaurant.findOne({
    email,
    resetPasswordOTP: otp,
    resetPasswordExpiry: { $gt: Date.now() },
  })

  if (!restaurant) {
    throw new ApiError(400, "Invalid OTP or OTP has expired")
  }

  return res.status(200).json(new ApiResponse(200, {}, "OTP verified successfully"))
})

const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body

  if (!email || !otp || !newPassword) {
    throw new ApiError(400, "Email, OTP and new password are required")
  }

  const restaurant = await Restaurant.findOne({
    email,
    resetPasswordOTP: otp,
    resetPasswordExpiry: { $gt: Date.now() },
  })

  if (!restaurant) {
    throw new ApiError(400, "Invalid OTP or OTP has expired")
  }

  restaurant.password = newPassword
  restaurant.resetPasswordOTP = undefined
  restaurant.resetPasswordExpiry = undefined
  await restaurant.save()

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successfully"))
})

const getCurrentRestaurant = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Restaurant fetched"))
})

export {
  restaurantLogin,
  restaurantLogout,
  refreshRestaurantToken,
  getCurrentRestaurant,
  forgotPassword,
  resetPassword,
  verifyOTP,
}
