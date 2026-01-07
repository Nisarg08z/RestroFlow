import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { RestaurantRequest } from "../models/restaurantRequestModel.js";

const submitRestaurantRequest = asyncHandler(async (req, res) => {
  const { restaurantName, ownerName, email, phone, message } = req.body;

  if (!restaurantName || !ownerName || !email || !phone || !message) {
    throw new ApiError(400, "All required fields must be provided");
  }

  const request = await RestaurantRequest.create({
    restaurantName,
    ownerName,
    email,
    phone,
    message,
  });

  const createdRequest = await RestaurantRequest.findById(request._id);

  req.io.emit("newRestaurantRequest", createdRequest);

  return res
    .status(201)
    .json(
      new ApiResponse(201, createdRequest, "Request submitted successfully")
    );
});

const getAllRestaurantRequests = asyncHandler(async (req, res) => {
  const { status, search } = req.query;

  const filter = {};
  if (status && status !== "all") {
    filter.status = status;
  }

  if (search) {
    filter.$or = [
      { restaurantName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { ownerName: { $regex: search, $options: "i" } },
    ];
  }

  const requests = await RestaurantRequest.find(filter)
    .sort({ createdAt: -1 })
    .select("-__v");

  return res
    .status(200)
    .json(
      new ApiResponse(200, requests, "Restaurant requests fetched successfully")
    );
});

const getRestaurantRequestById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const request = await RestaurantRequest.findById(id);

  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, request, "Request fetched successfully"));
});

const updateRequestStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;

  if (!["pending", "approved", "rejected"].includes(status)) {
    throw new ApiError(400, "Invalid status");
  }

  const updateData = { status };
  if (adminNotes) {
    updateData.adminNotes = adminNotes;
  }

  if (status === "approved") {
    updateData.approvedAt = new Date();
  } else if (status === "rejected") {
    updateData.rejectedAt = new Date();
  }

  const request = await RestaurantRequest.findByIdAndUpdate(id, updateData, {
    new: true,
  });

  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  req.io.emit("requestStatusUpdated", request);

  return res
    .status(200)
    .json(new ApiResponse(200, request, "Request status updated successfully"));
});

const deleteRestaurantRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const request = await RestaurantRequest.findByIdAndDelete(id);

  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  req.io.emit("requestDeleted", { id });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Request deleted successfully"));
});

export {
  submitRestaurantRequest,
  getAllRestaurantRequests,
  getRestaurantRequestById,
  updateRequestStatus,
  deleteRestaurantRequest,
};

