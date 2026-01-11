import { sendGenericEmail } from "./emailService.js"

export const sendPaymentLinkEmail = async (email, restaurantName, paymentLink, amount, description, dueDate) => {
  const subject = "Payment Required - RestroFlow Subscription"
  const formattedAmount = `₹${amount.toLocaleString("en-IN")}`
  const formattedDueDate = new Date(dueDate).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Payment Required</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          line-height: 1.6;
          color: #1e293b;
          background-color: #f8fafc;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #f7931e 0%, #ff6b35 100%);
          padding: 32px;
          text-align: center;
          color: #ffffff;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
        }
        .content {
          padding: 32px;
        }
        .amount-box {
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          padding: 24px;
          text-align: center;
          margin: 24px 0;
        }
        .amount {
          font-size: 36px;
          font-weight: 700;
          color: #f7931e;
          margin: 8px 0;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #f7931e 0%, #ff6b35 100%);
          color: #ffffff;
          text-decoration: none;
          padding: 16px 32px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          margin: 24px 0;
          text-align: center;
        }
        .button:hover {
          opacity: 0.9;
        }
        .info-box {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 16px;
          margin: 24px 0;
          border-radius: 4px;
        }
        .footer {
          background: #f8fafc;
          padding: 24px;
          text-align: center;
          color: #64748b;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Required</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${restaurantName}</strong>,</p>
          <p>Your RestroFlow subscription requires payment for the following:</p>
          
          <div class="amount-box">
            <div style="color: #64748b; font-size: 14px;">Amount Due</div>
            <div class="amount">${formattedAmount}</div>
            <div style="color: #64748b; font-size: 14px; margin-top: 8px;">${description || "Subscription payment"}</div>
          </div>

          <div class="info-box">
            <strong>Due Date:</strong> ${formattedDueDate}
          </div>

          <p>Please click the button below to complete your payment:</p>
          
          <div style="text-align: center;">
            <a href="${paymentLink}" class="button">Pay Now</a>
          </div>

          <p style="color: #64748b; font-size: 14px; margin-top: 24px;">
            If the button doesn't work, copy and paste this link into your browser:<br />
            <a href="${paymentLink}" style="color: #f7931e; word-break: break-all;">${paymentLink}</a>
          </p>

          <p style="margin-top: 24px; color: #64748b;">
            Best regards,<br />
            <strong style="color: #f7931e;">The RestroFlow Team</strong>
          </p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
Hello ${restaurantName},

Your RestroFlow subscription requires payment.

Amount: ${formattedAmount}
Description: ${description || "Subscription payment"}
Due Date: ${formattedDueDate}

Please click the link below to complete your payment:
${paymentLink}

Best regards,
The RestroFlow Team
  `

  return sendGenericEmail(email, subject, html, text)
}

export const sendRenewalReminderEmail = async (email, restaurantName, expiryDate, paymentLink) => {
  const subject = "Subscription Renewal Reminder - RestroFlow"
  const formattedExpiryDate = new Date(expiryDate).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Renewal Reminder</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          line-height: 1.6;
          color: #1e293b;
          background-color: #f8fafc;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #f7931e 0%, #ff6b35 100%);
          padding: 32px;
          text-align: center;
          color: #ffffff;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
        }
        .content {
          padding: 32px;
        }
        .warning-box {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 16px;
          margin: 24px 0;
          border-radius: 4px;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #f7931e 0%, #ff6b35 100%);
          color: #ffffff;
          text-decoration: none;
          padding: 16px 32px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          margin: 24px 0;
          text-align: center;
        }
        .footer {
          background: #f8fafc;
          padding: 24px;
          text-align: center;
          color: #64748b;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Renewal Reminder</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${restaurantName}</strong>,</p>
          
          <div class="warning-box">
            <strong>⚠️ Important:</strong> Your RestroFlow subscription will expire on <strong>${formattedExpiryDate}</strong>.
          </div>

          <p>To continue enjoying all RestroFlow features without interruption, please renew your subscription now.</p>
          
          <div style="text-align: center;">
            <a href="${paymentLink}" class="button">Renew Subscription</a>
          </div>

          <p style="color: #64748b; font-size: 14px; margin-top: 24px;">
            If the button doesn't work, copy and paste this link:<br />
            <a href="${paymentLink}" style="color: #f7931e; word-break: break-all;">${paymentLink}</a>
          </p>

          <p style="margin-top: 24px; color: #64748b;">
            Best regards,<br />
            <strong style="color: #f7931e;">The RestroFlow Team</strong>
          </p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
Hello ${restaurantName},

Your RestroFlow subscription will expire on ${formattedExpiryDate}.

To continue enjoying all features, please renew your subscription:
${paymentLink}

Best regards,
The RestroFlow Team
  `

  return sendGenericEmail(email, subject, html, text)
}
