import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { RestaurantRequest } from "../models/restaurantRequestModel.js";
import { Restaurant } from "../models/restaurantModel.js";
import { sendSignupEmail, sendRequestReplyEmail } from "../utils/emailService.js";
import { calculatePrice, getPlanName } from "../utils/pricing.js";
import { createOrder, verifyPayment } from "../utils/razorpay.js";
import crypto from "crypto";

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

  if (req.io) {
    req.io.emit("newRestaurantRequest", createdRequest);
  }

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

  const request = await RestaurantRequest.findById(id);
  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  const updateData = { status };
  if (adminNotes) {
    updateData.adminNotes = adminNotes;
  }

  if (status === "approved") {
    updateData.approvedAt = new Date();

    const signupToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 48); 
    
    updateData.signupToken = signupToken;
    updateData.tokenExpiry = tokenExpiry;

    try {
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      const signupLink = `${frontendUrl}/complete-signup?token=${signupToken}`;
      
      await sendSignupEmail(request.email, request.restaurantName, signupLink);
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
    }
  } else if (status === "rejected") {
    updateData.rejectedAt = new Date();
    updateData.signupToken = undefined;
    updateData.tokenExpiry = undefined;
  }

  const updatedRequest = await RestaurantRequest.findByIdAndUpdate(id, updateData, {
    new: true,
  });

  if (req.io) {
    req.io.emit("requestStatusUpdated", updatedRequest);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedRequest, "Request status updated successfully"));
});

const deleteRestaurantRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const request = await RestaurantRequest.findByIdAndDelete(id);

  if (!request) {
    throw new ApiError(404, "Request not found");
  }
  
  if (req.io) {
    req.io.emit("requestDeleted", { id });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Request deleted successfully"));
});

const sendRestaurantRequestReply = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!message || !message.trim()) {
    throw new ApiError(400, "Reply message is required");
  }

  const request = await RestaurantRequest.findById(id);

  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  await sendRequestReplyEmail(request.email, request.restaurantName, message);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Reply email sent successfully"));
});

const verifySignupToken = asyncHandler(async (req, res) => {
  const { token } = req.params;

  if (!token) {
    throw new ApiError(400, "Token is required");
  }

  const request = await RestaurantRequest.findOne({ signupToken: token });

  if (!request) {
    throw new ApiError(404, "Invalid or expired token");
  }

  if (new Date() > request.tokenExpiry) {
    throw new ApiError(400, "Token has expired. Please request a new approval.");
  }

  if (request.status === "completed") {
    throw new ApiError(400, "This signup link has already been used");
  }

  if (request.status !== "approved") {
    throw new ApiError(400, "Request is not approved");
  }

  return res.status(200).json(
    new ApiResponse(200, {
      restaurantName: request.restaurantName,
      ownerName: request.ownerName,
      email: request.email,
      phone: request.phone,
    }, "Token is valid")
  );
});

const createPaymentOrder = asyncHandler(async (req, res) => {
  const { token, locations } = req.body;

  if (!token) {
    throw new ApiError(400, "Token is required");
  }

  if (!locations || !Array.isArray(locations) || locations.length === 0) {
    throw new ApiError(400, "At least one location is required");
  }

  const totalTables = locations.reduce((sum, loc) => {
    return sum + (parseInt(loc.totalTables) || 0);
  }, 0);

  if (totalTables === 0) {
    throw new ApiError(400, "Total tables must be greater than 0");
  }

  const pricing = calculatePrice(totalTables);
  const plan = getPlanName(totalTables);

  const receipt = `restro_${Date.now()}_${token.substring(0, 8)}`;
  const order = await createOrder(pricing.monthlyPrice, "INR", receipt);

  return res.status(200).json(
    new ApiResponse(200, {
      orderId: order.id,
      amount: pricing.monthlyPrice,
      currency: "INR",
      pricing,
      plan,
      totalTables,
    }, "Payment order created successfully")
  );
});

const completeSignup = asyncHandler(async (req, res) => {
  const { 
    token, 
    password, 
    locations, 
    gstNumber,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  } = req.body;

  if (!token || !password) {
    throw new ApiError(400, "Token and password are required");
  }

  if (!locations || !Array.isArray(locations) || locations.length === 0) {
    throw new ApiError(400, "At least one location is required");
  }

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, "Payment verification required");
  }

  const isPaymentValid = verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  if (!isPaymentValid) {
    throw new ApiError(400, "Invalid payment signature");
  }

  const request = await RestaurantRequest.findOne({ signupToken: token });

  if (!request) {
    throw new ApiError(404, "Invalid or expired token");
  }

  if (new Date() > request.tokenExpiry) {
    throw new ApiError(400, "Token has expired. Please contact support.");
  }

  if (request.status === "completed") {
    throw new ApiError(400, "This signup link has already been used");
  }

  if (request.status !== "approved") {
    throw new ApiError(400, "Request is not approved");
  }

  const existingRestaurant = await Restaurant.findOne({ email: request.email });
  if (existingRestaurant) {
    throw new ApiError(400, "Restaurant with this email already exists");
  }

  const totalTables = locations.reduce((sum, loc) => {
    return sum + (parseInt(loc.totalTables) || 0);
  }, 0);

  const pricing = calculatePrice(totalTables);
  const plan = getPlanName(totalTables);

  const locationsData = locations.map((loc) => ({
    locationName: loc.locationName || "Main Location",
    address: loc.address,
    city: loc.city,
    state: loc.state || "State",
    zipCode: loc.zipCode || "00000",
    country: loc.country || "India",
    phone: loc.phone || request.phone,
    totalTables: parseInt(loc.totalTables) || 0,
    isActive: true,
  }));

  const restaurantData = {
    restaurantName: request.restaurantName,
    ownerName: request.ownerName,
    email: request.email,
    phone: request.phone,
    password: password,
    locations: locationsData,
    status: "APPROVED",
    approvedByAdmin: true,
    approvedAt: new Date(),
    subscription: {
      plan: plan,
      pricePerMonth: pricing.monthlyPrice,
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      isActive: true,
    },
    ...(gstNumber && { gstNumber }),
  };

  const restaurant = await Restaurant.create(restaurantData);

  await RestaurantRequest.findByIdAndUpdate(request._id, {
    status: "completed",
    completedAt: new Date(),
  });

  const createdRestaurant = await Restaurant.findById(restaurant._id).select(
    "-password -refreshToken"
  );

  return res.status(201).json(
    new ApiResponse(201, createdRestaurant, "Restaurant account created successfully")
  );
});

export {
  submitRestaurantRequest,
  getAllRestaurantRequests,
  getRestaurantRequestById,
  updateRequestStatus,
  deleteRestaurantRequest,
  sendRestaurantRequestReply,
  verifySignupToken,
  createPaymentOrder,
  completeSignup,
};

