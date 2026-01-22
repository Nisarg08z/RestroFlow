import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Restaurant } from "../models/restaurantModel.js"
import { calculatePrice } from "../utils/pricing.js"
import {
  createExtraTableInvoice,
  createRenewalInvoice,
  createExtensionInvoice,
} from "../utils/invoiceUtils.js"
import { sendPaymentLinkEmail } from "../utils/paymentEmails.js"

const getAllSubscriptions = asyncHandler(async (req, res) => {
  const { status, search } = req.query

  const query = {}
  if (status) {
    query["subscription.isActive"] = status === "active"
  }
  if (search) {
    query.$or = [
      { restaurantName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ]
  }

  const restaurants = await Restaurant.find(query)
    .select("-password -refreshToken")
    .sort({ createdAt: -1 })

  const subscriptions = restaurants
    .filter((restaurant) => restaurant.subscription?.pricePerMonth)
    .map((restaurant) => {
      const sub = restaurant.subscription
      const now = new Date()
      const endDate = sub.endDate ? new Date(sub.endDate) : null
      
      const totalTables = restaurant.locations?.reduce((sum, loc) => {
        return sum + (loc.totalTables || 0)
      }, 0) || 0
      
      let status = "expired"
      if (sub.isActive) {
        if (endDate && endDate < now) {
          status = "expired"
        } else if (endDate) {
          const daysUntilExpiry = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))
          if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
            status = "expiring"
          } else if (daysUntilExpiry > 7) {
            status = "active"
          } else {
            status = "expired"
          }
        } else {
          status = "active"
        }
      }

      return {
        id: restaurant._id.toString(),
        restaurantId: restaurant._id.toString(),
        restaurantName: restaurant.restaurantName,
        email: restaurant.email,
        price: sub.pricePerMonth || 0,
        totalTables,
        pricePerTable: 50,
        status,
        startDate: sub.startDate ? sub.startDate.toISOString().split("T")[0] : null,
        endDate: endDate ? endDate.toISOString().split("T")[0] : null,
        autoRenew: sub.isActive || false,
        isActive: sub.isActive || false,
        locations: restaurant.locations?.length || 0,
      }
    })

  return res.status(200).json(
    new ApiResponse(200, subscriptions, "Subscriptions fetched successfully")
  )
})

const getSubscriptionById = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params

  const restaurant = await Restaurant.findById(restaurantId).select(
    "-password -refreshToken"
  )

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found")
  }

  if (!restaurant.subscription?.pricePerMonth) {
    throw new ApiError(404, "Subscription not found")
  }

  const sub = restaurant.subscription
  const now = new Date()
  const endDate = sub.endDate ? new Date(sub.endDate) : null

  let status = "expired"
  if (sub.isActive) {
    if (endDate && endDate < now) {
      status = "expired"
    } else if (endDate) {
      const daysUntilExpiry = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))
      if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
        status = "expiring"
      } else if (daysUntilExpiry > 7) {
        status = "active"
      } else {
        status = "expired"
      }
    } else {
      status = "active"
    }
  }

  const totalTables = restaurant.locations?.reduce((sum, loc) => {
    return sum + (loc.totalTables || 0)
  }, 0) || 0

  const subscription = {
    id: restaurant._id.toString(),
    restaurantId: restaurant._id.toString(),
    restaurantName: restaurant.restaurantName,
    email: restaurant.email,
    price: sub.pricePerMonth || 0,
    totalTables,
    pricePerTable: 50,
    status,
    startDate: sub.startDate ? sub.startDate.toISOString().split("T")[0] : null,
    endDate: endDate ? endDate.toISOString().split("T")[0] : null,
    autoRenew: sub.isActive || false,
    isActive: sub.isActive || false,
    locations: restaurant.locations?.length || 0,
    locationDetails: restaurant.locations?.map((loc) => ({
      _id: loc._id?.toString(),
      locationName: loc.locationName,
      address: loc.address,
      city: loc.city,
      state: loc.state,
      totalTables: loc.totalTables || 0,
      isActive: loc.isActive,
    })) || [],
  }

  return res.status(200).json(
    new ApiResponse(200, subscription, "Subscription fetched successfully")
  )
})

