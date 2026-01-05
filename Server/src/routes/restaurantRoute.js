import { Router } from "express"
import {
  loginRestaurant,
  logoutRestaurant,
  refreshRestaurantToken,
  getCurrentRestaurant,
} from "../controllers/restaurant.controller.js"
import { verifyRestaurantJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/login").post(loginRestaurant)
router.route("/logout").post(verifyRestaurantJWT, logoutRestaurant)
router.route("/refresh-token").post(refreshRestaurantToken)
router.route("/current-restaurant").get(verifyRestaurantJWT, getCurrentRestaurant)

export default router
