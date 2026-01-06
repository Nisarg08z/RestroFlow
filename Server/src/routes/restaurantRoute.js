import { Router } from "express"
import {
  restaurantLogin,
  restaurantLogout,
  getCurrentRestaurant,
  refreshRestaurantToken,
} from "../controllers/restaurantController.js"
import { verifyRestaurantJWT } from "../middlewares/authMiddleware.js"

const router = Router()

router.post("/login", restaurantLogin)
router.post("/refresh-token", refreshRestaurantToken)
router.post("/logout", verifyRestaurantJWT, restaurantLogout)
router.get("/me", verifyRestaurantJWT, getCurrentRestaurant)

export default router
