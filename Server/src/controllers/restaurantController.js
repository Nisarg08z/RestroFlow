import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Restaurant } from "../models/restaurantModel.js"
import jwt from "jsonwebtoken"
import { generateAccessAndRefreshTokens } from "../utils/generateTokens.js"

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
}
