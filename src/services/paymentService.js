/**
 * BusPassPro — Payment Service
 * Handles Razorpay order creation + verification
 */

import api from "./api";

const PaymentService = {

  /**
   * Step 1: Create a Razorpay order on the backend
   * Returns: { order_id, amount, currency, key_id, payment_id }
   */
  createOrder: async (amount, purpose, metadata = {}) => {
    const { data } = await api.post("/payments/create-order/", { amount, purpose, metadata });
    return data;
  },

  /**
   * Step 2: Open Razorpay checkout modal
   * Loads the Razorpay script dynamically if not already loaded
   */
  openCheckout: (orderData, userInfo) => {
    return new Promise((resolve, reject) => {
      // Dynamically load Razorpay script
      if (!window.Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => launchCheckout(orderData, userInfo, resolve, reject);
        script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
        document.body.appendChild(script);
      } else {
        launchCheckout(orderData, userInfo, resolve, reject);
      }
    });
  },

  /**
   * Step 3: Verify payment signature on the backend
   * Returns: { message: "Payment verified!" }
   */
  verifyPayment: async (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
    const { data } = await api.post("/payments/verify-payment/", {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });
    return data;
  },

  /**
   * Step 4: Mark payment as failed on the backend
   */
  markFailed: async (razorpay_order_id, reason, failure_payload = {}) => {
    const { data } = await api.post("/payments/mark-failed/", {
      razorpay_order_id,
      reason,
      failure_payload,
    });
    return data;
  },
};

/** Internal: launch Razorpay modal */
function launchCheckout(orderData, userInfo, resolve, reject) {
  const options = {
    key:         orderData.key_id,
    amount:      orderData.amount,
    currency:    orderData.currency,
    order_id:    orderData.order_id,
    name:        "BusPassPro",
    description: "College Bus Pass Payment",
    image:       "/logo.png",
    prefill: {
      name:  userInfo?.name  || "",
      email: userInfo?.email || "",
      contact: userInfo?.phone || "",
    },
    theme: { color: "#BC7820" },
    handler: (response) => resolve(response),
    modal: { ondismiss: () => reject(new Error("Payment cancelled by user")) },
  };
  const rzp = new window.Razorpay(options);
  rzp.on("payment.failed", (response) => reject(new Error(response.error.description)));
  rzp.open();
}

/**
 * Full payment flow — call this from your component
 * Usage:
 *   const result = await PaymentService.pay(amount, purpose, metadata, { name, email, phone });
 */
PaymentService.pay = async (amount, purpose, metadata, userInfo) => {
  // 1. Create order
  const orderData = await PaymentService.createOrder(amount, purpose, metadata);
  // 2. Open Razorpay modal
  const response = await PaymentService.openCheckout(orderData, userInfo);
  // 3. Verify on backend
  const verification = await PaymentService.verifyPayment(
    response.razorpay_order_id,
    response.razorpay_payment_id,
    response.razorpay_signature
  );
  return { ...verification, payment_id: response.razorpay_payment_id };
};

export default PaymentService;
