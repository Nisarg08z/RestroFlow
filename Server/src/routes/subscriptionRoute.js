import { Router } from "express"
import {
  getAllSubscriptions,
  getSubscriptionById,
  updateSubscription,
  renewSubscription,
  cancelSubscription,
  getSubscriptionStats,
} from "../controllers/subscriptionController.js"
import { verifyAdminJWT } from "../middlewares/authMiddleware.js"

const router = Router()


router.use(verifyAdminJWT)
router.get("/stats", getSubscriptionStats)
router.get("/", getAllSubscriptions)
router.get("/:restaurantId", getSubscriptionById)
router.patch("/:restaurantId", updateSubscription)
router.post("/:restaurantId/renew", renewSubscription)
router.post("/:restaurantId/cancel", cancelSubscription)

export default router
