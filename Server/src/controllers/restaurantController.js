import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Restaurant } from "../models/restaurantModel.js"
import jwt from "jsonwebtoken"
import { generateAccessAndRefreshTokens } from "../utils/generateTokens.js"

import { sendOTPEmail } from "../utils/emailService.js"
import { createOrder, verifyPayment } from "../utils/razorpay.js"
import QRCode from "qrcode"
import cloudinary, { uploadImageFromDataUrl } from "../utils/cloudinary.js"

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
    .json(new ApiResponse(200, req.user, "Restaurant fetched"))
})

const createLocationPaymentOrder = asyncHandler(async (req, res) => {
  const { totalTables } = req.body;

  if (!totalTables || totalTables <= 0) {
    throw new ApiError(400, "Total tables must be greater than 0");
  }

  const PRICE_PER_TABLE = 50;
  const amount = Number(totalTables) * PRICE_PER_TABLE;

  const receipt = `loc_add_${Date.now()}`;
  const order = await createOrder(amount, "INR", receipt);

  return res.status(200).json(
    new ApiResponse(200, {
      orderId: order.id,
      amount: amount,
      currency: "INR",
      totalTables,
    }, "Payment order created successfully")
  );
});

const verifyLocationPaymentAndAdd = asyncHandler(async (req, res) => {
  const {
    locationName, address, city, state, zipCode, country, phone, totalTables,
    razorpay_order_id, razorpay_payment_id, razorpay_signature
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, "Payment verification details are required");
  }

  const isPaymentValid = verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  if (!isPaymentValid) {
    throw new ApiError(400, "Invalid payment signature");
  }

  if (!locationName || !address || !city || !state || !zipCode || !totalTables) {
    throw new ApiError(400, "All location fields are required");
  }

  const restaurant = await Restaurant.findById(req.user._id);
  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  const newLocation = {
    locationName,
    address,
    city,
    state,
    zipCode,
    country: country || "USA",
    phone,
    totalTables: Number(totalTables),
    isActive: true
  };

  restaurant.locations.push(newLocation);

  const PRICE_PER_TABLE = 50;
  const additionalCost = Number(totalTables) * PRICE_PER_TABLE;

  if (restaurant.subscription) {
    restaurant.subscription.pricePerMonth += additionalCost;
  } else {
    restaurant.subscription = {
      pricePerMonth: additionalCost,
      isActive: true,
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
    };
  }

  await restaurant.save();

  return res.status(200).json(
    new ApiResponse(200, restaurant, "Location added and payment verified successfully")
  );
});

const updateRestaurantProfile = asyncHandler(async (req, res) => {
  const { phone, gstNumber, restaurantName, ownerName } = req.body;

  const restaurant = await Restaurant.findById(req.user._id);
  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  if (phone !== undefined) restaurant.phone = phone;
  if (gstNumber !== undefined) restaurant.gstNumber = gstNumber;
  if (restaurantName !== undefined) restaurant.restaurantName = restaurantName;
  if (ownerName !== undefined) restaurant.ownerName = ownerName;

  await restaurant.save();

  const updatedRestaurant = await Restaurant.findById(req.user._id)
    .select("-password -refreshToken");

  return res.status(200).json(
    new ApiResponse(200, updatedRestaurant, "Profile updated successfully")
  );
});

const updateLocation = asyncHandler(async (req, res) => {
  const { locationId } = req.params;
  const { locationName, address, city, state, zipCode, country, phone, totalTables, isActive } = req.body;

  const restaurant = await Restaurant.findById(req.user._id);
  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  const location = restaurant.locations.id(locationId);
  if (!location) {
    throw new ApiError(404, "Location not found");
  }

  if (locationName !== undefined) location.locationName = locationName;
  if (address !== undefined) location.address = address;
  if (city !== undefined) location.city = city;
  if (state !== undefined) location.state = state;
  if (zipCode !== undefined) location.zipCode = zipCode;
  if (country !== undefined) location.country = country;
  if (phone !== undefined) location.phone = phone;
  if (totalTables !== undefined) location.totalTables = Number(totalTables);
  if (isActive !== undefined) location.isActive = isActive;

  await restaurant.save();

  const updatedRestaurant = await Restaurant.findById(req.user._id)
    .select("-password -refreshToken");

  return res.status(200).json(
    new ApiResponse(200, updatedRestaurant, "Location updated successfully")
  );
});

