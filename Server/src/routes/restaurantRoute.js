import { Router } from "express"
import {
  restaurantLogin,
  restaurantLogout,
  getCurrentRestaurant,
  refreshRestaurantToken,
  forgotPassword,
  resetPassword,
  verifyOTP,
  createLocationPaymentOrder,
  verifyLocationPaymentAndAdd,
  updateRestaurantProfile,
  updateLocation,
  generateLocationQRCodes,
  regenerateTableQRCode,
  getMySubscription,
  renewMySubscription,
  getMyInvoices,
  getLocationOrders,
  updateOrderStatus,
} from "../controllers/restaurantController.js"
import {
  getMenu,
  addCategory,
  updateCategory,
  deleteCategory,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getLocationMenu,
  hideItemFromLocation,
  showItemInLocation,
  addLocationMenuItem,
  updateLocationMenuItem,
  deleteLocationMenuItem,
  getPublicMenu,
} from "../controllers/menuController.js"
import { verifyRestaurantJWT } from "../middlewares/authMiddleware.js"

const router = Router()

router.post("/login", restaurantLogin)
router.post("/refresh-token", refreshRestaurantToken)
router.post("/forgot-password", forgotPassword)
router.post("/verify-otp", verifyOTP)
router.post("/reset-password", resetPassword)
router.post("/logout", verifyRestaurantJWT, restaurantLogout)
router.get("/me", verifyRestaurantJWT, getCurrentRestaurant)
router.patch("/me", verifyRestaurantJWT, updateRestaurantProfile)
router.post("/locations/create-payment-order", verifyRestaurantJWT, createLocationPaymentOrder)
router.post("/locations/verify-payment", verifyRestaurantJWT, verifyLocationPaymentAndAdd)
router.patch("/locations/:locationId", verifyRestaurantJWT, updateLocation)
router.get("/locations/:locationId/orders", verifyRestaurantJWT, getLocationOrders)
router.patch("/locations/:locationId/orders/:orderId/status", verifyRestaurantJWT, updateOrderStatus)
router.post("/locations/:locationId/generate-qr", verifyRestaurantJWT, generateLocationQRCodes)
router.post("/locations/:locationId/qr/:tableNumber/regenerate", verifyRestaurantJWT, regenerateTableQRCode)
router.get("/subscription", verifyRestaurantJWT, getMySubscription)
router.post("/subscription/renew", verifyRestaurantJWT, renewMySubscription)
router.get("/invoices", verifyRestaurantJWT, getMyInvoices)

router.get("/public/menu/:restaurantId/:locationId", getPublicMenu)

router.get("/menu", verifyRestaurantJWT, getMenu)
router.post("/menu/categories", verifyRestaurantJWT, addCategory)
router.patch("/menu/categories/:categoryId", verifyRestaurantJWT, updateCategory)
router.delete("/menu/categories/:categoryId", verifyRestaurantJWT, deleteCategory)
router.post("/menu/items", verifyRestaurantJWT, addMenuItem)
router.patch("/menu/items/:itemId", verifyRestaurantJWT, updateMenuItem)
router.delete("/menu/items/:itemId", verifyRestaurantJWT, deleteMenuItem)
router.get("/menu/locations/:locationId", verifyRestaurantJWT, getLocationMenu)
router.post("/menu/locations/:locationId/hide-item", verifyRestaurantJWT, hideItemFromLocation)
router.post("/menu/locations/:locationId/show-item", verifyRestaurantJWT, showItemInLocation)
router.post("/menu/locations/:locationId/items", verifyRestaurantJWT, addLocationMenuItem)
router.patch("/menu/locations/:locationId/items/:itemId", verifyRestaurantJWT, updateLocationMenuItem)
router.delete("/menu/locations/:locationId/items/:itemId", verifyRestaurantJWT, deleteLocationMenuItem)

export default router
