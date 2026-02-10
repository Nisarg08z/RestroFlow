import mongoose, { Schema } from "mongoose";

const orderItemSchema = new Schema(
  {
    itemId: {
      type: Schema.Types.ObjectId,
      ref: "Menu",
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    specialInstructions: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const customerOrderSchema = new Schema(
  {
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
    customerPhone: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    items: [orderItemSchema],
    status: {
      type: String,
      enum: ["PENDING", "SUBMITTED", "PREPARING", "SERVED", "CANCELLED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

customerOrderSchema.index({
  restaurantId: 1,
  locationId: 1,
  tableNumber: 1,
  customerPhone: 1,
});

export const CustomerOrder = mongoose.model(
  "CustomerOrder",
  customerOrderSchema
);
