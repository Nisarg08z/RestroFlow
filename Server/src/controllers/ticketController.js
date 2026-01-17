import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Ticket } from "../models/ticketModel.js";
import crypto from "crypto";
import { sendGenericEmail } from "../utils/emailService.js";
import { Restaurant } from "../models/restaurantModel.js";

// Generate a unique token/ID for the ticket
const generateTicketToken = () => {
    return "TKT-" + crypto.randomBytes(4).toString("hex").toUpperCase();
};

export const createTicket = asyncHandler(async (req, res) => {
    const { subject, message, priority } = req.body;
    const restaurantId = req.restaurant._id;

    if (!subject || !message) {
        throw new ApiError(400, "Subject and message are required");
    }

    const ticketToken = generateTicketToken();

    const ticket = await Ticket.create({
        restaurantId,
        ticketToken,
        subject,
        message,
        priority: priority || "MEDIUM",
    });

    return res
        .status(201)
        .json(new ApiResponse(201, ticket, "Ticket created successfully"));
});

export const getRestaurantTickets = asyncHandler(async (req, res) => {
    const restaurantId = req.restaurant._id;

    const tickets = await Ticket.find({ restaurantId }).sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, tickets, "Tickets fetched successfully"));
});

// Admin Controllers

export const getAllTickets = asyncHandler(async (req, res) => {
    const tickets = await Ticket.find()
        .populate("restaurantId", "restaurantName email phone")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, tickets, "All tickets fetched successfully"));
});

export const updateTicketStatus = asyncHandler(async (req, res) => {
    const { ticketId } = req.params;
    const { status, adminResponse } = req.body;

    const ticket = await Ticket.findById(ticketId).populate("restaurantId");

    if (!ticket) {
        throw new ApiError(404, "Ticket not found");
    }

    if (status) ticket.status = status;
    if (adminResponse) ticket.adminResponse = adminResponse;

    await ticket.save();

    // Send email notification to restaurant if admin responded or closed
    if (adminResponse || status === 'RESOLVED' || status === 'CLOSED') {
        try {
            const restaurantEmail = ticket.restaurantId?.email;
            if (restaurantEmail) {
                const emailSubject = `Update on Ticket ${ticket.ticketToken}: ${ticket.subject}`;
                const emailHtml = `
                    <p>Hello ${ticket.restaurantId.restaurantName},</p>
                    <p>There is an update on your support ticket <strong>${ticket.ticketToken}</strong>.</p>
                    <p><strong>Status:</strong> ${ticket.status}</p>
                    ${adminResponse ? `<p><strong>Admin Response:</strong> ${adminResponse}</p>` : ''}
                    <p>Thank you,<br>RestroFlow Admin Team</p>
                `;
                const emailText = `Update on Ticket ${ticket.ticketToken}\nStatus: ${ticket.status}\n${adminResponse ? `Admin Response: ${adminResponse}` : ''}`;

                await sendGenericEmail(restaurantEmail, emailSubject, emailHtml, emailText);
            }
        } catch (error) {
            console.error("Failed to send ticket update email:", error);
            // Don't fail the request if email fails
        }
    }

    return res
        .status(200)
        .json(new ApiResponse(200, ticket, "Ticket updated successfully"));
});
