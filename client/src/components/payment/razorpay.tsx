/* eslint-disable @typescript-eslint/no-require-imports */
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export interface CreateSubscriptionParams {
  planId: string;
  customerId?: string;
  customerEmail: string;
  customerName: string;
}

export async function createRazorpayCustomer(email: string, name: string) {
  try {
    const customer = await razorpay.customers.create({
      name,
      email,
      contact: "", // Optional phone number
    });
    return customer;
  } catch (error) {
    console.error("Error creating Razorpay customer:", error);
    throw error;
  }
}

export async function createSubscription({
  planId,
  customerId,
  customerEmail,
  customerName,
}: CreateSubscriptionParams) {
  try {
    let customer;

    if (!customerId) {
      customer = await createRazorpayCustomer(customerEmail, customerName);
      customerId = customer.id;
    }

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_id: customerId,
      quantity: 1,
      total_count: 12, // 12 months
      addons: [],
      notes: {
        email: customerEmail,
        name: customerName,
      },
    });

    return { subscription, customerId };
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw error;
  }
}

export async function verifyPaymentSignature(
  razorpayPaymentId: string,
  razorpaySubscriptionId: string,
  razorpaySignature: string
) {
  const crypto = require("crypto");

  const body = razorpayPaymentId + "|" + razorpaySubscriptionId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body.toString())
    .digest("hex");

  return expectedSignature === razorpaySignature;
}

export default razorpay;
