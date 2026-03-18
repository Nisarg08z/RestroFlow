import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Restaurant } from "../models/restaurantModel.js";
import { Staff } from "../models/staffModel.js";
import cron from "node-cron";

const assertLocationOwnedByRestaurant = async (restaurantId, locationId) => {
  const restaurant = await Restaurant.findById(restaurantId).select("_id locations._id").lean();
  if (!restaurant) throw new ApiError(404, "Restaurant not found");
  const exists = (restaurant.locations || []).some(
    (loc) => String(loc._id) === String(locationId)
  );
  if (!exists) throw new ApiError(404, "Location not found");
};

export const listStaffByLocation = asyncHandler(async (req, res) => {
  const { locationId } = req.params;
  await assertLocationOwnedByRestaurant(req.user._id, locationId);

  const items = await Staff.find({
    restaurantId: req.user._id,
    locationId,
  })
    .sort({ createdAt: -1 })
    .lean();

  return res.status(200).json(new ApiResponse(200, items, "Staff fetched"));
});

export const getStaffById = asyncHandler(async (req, res) => {
  const { locationId, staffId } = req.params;
  await assertLocationOwnedByRestaurant(req.user._id, locationId);

  const staff = await Staff.findOne({
    _id: staffId,
    restaurantId: req.user._id,
    locationId,
  }).lean();

  if (!staff) throw new ApiError(404, "Staff not found");
  return res.status(200).json(new ApiResponse(200, staff, "Staff fetched"));
});

export const createStaff = asyncHandler(async (req, res) => {
  const { locationId } = req.params;
  await assertLocationOwnedByRestaurant(req.user._id, locationId);

  const { name, role, email, phone, notes } = req.body || {};
  if (!name || !String(name).trim()) throw new ApiError(400, "Name is required");

  const doc = await Staff.create({
    restaurantId: req.user._id,
    locationId,
    name: String(name).trim(),
    role: role ? String(role).trim() : "Waiter",
    email: email ? String(email).trim().toLowerCase() : "",
    phone: phone ? String(phone).trim() : "",
    notes: notes ? String(notes).trim() : "",
  });

  return res.status(201).json(new ApiResponse(201, doc, "Staff created"));
});

export const updateStaff = asyncHandler(async (req, res) => {
  const { locationId, staffId } = req.params;
  await assertLocationOwnedByRestaurant(req.user._id, locationId);

  const updates = {};
  const { name, role, email, phone, notes, attendanceStatus } = req.body || {};

  if (name !== undefined) {
    if (!String(name).trim()) throw new ApiError(400, "Name cannot be empty");
    updates.name = String(name).trim();
  }
  if (role !== undefined) updates.role = String(role).trim();
  if (email !== undefined) updates.email = String(email).trim().toLowerCase();
  if (phone !== undefined) updates.phone = String(phone).trim();
  if (notes !== undefined) updates.notes = String(notes).trim();

  if (attendanceStatus !== undefined) {
    const allowed = ["PRESENT", "ABSENT", "HALF_DAY"];
    if (attendanceStatus === null || attendanceStatus === "") {
      updates.attendanceStatus = null;
      updates.lastAttendanceAt = null;
    } else if (allowed.includes(attendanceStatus)) {
      updates.attendanceStatus = attendanceStatus;
      updates.lastAttendanceAt = new Date();
    } else {
      throw new ApiError(400, "Invalid attendance status");
    }
  }

  const doc = await Staff.findOneAndUpdate(
    { _id: staffId, restaurantId: req.user._id, locationId },
    { $set: updates },
    { new: true }
  ).lean();

  if (!doc) throw new ApiError(404, "Staff not found");
  return res.status(200).json(new ApiResponse(200, doc, "Staff updated"));
});

export const deleteStaff = asyncHandler(async (req, res) => {
  const { locationId, staffId } = req.params;
  await assertLocationOwnedByRestaurant(req.user._id, locationId);

  if (!mongoose.Types.ObjectId.isValid(staffId)) throw new ApiError(400, "Invalid staff id");

  const deleted = await Staff.findOneAndDelete({
    _id: staffId,
    restaurantId: req.user._id,
    locationId,
  }).lean();

  if (!deleted) throw new ApiError(404, "Staff not found");
  return res.status(200).json(new ApiResponse(200, { id: deleted._id }, "Staff deleted"));
});

// Daily reset: mark all staff attendance as "not marked" (null) at 4 AM server time
cron.schedule("0 4 * * *", async () => {
  try {
    await Staff.updateMany(
      { attendanceStatus: { $ne: null } },
      { $set: { attendanceStatus: null, lastAttendanceAt: null } }
    );
    // Optionally log to console; avoid throwing errors from here
    console.log("[Staff] Daily attendance reset completed at 4 AM");
  } catch (err) {
    console.error("[Staff] Failed to reset daily attendance", err);
  }
});

