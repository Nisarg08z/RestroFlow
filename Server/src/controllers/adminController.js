import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Admin } from "../models/admin.model.js"
import { Restaurant } from "../models/restaurant.model.js"
import { generateAccessAndRefreshTokens } from "../utils/generateTokens.js"

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

const approveRestaurant = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params
  const { plan, pricePerMonth } = req.body

  const restaurant = await Restaurant.findById(restaurantId)

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found")
  }

  restaurant.status = "APPROVED"
  restaurant.approvedByAdmin = true
  restaurant.approvedAt = new Date()
  restaurant.subscription = {
    plan,
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

export {
  loginAdmin,
  approveRestaurant,
  getAllRestaurants,
}
