import crypto from "crypto"
import { Invoice } from "../models/invoiceModel.js"
import { calculatePrice } from "./pricing.js"

const PRICE_PER_TABLE = 50

export const calculateProratedAmount = (extraTables, currentDate, monthEndDate) => {
  
  const now = new Date(currentDate)
  const endDate = new Date(monthEndDate)
  
  const remainingDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (remainingDays <= 0) {
    return extraTables * PRICE_PER_TABLE
  }
  
  const monthStart = new Date(endDate.getFullYear(), endDate.getMonth(), 1)
  
  const totalDaysInMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0).getDate()
  
  if (remainingDays > totalDaysInMonth) {
    return extraTables * PRICE_PER_TABLE
  }
  
  const monthlyPrice = extraTables * PRICE_PER_TABLE
  const proratedAmount = (monthlyPrice * remainingDays) / totalDaysInMonth
  
  const finalAmount = Math.max(1, Math.round(proratedAmount * 100) / 100)
  
  return finalAmount
}

export const generatePaymentToken = () => {
  return crypto.randomBytes(32).toString("hex")
}

export const createExtraTableInvoice = async (restaurantId, extraTables, currentDate, monthEndDate, newTotalTables = null) => {
  const proratedAmount = calculateProratedAmount(extraTables, currentDate, monthEndDate)
  const token = generatePaymentToken()
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173"
  const paymentLink = `${frontendUrl}/payment?token=${token}`

  const invoice = await Invoice.create({
    restaurantId,
    type: "EXTRA_TABLE",
    amount: proratedAmount,
    tablesAdded: extraTables,
    proratedDays: Math.ceil((monthEndDate - currentDate) / (1000 * 60 * 60 * 24)),
    description: `Prorated payment for ${extraTables} extra table(s)`,
    dueDate: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000),
    paymentLink,
    paymentLinkToken: token,
    status: "PENDING",
    metadata: {
      newTotalTables: newTotalTables,
    },
  })

  return invoice
}

export const createRenewalInvoice = async (restaurantId, totalTables, months = 1) => {
  const pricing = calculatePrice(totalTables)
  const amount = pricing.monthlyPrice * months
  const token = generatePaymentToken()
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173"
  const paymentLink = `${frontendUrl}/payment?token=${token}`

  const invoice = await Invoice.create({
    restaurantId,
    type: "RENEWAL",
    amount,
    monthsAdded: months,
    description: `Renewal for ${months} month(s) - ${totalTables} tables`,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    paymentLink,
    paymentLinkToken: token,
    status: "PENDING",
  })

  return invoice
}

export const createExtensionInvoice = async (restaurantId, totalTables, months) => {
  const pricing = calculatePrice(totalTables)
  const amount = pricing.monthlyPrice * months
  const token = generatePaymentToken()
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173"
  const paymentLink = `${frontendUrl}/payment?token=${token}`

  const invoice = await Invoice.create({
    restaurantId,
    type: "EXTENSION",
    amount,
    monthsAdded: months,
    description: `Extension for ${months} month(s) - ${totalTables} tables`,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    paymentLink,
    paymentLinkToken: token,
    status: "PENDING",
  })

  return invoice
}

export const getInvoiceByToken = async (token) => {
  return await Invoice.findOne({ paymentLinkToken: token }).populate("restaurantId", "restaurantName email")
}