const updateSubscription = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params
  const { endDate, autoRenew, pricePerMonth, totalTables, monthsToAdd, sendPaymentEmail = true, locationUpdates } = req.body

  const restaurant = await Restaurant.findById(restaurantId)

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found")
  }

  if (!restaurant.subscription?.pricePerMonth) {
    throw new ApiError(404, "Subscription not found")
  }

  let invoice = null

  if (locationUpdates && Array.isArray(locationUpdates) && locationUpdates.length > 0) {
    const currentTables = restaurant.locations?.reduce((sum, loc) => {
      return sum + (loc.totalTables || 0)
    }, 0) || 0

    const newTotalTables = locationUpdates.reduce((sum, update) => {
      return sum + (parseInt(update.totalTables) || 0)
    }, 0)

    if (newTotalTables > currentTables) {
      const extraTables = newTotalTables - currentTables
      const now = new Date()
      
      let monthEndDate = restaurant.subscription.endDate
      if (!monthEndDate || new Date(monthEndDate) < now) {
        monthEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        monthEndDate.setHours(23, 59, 59, 999)
      } else {
        monthEndDate = new Date(monthEndDate)
      }

      if (monthEndDate <= now) {
        monthEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        monthEndDate.setHours(23, 59, 59, 999)
      }

      invoice = await createExtraTableInvoice(restaurantId, extraTables, now, monthEndDate, newTotalTables, locationUpdates)
      
      if (invoice.amount <= 0) {
        const fullMonthPrice = extraTables * 50
        invoice.amount = fullMonthPrice
        invoice.description = `Payment for ${extraTables} extra table(s) - full month`
        await invoice.save()
      }

      if (sendPaymentEmail) {
        try {
          await sendPaymentLinkEmail(
            restaurant.email,
            restaurant.restaurantName,
            invoice.paymentLink,
            invoice.amount,
            invoice.description,
            invoice.dueDate
          )
        } catch (error) {
          console.error("Error sending payment email:", error)
        }
      }
    } else if (newTotalTables < currentTables) {
      locationUpdates.forEach((update) => {
        const locationIndex = restaurant.locations?.findIndex(
          (loc) => loc._id?.toString() === update.locationId
        )
        if (locationIndex !== undefined && locationIndex !== -1) {
          restaurant.locations[locationIndex].totalTables = Math.max(0, parseInt(update.totalTables) || 0)
        }
      })
      const pricing = calculatePrice(newTotalTables)
      restaurant.subscription.pricePerMonth = pricing.monthlyPrice
      await restaurant.save()
    }
  } else if (totalTables !== undefined && totalTables !== null) {
    const currentTables = restaurant.locations?.reduce((sum, loc) => {
      return sum + (loc.totalTables || 0)
    }, 0) || 0

    if (totalTables > currentTables) {
      const extraTables = totalTables - currentTables
      const now = new Date()
      
      let monthEndDate = restaurant.subscription.endDate
      if (!monthEndDate || new Date(monthEndDate) < now) {
        monthEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        monthEndDate.setHours(23, 59, 59, 999)
      } else {
        monthEndDate = new Date(monthEndDate)
      }

      if (monthEndDate <= now) {
        monthEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        monthEndDate.setHours(23, 59, 59, 999)
      }

      const locationUpdatesForInvoice = []
      if (restaurant.locations && restaurant.locations.length > 0) {
        restaurant.locations.forEach((loc) => {
          if (loc._id) {
            const currentLocTables = loc.totalTables || 0
            const newLocTables = loc === restaurant.locations[0] 
              ? currentLocTables + extraTables 
              : currentLocTables
            locationUpdatesForInvoice.push({
              locationId: loc._id.toString(),
              totalTables: newLocTables
            })
          }
        })
      } else {
        locationUpdatesForInvoice.push({
          locationId: 'new',
          totalTables: totalTables
        })
      }

      invoice = await createExtraTableInvoice(restaurantId, extraTables, now, monthEndDate, totalTables, locationUpdatesForInvoice)
      
      if (invoice.amount <= 0) {
        const fullMonthPrice = extraTables * 50
        invoice.amount = fullMonthPrice
        invoice.description = `Payment for ${extraTables} extra table(s) - full month`
        await invoice.save()
      }

      if (sendPaymentEmail) {
        try {
          await sendPaymentLinkEmail(
            restaurant.email,
            restaurant.restaurantName,
            invoice.paymentLink,
            invoice.amount,
            invoice.description,
            invoice.dueDate
          )
        } catch (error) {
          console.error("Error sending payment email:", error)
        }
      }

    } else if (totalTables < currentTables) {
      if (restaurant.locations && restaurant.locations.length > 0) {
        const reduction = currentTables - totalTables
        const firstLocation = restaurant.locations[0]
        firstLocation.totalTables = Math.max(0, (firstLocation.totalTables || 0) - reduction)
      }
      const pricing = calculatePrice(totalTables)
      restaurant.subscription.pricePerMonth = pricing.monthlyPrice
      await restaurant.save()
    }
  }

  if (monthsToAdd && monthsToAdd > 0) {
    const currentTables = restaurant.locations?.reduce((sum, loc) => {
      return sum + (loc.totalTables || 0)
    }, 0) || 0

    invoice = await createExtensionInvoice(restaurantId, currentTables, monthsToAdd)

    if (sendPaymentEmail) {
      try {
        await sendPaymentLinkEmail(
          restaurant.email,
          restaurant.restaurantName,
          invoice.paymentLink,
          invoice.amount,
          invoice.description,
          invoice.dueDate
        )
      } catch (error) {
        console.error("Error sending payment email:", error)
      }
    }

  }

  if (endDate && !invoice) {
    restaurant.subscription.endDate = new Date(endDate)
  }

  if (pricePerMonth !== undefined && totalTables === undefined && !invoice) {
    restaurant.subscription.pricePerMonth = pricePerMonth
  }

  if (autoRenew !== undefined) {
    restaurant.subscription.isActive = autoRenew
  }

  await restaurant.save()

  const sub = restaurant.subscription
  const now = new Date()
  const endDateObj = sub.endDate ? new Date(sub.endDate) : null

  let status = "expired"
  if (sub.isActive) {
    if (endDateObj && endDateObj < now) {
      status = "expired"
    } else if (endDateObj) {
      const daysUntilExpiry = Math.ceil((endDateObj - now) / (1000 * 60 * 60 * 24))
      if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
        status = "expiring"
      } else if (daysUntilExpiry > 7) {
        status = "active"
      } else {
        status = "expired"
      }
    } else {
      status = "active"
    }
  }

  const calculatedTotalTables = restaurant.locations?.reduce((sum, loc) => {
    return sum + (loc.totalTables || 0)
  }, 0) || 0

  const subscription = {
    id: restaurant._id.toString(),
    restaurantId: restaurant._id.toString(),
    restaurantName: restaurant.restaurantName,
    email: restaurant.email,
    price: sub.pricePerMonth || 0,
    totalTables: calculatedTotalTables,
    pricePerTable: 50,
    status,
    startDate: sub.startDate ? sub.startDate.toISOString().split("T")[0] : null,
    endDate: endDateObj ? endDateObj.toISOString().split("T")[0] : null,
    autoRenew: sub.isActive || false,
    isActive: sub.isActive || false,
    locations: restaurant.locations?.length || 0,
  }

  const responseData = { subscription }
  if (invoice) {
    responseData.invoice = {
      id: invoice._id,
      amount: invoice.amount,
      paymentLink: invoice.paymentLink,
      description: invoice.description,
      dueDate: invoice.dueDate,
      status: invoice.status,
    }
    if (sendPaymentEmail) {
      responseData.message = "Invoice created. Payment link sent to restaurant email."
    } else {
      responseData.message = "Invoice created. Payment email was not sent (as per your preference)."
    }
  }

  return res.status(200).json(
    new ApiResponse(200, responseData, invoice ? "Invoice created successfully" : "Subscription updated successfully")
  )
})

