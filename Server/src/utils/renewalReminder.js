import { Restaurant } from "../models/restaurantModel.js"
import { Invoice } from "../models/invoiceModel.js"
import { createRenewalInvoice } from "./invoiceUtils.js"
import { sendRenewalReminderEmail } from "./paymentEmails.js"


export const sendRenewalReminders = async () => {
  try {
    const now = new Date()
    const fiveDaysFromNow = new Date(now)
    fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5)

  
    const restaurants = await Restaurant.find({
      "subscription.isActive": true,
      "subscription.endDate": {
        $gte: now,
        $lte: fiveDaysFromNow,
      },
    }).select("restaurantName email subscription locations")

    console.log(`Found ${restaurants.length} restaurants with expiring subscriptions`)

    for (const restaurant of restaurants) {
      try {
        const sub = restaurant.subscription
        const totalTables = restaurant.locations?.reduce((sum, loc) => {
          return sum + (loc.totalTables || 0)
        }, 0) || 0

        if (totalTables === 0) {
          console.log(`Skipping ${restaurant.restaurantName} - no tables configured`)
          continue
        }


        const existingInvoice = await Invoice.findOne({
          restaurantId: restaurant._id,
          type: "RENEWAL",
          status: "PENDING",
        })

        if (existingInvoice) {
          console.log(`Sending reminder for existing invoice: ${restaurant.restaurantName}`)
          await sendRenewalReminderEmail(
            restaurant.email,
            restaurant.restaurantName,
            sub.endDate,
            existingInvoice.paymentLink
          )
        } else {
          const invoice = await createRenewalInvoice(restaurant._id, totalTables, 1)

          await sendRenewalReminderEmail(
            restaurant.email,
            restaurant.restaurantName,
            sub.endDate,
            invoice.paymentLink
          )

          console.log(`Created renewal invoice and sent reminder to ${restaurant.restaurantName}`)
        }
      } catch (error) {
        console.error(`Error processing renewal for ${restaurant.restaurantName}:`, error)
      }
    }

    return { success: true, processed: restaurants.length }
  } catch (error) {
    console.error("Error in sendRenewalReminders:", error)
    throw error
  }
}

export const sendExpirationNotifications = async () => {
  try {
    const now = new Date()
    const todayStart = new Date(now.setHours(0, 0, 0, 0))
    const todayEnd = new Date(now.setHours(23, 59, 59, 999))

    const restaurants = await Restaurant.find({
      "subscription.isActive": true,
      "subscription.endDate": {
        $gte: todayStart,
        $lte: todayEnd,
      },
    }).select("restaurantName email subscription locations")

    console.log(`Found ${restaurants.length} restaurants with subscriptions expiring today`)

    for (const restaurant of restaurants) {
      try {
        const sub = restaurant.subscription
        const totalTables = restaurant.locations?.reduce((sum, loc) => {
          return sum + (loc.totalTables || 0)
        }, 0) || 0

        if (totalTables === 0) continue
          
        const invoice = await createRenewalInvoice(restaurant._id, totalTables, 1)

        await sendRenewalReminderEmail(
          restaurant.email,
          restaurant.restaurantName,
          sub.endDate,
          invoice.paymentLink
        )

        console.log(`Sent expiration notification to ${restaurant.restaurantName}`)
      } catch (error) {
        console.error(`Error processing expiration for ${restaurant.restaurantName}:`, error)
      }
    }

    return { success: true, processed: restaurants.length }
  } catch (error) {
    console.error("Error in sendExpirationNotifications:", error)
    throw error
  }
}
