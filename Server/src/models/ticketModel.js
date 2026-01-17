import mongoose, { Schema } from "mongoose";

const ticketSchema = new Schema(
    {
        restaurantId: {
            type: Schema.Types.ObjectId,
            ref: "Restaurant",
        },
        ticketToken: {
            type: String,
            required: true,
            unique: true,
            index: true,
            // This is the "Token" user mentioned
        },
        subject: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"],
            default: "OPEN",
        },
        priority: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
            default: "MEDIUM",
        },
        adminResponse: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

export const Ticket = mongoose.model("Ticket", ticketSchema);
