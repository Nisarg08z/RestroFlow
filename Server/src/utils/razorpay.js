import Razorpay from "razorpay";
import crypto from "crypto";

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrder = async (amount, currency = "INR", receipt) => {
  try {
    const options = {
      amount: amount * 100,
      currency: currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    throw new Error(`Failed to create payment order: ${error.message}`);
  }
};

export const verifyPayment = (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
  try {
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    return generated_signature === razorpay_signature;
  } catch (error) {
    console.error("Error verifying payment:", error);
    return false;
  }
};

export const getPaymentDetails = async (paymentId) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error("Error fetching payment details:", error);
    throw new Error(`Failed to fetch payment details: ${error.message}`);
  }
};