const renewSubscription = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params
  const { months = 1 } = req.body

  const restaurant = await Restaurant.findById(restaurantId)

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found")
  }

  if (!restaurant.subscription?.pricePerMonth) {
    throw new ApiError(404, "Subscription not found")
  }

  const totalTables = restaurant.locations?.reduce((sum, loc) => {
    return sum + (loc.totalTables || 0)
  }, 0) || 0

  if (totalTables === 0) {
    throw new ApiError(400, "Restaurant has no tables configured")
  }

  const invoice = await createRenewalInvoice(restaurantId, totalTables, months)

  try {
    await sendPaymentLinkEmail(
      restaurant.email,
      restaurant.restaurantName,
      invoice.paymentLink,
      invoice.amount,
      invoice.description,
      invoice.dueDate
    )
  } catch (error) {
    console.error("Error sending renewal email:", error)
  }

  return res.status(200).json(
    new ApiResponse(200, {
      invoice,
      message: "Renewal invoice created. Payment link sent to restaurant email.",
    }, "Renewal invoice created successfully")
  )
})

const cancelSubscription = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params

  const restaurant = await Restaurant.findById(restaurantId)

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found")
  }

  if (!restaurant.subscription?.pricePerMonth) {
    throw new ApiError(404, "Subscription not found")
  }

  restaurant.subscription.isActive = false

  await restaurant.save()

  const sub = restaurant.subscription
  const endDateObj = sub.endDate ? new Date(sub.endDate) : null

  const totalTables = restaurant.locations?.reduce((sum, loc) => {
    return sum + (loc.totalTables || 0)
  }, 0) || 0

  const subscription = {
    id: restaurant._id.toString(),
    restaurantId: restaurant._id.toString(),
    restaurantName: restaurant.restaurantName,
    email: restaurant.email,
    plan: sub.plan?.toLowerCase() || "basic",
    price: sub.pricePerMonth || 0,
    totalTables,
    pricePerTable: 50,
    status: "expired",
    startDate: sub.startDate ? sub.startDate.toISOString().split("T")[0] : null,
    endDate: endDateObj ? endDateObj.toISOString().split("T")[0] : null,
    autoRenew: false,
    isActive: false,
    locations: restaurant.locations?.length || 0,
  }

  return res.status(200).json(
    new ApiResponse(200, subscription, "Subscription cancelled successfully")
  )
})

