import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Ticket } from "../models/ticketModel.js";
import crypto from "crypto";
import { getIO } from "../utils/socket.js";

const generateTicketToken = () => {
    return "TKT-" + crypto.randomBytes(4).toString("hex").toUpperCase();
};

export const createTicket = asyncHandler(async (req, res) => {
    const { subject, message, priority } = req.body;
    const restaurantId = req.user._id;

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

    const populatedTicket = await Ticket.findById(ticket._id)
        .populate("restaurantId", "restaurantName email phone");

    try {
        const io = getIO();
        if (io) {
            io.emit('newTicket', {
                _id: populatedTicket._id,
                ticketToken: populatedTicket.ticketToken,
                subject: populatedTicket.subject,
                message: populatedTicket.message,
                priority: populatedTicket.priority,
                status: populatedTicket.status,
                restaurantId: {
                    _id: populatedTicket.restaurantId._id,
                    restaurantName: populatedTicket.restaurantId.restaurantName,
                    email: populatedTicket.restaurantId.email,
                },
                createdAt: populatedTicket.createdAt,
            });
        }
    } catch (error) {
        console.error("Failed to emit new ticket notification:", error);
    }

    return res
        .status(201)
        .json(new ApiResponse(201, ticket, "Ticket created successfully"));
});

export const getRestaurantTickets = asyncHandler(async (req, res) => {
    const restaurantId = req.user._id;

    const tickets = await Ticket.find({ restaurantId }).sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, tickets, "Tickets fetched successfully"));
});

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

    if (adminResponse || status) {
        try {
            const io = getIO();
            if (io) {
                const restaurantId = ticket.restaurantId?._id 
                    ? ticket.restaurantId._id.toString() 
                    : ticket.restaurantId?.toString() || ticket.restaurantId;
                io.to(restaurantId).emit('ticketUpdate', {
                    ticketId: ticket._id,
                    ticketToken: ticket.ticketToken,
                    status: ticket.status,
                    adminResponse: ticket.adminResponse,
                    subject: ticket.subject,
                });
            }
        } catch (error) {
            console.error("Failed to emit ticket update notification:", error);
        }
    }

    return res
        .status(200)
        .json(new ApiResponse(200, ticket, "Ticket updated successfully"));
});
