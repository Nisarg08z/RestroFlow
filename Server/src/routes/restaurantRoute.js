import { Router } from "express"
import {
  restaurantLogin,
  restaurantLogout,
  getCurrentRestaurant,
  refreshRestaurantToken,
  forgotPassword,
  resetPassword,
  verifyOTP,
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

export default router
