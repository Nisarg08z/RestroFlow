import mongoose, { Schema } from "mongoose"

const invoiceSchema = new Schema(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["EXTRA_TABLE", "RENEWAL", "EXTENSION", "MONTHLY"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    tablesAdded: {
      type: Number,
      default: 0,
    },

    monthsAdded: {
      type: Number,
      default: 0,
    },

    proratedDays: {
      type: Number,
      default: 0,
    },

    description: {
      type: String,
      trim: true,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    paymentLink: {
      type: String,
      unique: true,
      sparse: true,
    },

    paymentLinkToken: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    razorpayOrderId: {
      type: String,
    },

    razorpayPaymentId: {
      type: String,
    },

    status: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },

    paidAt: {
      type: Date,
    },

    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
)

invoiceSchema.index({ restaurantId: 1, status: 1 })

export const Invoice = mongoose.model("Invoice", invoiceSchema)
