import { Router } from "express"
import {
  loginAdmin,
  approveRestaurant,
  getAllRestaurants,
} from "../controllers/admin.controller.js"
import { verifyAdminJWT } from "../middlewares/authMiddleware.js"

const router = Router()

router.route("/login").post(loginAdmin)
router.route("/restaurants").get(verifyAdminJWT, getAllRestaurants)
router.route("/approve/:restaurantId").patch(verifyAdminJWT, approveRestaurant)

export default router
