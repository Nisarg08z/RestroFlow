import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Restaurant } from "../models/restaurantModel.js"
import { calculatePrice } from "../utils/pricing.js"

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
      
      let status = "cancelled"
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

  let status = "cancelled"
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
  }

  return res.status(200).json(
    new ApiResponse(200, subscription, "Subscription fetched successfully")
  )
})

const updateSubscription = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params
  const { endDate, autoRenew, pricePerMonth, totalTables } = req.body

  const restaurant = await Restaurant.findById(restaurantId)

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found")
  }

  if (!restaurant.subscription?.pricePerMonth) {
    throw new ApiError(404, "Subscription not found")
  }

 
  if (totalTables !== undefined && totalTables !== null) {
    const pricing = calculatePrice(totalTables)
    restaurant.subscription.pricePerMonth = pricing.monthlyPrice
  }

  if (endDate) {
    restaurant.subscription.endDate = new Date(endDate)
  }
  if (pricePerMonth !== undefined && totalTables === undefined) {
    restaurant.subscription.pricePerMonth = pricePerMonth
  }
  if (autoRenew !== undefined) {
    restaurant.subscription.isActive = autoRenew
  }

  await restaurant.save()

  const sub = restaurant.subscription
  const now = new Date()
  const endDateObj = sub.endDate ? new Date(sub.endDate) : null

  let status = "cancelled"
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

  return res.status(200).json(
    new ApiResponse(200, subscription, "Subscription updated successfully")
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

  const now = new Date()
  const currentEndDate = restaurant.subscription.endDate
    ? new Date(restaurant.subscription.endDate)
    : now

  const newEndDate = new Date(currentEndDate)
  newEndDate.setMonth(newEndDate.getMonth() + months)

  restaurant.subscription.endDate = newEndDate
  restaurant.subscription.isActive = true
  restaurant.subscription.startDate = restaurant.subscription.startDate || now

  await restaurant.save()

  const sub = restaurant.subscription
  const endDateObj = sub.endDate ? new Date(sub.endDate) : null

  let status = "active"
  if (endDateObj) {
    const daysUntilExpiry = Math.ceil((endDateObj - now) / (1000 * 60 * 60 * 24))
    if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
      status = "expiring"
    } else if (daysUntilExpiry <= 0) {
      status = "expired"
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
    plan: sub.plan?.toLowerCase() || "basic",
    price: sub.pricePerMonth || 0,
    totalTables,
    pricePerTable: 50,
    status,
    startDate: sub.startDate ? sub.startDate.toISOString().split("T")[0] : null,
    endDate: endDateObj ? endDateObj.toISOString().split("T")[0] : null,
    autoRenew: sub.isActive || false,
    isActive: sub.isActive || false,
    locations: restaurant.locations?.length || 0,
  }

  return res.status(200).json(
    new ApiResponse(200, subscription, "Subscription renewed successfully")
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
    status: "cancelled",
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
  let cancelledCount = 0

  restaurants.forEach((restaurant) => {
    const sub = restaurant.subscription
    if (!sub || !sub.pricePerMonth) return

    const endDate = sub.endDate ? new Date(sub.endDate) : null
    let status = "cancelled"

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
    else if (status === "cancelled") cancelledCount++
  })

  const stats = {
    totalMRR,
    activeSubscriptions: activeCount,
    expiringSoon: expiringCount,
    expired: expiredCount,
    cancelled: cancelledCount,
    totalSubscriptions: restaurants.length,
    growthRate: "+12%",
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
