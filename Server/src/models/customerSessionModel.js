import mongoose, { Schema } from "mongoose";

const customerSessionSchema = new Schema(
  {
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    locationId: {
      type: String,
      required: true,
    },
    tableNumber: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpiresAt: {
      type: Date,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

customerSessionSchema.index(
  { phone: 1, restaurantId: 1, locationId: 1, tableNumber: 1 },
  { unique: true }
);

export const CustomerSession = mongoose.model(
  "CustomerSession",
  customerSessionSchema
);
