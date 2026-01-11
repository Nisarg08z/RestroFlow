import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Invoice } from "../models/invoiceModel.js"
import { getInvoiceByToken } from "../utils/invoiceUtils.js"
import { createOrder, verifyPayment } from "../utils/razorpay.js"

const getInvoiceByPaymentToken = asyncHandler(async (req, res) => {
  const { token } = req.params

  if (!token) {
    throw new ApiError(400, "Payment token is required")
  }

  const invoice = await getInvoiceByToken(token)

  if (!invoice) {
    throw new ApiError(404, "Invoice not found or invalid token")
  }

  if (invoice.status === "PAID") {
    throw new ApiError(400, "This invoice has already been paid")
  }

  if (invoice.status === "CANCELLED") {
    throw new ApiError(400, "This invoice has been cancelled")
  }

  return res.status(200).json(
    new ApiResponse(200, invoice, "Invoice fetched successfully")
  )
})

const createInvoicePaymentOrder = asyncHandler(async (req, res) => {
  const { token } = req.body

  if (!token) {
    throw new ApiError(400, "Payment token is required")
  }

  const invoice = await getInvoiceByToken(token)

  if (!invoice) {
    throw new ApiError(404, "Invoice not found")
  }

  if (invoice.status === "PAID") {
    throw new ApiError(400, "Invoice already paid")
  }

  const invoiceIdStr = invoice._id.toString()
  const shortId = invoiceIdStr.substring(0, 12)
  const timestamp = Date.now().toString().slice(-6)
  const receipt = `inv_${shortId}_${timestamp}`.substring(0, 40)
  const order = await createOrder(invoice.amount, "INR", receipt)

  invoice.razorpayOrderId = order.id
  await invoice.save()

  return res.status(200).json(
    new ApiResponse(200, {
      orderId: order.id,
      amount: invoice.amount,
      currency: "INR",
      invoiceId: invoice._id,
    }, "Payment order created successfully")
  )
})

const verifyInvoicePayment = asyncHandler(async (req, res) => {
  const { token, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

  if (!token || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, "All payment details are required")
  }

  const invoice = await Invoice.findOne({ paymentLinkToken: token }).populate("restaurantId")

  if (!invoice) {
    throw new ApiError(404, "Invoice not found")
  }

  if (invoice.status === "PAID") {
    throw new ApiError(400, "Invoice already paid")
  }

  const isPaymentValid = verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature)

  if (!isPaymentValid) {
    invoice.status = "FAILED"
    await invoice.save()
    throw new ApiError(400, "Invalid payment signature")
  }

  invoice.status = "PAID"
  invoice.razorpayPaymentId = razorpay_payment_id
  invoice.paidAt = new Date()
  await invoice.save()

  const restaurant = invoice.restaurantId
  const sub = restaurant.subscription

  if (invoice.type === "EXTRA_TABLE") {
    const newTotalTables = invoice.metadata?.newTotalTables || (restaurant.locations?.reduce((sum, loc) => {
      return sum + (loc.totalTables || 0)
    }, 0) || 0) + invoice.tablesAdded
    
    const { calculatePrice } = await import("../utils/pricing.js")
    const pricing = calculatePrice(newTotalTables)
    sub.pricePerMonth = pricing.monthlyPrice
  } else if (invoice.type === "RENEWAL") {
    const now = new Date()
    const currentEndDate = sub.endDate ? new Date(sub.endDate) : now
    const newEndDate = new Date(currentEndDate)
    newEndDate.setMonth(newEndDate.getMonth() + invoice.monthsAdded)
    
    sub.endDate = newEndDate
    sub.isActive = true
    if (!sub.startDate) {
      sub.startDate = now
    }
  } else if (invoice.type === "EXTENSION") {
    const currentEndDate = sub.endDate ? new Date(sub.endDate) : new Date()
    const newEndDate = new Date(currentEndDate)
    newEndDate.setMonth(newEndDate.getMonth() + invoice.monthsAdded)
    
    sub.endDate = newEndDate
    sub.isActive = true
  }

  await restaurant.save()

  return res.status(200).json(
    new ApiResponse(200, {
      invoice,
      subscription: sub,
    }, "Payment verified and subscription updated successfully")
  )
})

const getAllInvoices = asyncHandler(async (req, res) => {
  const { restaurantId, status, type } = req.query

  const query = {}
  if (restaurantId) {
    query.restaurantId = restaurantId
  }
  if (status) {
    query.status = status.toUpperCase()
  }
  if (type) {
    query.type = type.toUpperCase()
  }

  const invoices = await Invoice.find(query)
    .populate("restaurantId", "restaurantName email")
    .sort({ createdAt: -1 })

  return res.status(200).json(
    new ApiResponse(200, invoices, "Invoices fetched successfully")
  )
})

const getInvoiceById = asyncHandler(async (req, res) => {
  const { invoiceId } = req.params

  const invoice = await Invoice.findById(invoiceId).populate("restaurantId", "restaurantName email")

  if (!invoice) {
    throw new ApiError(404, "Invoice not found")
  }

  return res.status(200).json(
    new ApiResponse(200, invoice, "Invoice fetched successfully")
  )
})

export {
  getInvoiceByPaymentToken,
  createInvoicePaymentOrder,
  verifyInvoicePayment,
  getAllInvoices,
  getInvoiceById,
}
