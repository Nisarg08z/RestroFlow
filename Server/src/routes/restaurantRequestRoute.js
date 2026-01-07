import { Router } from "express";
import {
  submitRestaurantRequest,
  getAllRestaurantRequests,
  getRestaurantRequestById,
  updateRequestStatus,
  deleteRestaurantRequest,
} from "../controllers/restaurantRequestController.js";
import { verifyAdminJWT } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/submit", submitRestaurantRequest);
router.get("/", verifyAdminJWT, getAllRestaurantRequests);
router.get("/:id", verifyAdminJWT, getRestaurantRequestById);
router.patch("/:id/status", verifyAdminJWT, updateRequestStatus);
router.delete("/:id", verifyAdminJWT, deleteRestaurantRequest);

export default router;

