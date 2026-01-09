import { Router } from "express";
import {
  submitRestaurantRequest,
  getAllRestaurantRequests,
  getRestaurantRequestById,
  updateRequestStatus,
  deleteRestaurantRequest,
  sendRestaurantRequestReply,
  verifySignupToken,
  createPaymentOrder,
  completeSignup,
} from "../controllers/restaurantRequestController.js";
import { verifyAdminJWT } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/submit", submitRestaurantRequest);
router.get("/verify-token/:token", verifySignupToken);
router.post("/create-payment-order", createPaymentOrder);
router.post("/complete-signup", completeSignup);

router.get("/", verifyAdminJWT, getAllRestaurantRequests);
router.get("/:id", verifyAdminJWT, getRestaurantRequestById);
router.patch("/:id/status", verifyAdminJWT, updateRequestStatus);
router.delete("/:id", verifyAdminJWT, deleteRestaurantRequest);
router.post("/:id/reply", verifyAdminJWT, sendRestaurantRequestReply);

export default router;