const generateLocationQRCodes = asyncHandler(async (req, res) => {
  const { locationId } = req.params

  const restaurant = await Restaurant.findById(req.user._id)
  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found")
  }

  const location = restaurant.locations.id(locationId)
  if (!location) {
    throw new ApiError(404, "Location not found")
  }

  if (!location.totalTables || location.totalTables <= 0) {
    throw new ApiError(400, "Location has no tables configured")
  }

  if (!location.tableQRCodes) {
    location.tableQRCodes = []
  }

  const existingByTable = new Map(
    location.tableQRCodes.map((entry) => [entry.tableNumber, entry])
  )

  const baseUrlFromEnv = process.env.FRONTEND_URL
  const origin = req.headers.origin
  const baseUrl =
    (baseUrlFromEnv && baseUrlFromEnv.trim() !== "")
      ? baseUrlFromEnv
      : origin || "http://localhost:5173"

  const created = []

  for (let tableNumber = 1; tableNumber <= location.totalTables; tableNumber++) {
    if (existingByTable.has(tableNumber)) {
      continue
    }

    const tableUrl = `${baseUrl.replace(/\/$/, "")}/menu/${restaurant._id}/${location._id}/${tableNumber}`

    const dataUrl = await QRCode.toDataURL(tableUrl, {
      width: 512,
      margin: 2,
      errorCorrectionLevel: "H",
    })

    const uploadResult = await uploadImageFromDataUrl(
      dataUrl,
      `restroflow/qr-codes/${restaurant._id}/${location._id}`
    )

    const record = {
      tableNumber,
      qrImageUrl: uploadResult.secure_url,
      qrPublicId: uploadResult.public_id,
    }

    location.tableQRCodes.push(record)
    created.push(record)
  }

  if (location.tableQRCodes.length === location.totalTables) {
    restaurant.qrCodesGenerated = true
  }

  await restaurant.save()

  const message =
    created.length > 0
      ? "QR codes generated successfully"
      : "QR codes already exist for all tables in this location"

  return res.status(200).json(
    new ApiResponse(200, {
      locationId: location._id,
      totalTables: location.totalTables,
      createdCount: created.length,
      tableQRCodes: location.tableQRCodes,
    }, message)
  )
})
  
const regenerateTableQRCode = asyncHandler(async (req, res) => {
  const { locationId, tableNumber } = req.params
  const tableNum = Number(tableNumber)

  if (!tableNum || Number.isNaN(tableNum) || tableNum <= 0) {
    throw new ApiError(400, "Valid table number is required")
  }

  const restaurant = await Restaurant.findById(req.user._id)
  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found")
  }

  const location = restaurant.locations.id(locationId)
  if (!location) {
    throw new ApiError(404, "Location not found")
  }

  if (!location.totalTables || tableNum > location.totalTables) {
    throw new ApiError(400, "Table number is out of range for this location")
  }

  if (!location.tableQRCodes) {
    location.tableQRCodes = []
  }

  const existingIndex = location.tableQRCodes.findIndex(
    (entry) => entry.tableNumber === tableNum
  )
  const existing = existingIndex >= 0 ? location.tableQRCodes[existingIndex] : null

  if (existing?.qrPublicId) {
    try {
      await cloudinary.uploader.destroy(existing.qrPublicId)
    } catch {
    }
  }

  const baseUrlFromEnv = process.env.FRONTEND_URL
  const origin = req.headers.origin
  const baseUrl =
    (baseUrlFromEnv && baseUrlFromEnv.trim() !== "")
      ? baseUrlFromEnv
      : origin || "http://localhost:5173"

  const tableUrl = `${baseUrl.replace(/\/$/, "")}/menu/${restaurant._id}/${location._id}/${tableNum}`

  const dataUrl = await QRCode.toDataURL(tableUrl, {
    width: 512,
    margin: 2,
    errorCorrectionLevel: "H",
  })

  const uploadResult = await uploadImageFromDataUrl(
    dataUrl,
    `restroflow/qr-codes/${restaurant._id}/${location._id}`
  )

  if (existingIndex >= 0) {
    location.tableQRCodes[existingIndex].qrImageUrl = uploadResult.secure_url
    location.tableQRCodes[existingIndex].qrPublicId = uploadResult.public_id
  } else {
    location.tableQRCodes.push({
      tableNumber: tableNum,
      qrImageUrl: uploadResult.secure_url,
      qrPublicId: uploadResult.public_id,
    })
  }

  restaurant.markModified("locations")

  await restaurant.save()

  const updatedRecord =
    location.tableQRCodes.find((entry) => entry.tableNumber === tableNum) ||
    {
      tableNumber: tableNum,
      qrImageUrl: uploadResult.secure_url,
      qrPublicId: uploadResult.public_id,
    }

  return res.status(200).json(
    new ApiResponse(200, updatedRecord, "Table QR code regenerated successfully")
  )
})

export {
  restaurantLogin,
  restaurantLogout,
  refreshRestaurantToken,
  getCurrentRestaurant,
  forgotPassword,
  resetPassword,
  verifyOTP,
  createLocationPaymentOrder,
  verifyLocationPaymentAndAdd,
  updateRestaurantProfile,
  updateLocation,
  generateLocationQRCodes,
  regenerateTableQRCode,
}

