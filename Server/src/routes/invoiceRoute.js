import { Router } from "express"
import {
  getInvoiceByPaymentToken,
  createInvoicePaymentOrder,
  verifyInvoicePayment,
  getAllInvoices,
  getInvoiceById,
} from "../controllers/invoiceController.js"
import { verifyAdminJWT } from "../middlewares/authMiddleware.js"

const router = Router()

router.get("/payment/:token", getInvoiceByPaymentToken)

router.post("/payment/create-order", createInvoicePaymentOrder)

router.post("/payment/verify", verifyInvoicePayment)

router.use(verifyAdminJWT)
router.get("/", getAllInvoices)
router.get("/:invoiceId", getInvoiceById)

export default router
