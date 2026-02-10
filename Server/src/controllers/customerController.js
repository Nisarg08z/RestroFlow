import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { CustomerSession } from "../models/customerSessionModel.js";
import { CustomerOrder } from "../models/customerOrderModel.js";
import { sendSMSOTP } from "../utils/smsService.js";
import crypto from "crypto";

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const normalizePhone = (phone) => {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("91") ? digits : `91${digits}`;
};

export const sendOTP = asyncHandler(async (req, res) => {
  const { phone, name, restaurantId, locationId, tableNumber } = req.body;

  if (!phone || !name || !restaurantId || !locationId || !tableNumber) {
    throw new ApiError(
      400,
      "Phone, name, restaurantId, locationId, and tableNumber are required"
    );
  }

  const normalizedPhone = normalizePhone(phone);
  if (normalizedPhone.length < 10) {
    throw new ApiError(400, "Invalid phone number");
  }

  const otp = generateOTP();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  let session = await CustomerSession.findOne({
    phone: normalizedPhone,
    restaurantId,
    locationId,
    tableNumber,
  });

  if (session) {
    session.otp = otp;
    session.otpExpiresAt = otpExpiresAt;
    session.name = name.trim();
    session.isVerified = false;
    session.verifiedAt = null;
    await session.save();
  } else {
    session = await CustomerSession.create({
      phone: normalizedPhone,
      name: name.trim(),
      restaurantId,
      locationId,
      tableNumber,
      otp,
      otpExpiresAt,
    });
  }

  await sendSMSOTP(normalizedPhone, otp);

  return res.status(200).json(
    new ApiResponse(
      200,
      { phone: normalizedPhone },
      "OTP sent successfully to your phone"
    )
  );
});

export const verifyOTP = asyncHandler(async (req, res) => {
  const { phone, otp, restaurantId, locationId, tableNumber } = req.body;

  if (!phone || !otp || !restaurantId || !locationId || !tableNumber) {
    throw new ApiError(
      400,
      "Phone, OTP, restaurantId, locationId, and tableNumber are required"
    );
  }

  const normalizedPhone = normalizePhone(phone);

  const session = await CustomerSession.findOne({
    phone: normalizedPhone,
    restaurantId,
    locationId,
    tableNumber,
  });

  if (!session) {
    throw new ApiError(404, "Session not found. Please request a new OTP.");
  }

  if (session.isVerified) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          phone: session.phone,
          name: session.name,
        },
        "Already verified"
      )
    );
  }

  if (!session.otp || session.otpExpiresAt < new Date()) {
    throw new ApiError(400, "OTP expired. Please request a new one.");
  }

  if (session.otp !== otp.trim()) {
    throw new ApiError(400, "Invalid OTP. Please try again.");
  }

  session.isVerified = true;
  session.verifiedAt = new Date();
  session.otp = null;
  session.otpExpiresAt = null;
  await session.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        phone: session.phone,
        name: session.name,
      },
      "Phone verified successfully"
    )
  );
});

export const getOrders = asyncHandler(async (req, res) => {
  const { restaurantId, locationId, tableNumber, phone } = req.query;

  if (!restaurantId || !locationId || !tableNumber || !phone) {
    throw new ApiError(
      400,
      "restaurantId, locationId, tableNumber, and phone are required"
    );
  }

  const normalizedPhone = normalizePhone(phone);

  const session = await CustomerSession.findOne({
    phone: normalizedPhone,
    restaurantId,
    locationId,
    tableNumber,
    isVerified: true,
  });

  if (!session) {
    return res
      .status(200)
      .json(new ApiResponse(200, { orders: [], customerName: null }, "OK"));
  }

  const orders = await CustomerOrder.find({
    restaurantId,
    locationId,
    tableNumber,
    customerPhone: normalizedPhone,
  })
    .sort({ createdAt: -1 })
    .lean();

  return res.status(200).json(
    new ApiResponse(
      200,
      { orders, customerName: session.name },
      "Orders fetched"
    )
  );
});

export const addToOrder = asyncHandler(async (req, res) => {
  const { restaurantId, locationId, tableNumber, phone, name, items } =
    req.body;

  if (
    !restaurantId ||
    !locationId ||
    !tableNumber ||
    !phone ||
    !name ||
    !items ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    throw new ApiError(
      400,
      "restaurantId, locationId, tableNumber, phone, name, and items (non-empty array) are required"
    );
  }

  const normalizedPhone = normalizePhone(phone);

  const session = await CustomerSession.findOne({
    phone: normalizedPhone,
    restaurantId,
    locationId,
    tableNumber,
    isVerified: true,
  });

  if (!session) {
    throw new ApiError(403, "Please verify your phone number first.");
  }

  let order = await CustomerOrder.findOne({
    restaurantId,
    locationId,
    tableNumber,
    customerPhone: normalizedPhone,
    status: "PENDING",
  });

  const normalizedItems = items.map((i) => ({
    itemId: i.itemId,
    name: i.name,
    price: Number(i.price),
    quantity: Number(i.quantity) || 1,
    specialInstructions: (i.specialInstructions || "").trim(),
  }));

  if (!order) {
    order = await CustomerOrder.create({
      restaurantId,
      locationId,
      tableNumber,
      customerPhone: normalizedPhone,
      customerName: name,
      items: normalizedItems,
    });
  } else {
    for (const item of normalizedItems) {
      const existing = order.items.find(
        (x) =>
          x.itemId?.toString() === item.itemId?.toString() &&
          (x.specialInstructions || "") === (item.specialInstructions || "")
      );
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        order.items.push(item);
      }
    }
    await order.save();
  }

  const updated = await CustomerOrder.findById(order._id).lean();

  return res.status(200).json(
    new ApiResponse(200, { order: updated }, "Items added to order")
  );
});

export const submitOrder = asyncHandler(async (req, res) => {
  const { orderId, phone, restaurantId, locationId, tableNumber } = req.body;

  if (!orderId || !phone || !restaurantId || !locationId || !tableNumber) {
    throw new ApiError(
      400,
      "orderId, phone, restaurantId, locationId, and tableNumber are required"
    );
  }

  const normalizedPhone = normalizePhone(phone);

  const order = await CustomerOrder.findOne({
    _id: orderId,
    restaurantId,
    locationId,
    tableNumber,
    customerPhone: normalizedPhone,
    status: "PENDING",
  });

  if (!order) {
    throw new ApiError(404, "Order not found or already submitted.");
  }

  if (!order.items || order.items.length === 0) {
    throw new ApiError(400, "Cannot submit an empty order.");
  }

  order.status = "SUBMITTED";
  await order.save();

  const updated = await CustomerOrder.findById(order._id).lean();

  return res.status(200).json(
    new ApiResponse(200, { order: updated }, "Order sent to kitchen!")
  );
});
