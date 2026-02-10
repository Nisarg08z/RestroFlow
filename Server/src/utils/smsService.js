/**
 * SMS Service for sending OTP to phone numbers.
 * Uses Twilio when configured. Falls back to console log in development.
 *
 * To enable Twilio, add to .env:
 * TWILIO_ACCOUNT_SID=your_account_sid
 * TWILIO_AUTH_TOKEN=your_auth_token
 * TWILIO_PHONE_NUMBER=+1234567890
 */

export const sendSMSOTP = async (phone, otp) => {
  const message = `Your RestroFlow verification code is: ${otp}. Valid for 10 minutes. Do not share with anyone.`;

  if (
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  ) {
    try {
      const twilio = await import("twilio");
      const client = twilio.default(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone.replace(/\D/g, "")}`;
      await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedPhone,
      });
      return { success: true };
    } catch (error) {
      console.error("Twilio SMS error:", error.message);
      throw new Error("Failed to send SMS. Please try again.");
    }
  }

  // Development fallback - log OTP to console
  console.log(`\n========== OTP (Dev Mode) ==========`);
  console.log(`Phone: ${phone}`);
  console.log(`OTP: ${otp}`);
  console.log(`=====================================\n`);
  return { success: true };
};