const getSubscriptionStats = asyncHandler(async (req, res) => {
  const restaurants = await Restaurant.find({
    "subscription.pricePerMonth": { $exists: true, $ne: null },
  }).select("subscription locations")

  const now = new Date()
  let totalMRR = 0
  let activeCount = 0
  let expiringCount = 0
  let expiredCount = 0

  restaurants.forEach((restaurant) => {
    const sub = restaurant.subscription
    if (!sub || !sub.pricePerMonth) return

    const endDate = sub.endDate ? new Date(sub.endDate) : null
    let status = "expired"

    if (sub.isActive) {
      if (endDate && endDate < now) {
        status = "expired"
      } else if (endDate) {
        const daysUntilExpiry = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))
        if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
          status = "expiring"
        } else if (daysUntilExpiry > 7) {
          status = "active"
        } else {
          status = "expired"
        }
      } else {
        status = "active"
      }
    }

    if (status === "active" || status === "expiring") {
      totalMRR += sub.pricePerMonth || 0
    }

    if (status === "active") activeCount++
    else if (status === "expiring") expiringCount++
    else if (status === "expired") expiredCount++
  })

  const stats = {
    totalMRR,
    activeSubscriptions: activeCount,
    expiringSoon: expiringCount,
    expiredCount: expiredCount,
    totalSubscriptions: restaurants.length,
  }

  return res.status(200).json(
    new ApiResponse(200, stats, "Subscription statistics fetched successfully")
  )
})

export {
  getAllSubscriptions,
  getSubscriptionById,
  updateSubscription,
  renewSubscription,
  cancelSubscription,
  getSubscriptionStats,
}
