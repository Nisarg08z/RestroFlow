import { Router } from "express";
import {
  sendOTP,
  verifyOTP,
  getOrders,
  addToOrder,
  submitOrder,
  removeItemFromOrder,
  updateItemQuantity,
} from "../controllers/customerController.js";

const router = Router();

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.get("/orders", getOrders);
router.post("/orders/add", addToOrder);
router.post("/orders/submit", submitOrder);
router.post("/orders/remove-item", removeItemFromOrder);
router.patch("/orders/update-quantity", updateItemQuantity);

export default router;
