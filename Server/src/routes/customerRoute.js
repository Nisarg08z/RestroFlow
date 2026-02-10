import { Router } from "express";
import {
  sendOTP,
  verifyOTP,
  getOrders,
  addToOrder,
  submitOrder,
} from "../controllers/customerController.js";

const router = Router();

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.get("/orders", getOrders);
router.post("/orders/add", addToOrder);
router.post("/orders/submit", submitOrder);

export default router;
