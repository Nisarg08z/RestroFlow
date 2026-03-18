import mongoose, { Schema } from "mongoose";

const staffSchema = new Schema(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    locationId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      trim: true,
      default: "Waiter",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    attendanceStatus: {
      type: String,
      enum: ["PRESENT", "ABSENT", "HALF_DAY", null],
      default: null,
      index: true,
    },
    lastAttendanceAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

staffSchema.index({ restaurantId: 1, locationId: 1, attendanceStatus: 1 });

export const Staff = mongoose.model("Staff", staffSchema);

