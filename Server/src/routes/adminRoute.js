import { Router } from "express"
import {
  loginAdmin,
  logoutAdmin,
  refreshAdminToken,
  getCurrentAdmin,
  approveRestaurant,
  getAllRestaurants,
  toggleRestaurantBlock,
  deleteRestaurant,
  getRestaurantById,
} from "../controllers/adminController.js"
import { verifyAdminJWT } from "../middlewares/authMiddleware.js"

const router = Router()

router.post("/login", loginAdmin)
router.post("/refresh-token", refreshAdminToken)

router.get("/me", verifyAdminJWT, getCurrentAdmin)
router.post("/logout", verifyAdminJWT, logoutAdmin)

router.get("/restaurants", verifyAdminJWT, getAllRestaurants)
router.get("/restaurants/:restaurantId", verifyAdminJWT, getRestaurantById)
router.patch(
  "/approve/:restaurantId",
  verifyAdminJWT,
  approveRestaurant
)
router.patch(
  "/restaurants/:restaurantId/toggle-block",
  verifyAdminJWT,
  toggleRestaurantBlock
)
router.delete(
  "/restaurants/:restaurantId",
  verifyAdminJWT,
  deleteRestaurant
)

export default router
