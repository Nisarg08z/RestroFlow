import { Router } from "express"
import {
  loginAdmin,
  logoutAdmin,
  refreshAdminToken,
  getCurrentAdmin,
  approveRestaurant,
  getAllRestaurants,
} from "../controllers/adminController.js"
import { verifyAdminJWT } from "../middlewares/authMiddleware.js"

const router = Router()

router.post("/login", loginAdmin)
router.post("/refresh-token", refreshAdminToken)

router.get("/me", verifyAdminJWT, getCurrentAdmin)
router.post("/logout", verifyAdminJWT, logoutAdmin)

router.get("/restaurants", verifyAdminJWT, getAllRestaurants)
router.patch(
  "/approve/:restaurantId",
  verifyAdminJWT,
  approveRestaurant
)

export default router
