import { Router } from "express";
import { verifyRestaurantJWT, verifyAdminJWT } from "../middlewares/authMiddleware.js";
import {
    createTicket,
    getRestaurantTickets,
    getAllTickets,
    updateTicketStatus
} from "../controllers/ticketController.js";

const router = Router();

// Restaurant Routes
router.post("/create", verifyRestaurantJWT, createTicket);
router.get("/my-tickets", verifyRestaurantJWT, getRestaurantTickets);

// Admin Routes
router.get("/admin/all", verifyAdminJWT, getAllTickets);
router.patch("/admin/:ticketId", verifyAdminJWT, updateTicketStatus);

export default router;
