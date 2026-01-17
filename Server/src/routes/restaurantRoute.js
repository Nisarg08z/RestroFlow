import { Router } from "express"
import {
  restaurantLogin,
  restaurantLogout,
  getCurrentRestaurant,
  refreshRestaurantToken,
  forgotPassword,
  resetPassword,
  verifyOTP,
  createLocationPaymentOrder,
  verifyLocationPaymentAndAdd,
  updateRestaurantProfile,
  updateLocation,
} from "../controllers/restaurantController.js"
import { verifyRestaurantJWT } from "../middlewares/authMiddleware.js"

const router = Router()

router.post("/login", restaurantLogin)
router.post("/refresh-token", refreshRestaurantToken)
router.post("/forgot-password", forgotPassword)
router.post("/verify-otp", verifyOTP)
router.post("/reset-password", resetPassword)
router.post("/logout", verifyRestaurantJWT, restaurantLogout)
router.get("/me", verifyRestaurantJWT, getCurrentRestaurant)
router.patch("/me", verifyRestaurantJWT, updateRestaurantProfile)
router.post("/locations/create-payment-order", verifyRestaurantJWT, createLocationPaymentOrder)
router.post("/locations/verify-payment", verifyRestaurantJWT, verifyLocationPaymentAndAdd)
router.patch("/locations/:locationId", verifyRestaurantJWT, updateLocation)

export default router
