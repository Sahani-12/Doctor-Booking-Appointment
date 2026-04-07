// Payment UI: demo mode by default (no Stripe/Razorpay keys).
// Set VITE_ENABLE_REAL_PAYMENTS=true and gateway keys to use live checkout.
import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";
import BASE_URL from "@/constants/api";
import "./PaymentModal.css";

const realPaymentsEnabled =
  import.meta.env.VITE_ENABLE_REAL_PAYMENTS === "true";

const stripePk = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const stripePromise =
  realPaymentsEnabled && stripePk && !stripePk.includes("your_")
    ? loadStripe(stripePk)
    : null;

// —— Demo (no gateway keys) ——
function DemoPaymentForm({ appointmentId, amount, doctorName, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDemoPay = async () => {
    if (!appointmentId) {
      setError("Missing appointment. Please try booking again.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem("token");
      const { data } = await axios.post(
        `${BASE_URL}/payments/demo-complete`,
        { appointmentId, amount: Number(amount) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (data.success) {
        onSuccess({
          transactionId: data.data?.transactionId,
          method: "demo",
        });
      } else {
        setError(data.message || "Could not record payment");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || err.message || "Demo payment failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-form-container">
      <div className="payment-header">
        <h2>Complete payment</h2>
        <p>Consultation with Dr. {doctorName}</p>
      </div>

      <div className="rounded-lg bg-sky-50 border border-sky-200 p-4 mb-4 text-sm text-sky-900">
        <strong>Demo mode:</strong> No real payment gateway is connected. This
        simulates a successful payment so you can test the full booking flow.
      </div>

      <div className="payment-details">
        <div className="detail-row">
          <span>Amount</span>
          <strong>₹{amount}</strong>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <button
        type="button"
        onClick={handleDemoPay}
        disabled={loading}
        className="pay-button stripe-button"
        style={{ width: "100%", marginTop: 8 }}
      >
        {loading ? "Processing…" : `Confirm demo payment (₹${amount})`}
      </button>

      <button
        type="button"
        onClick={onCancel}
        className="cancel-button"
        disabled={loading}
      >
        Pay later / skip
      </button>

      <div className="security-note">
        🔒 Production: set <code>VITE_ENABLE_REAL_PAYMENTS=true</code> and
        gateway keys in <code>.env</code>
      </div>
    </div>
  );
}

// —— Stripe (optional) ——
const RealPaymentForm = ({
  appointmentId,
  amount,
  doctorName,
  onSuccess,
  onCancel,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [method, setMethod] = useState("stripe");

  const handleStripeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = sessionStorage.getItem("token");

      const { data: paymentData } = await axios.post(
        `${BASE_URL}/payments/stripe/create-payment`,
        {
          appointmentId,
          amount,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!paymentData.success) {
        throw new Error(paymentData.message);
      }

      const { error: stripeErr, paymentIntent } = await stripe.confirmCardPayment(
        paymentData.data.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        },
      );

      if (stripeErr) {
        setError(stripeErr.message);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        const { data: verifyData } = await axios.post(
          `${BASE_URL}/payments/stripe/confirm-payment`,
          {
            paymentIntentId: paymentIntent.id,
            transactionId: paymentData.data.transactionId,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (verifyData.success) {
          onSuccess({
            transactionId: verifyData.transactionId,
            method: "stripe",
          });
        }
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = sessionStorage.getItem("token");

      const { data: orderData } = await axios.post(
        `${BASE_URL}/payments/razorpay/create-order`,
        {
          appointmentId,
          amount,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!orderData.success) {
        throw new Error(orderData.message);
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        order_id: orderData.data.orderId,
        handler: async (response) => {
          try {
            const { data: verifyData } = await axios.post(
              `${BASE_URL}/payments/razorpay/verify-payment`,
              {
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
                transactionId: orderData.data.transactionId,
              },
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );

            if (verifyData.success) {
              onSuccess({
                transactionId: verifyData.transactionId,
                method: "razorpay",
              });
            }
          } catch (err) {
            setError("Payment verification failed: " + err.message);
          }
        },
        prefill: {
          name: "Patient",
          email: sessionStorage.getItem("userEmail") || "",
        },
        theme: { color: "#0ea5e9" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("RazorPay error:", err);
      setError(err.message || "Failed to initialize payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-form-container">
      <div className="payment-header">
        <h2>Complete payment</h2>
        <p>Consultation with Dr. {doctorName}</p>
      </div>

      <div className="payment-details">
        <div className="detail-row">
          <span>Amount:</span>
          <strong>₹{amount}</strong>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="payment-methods">
        <div
          className={`method ${method === "stripe" ? "active" : ""}`}
          onClick={() => setMethod("stripe")}
        >
          <input
            type="radio"
            name="payment_method"
            value="stripe"
            checked={method === "stripe"}
            onChange={(e) => setMethod(e.target.value)}
          />
          <label>
            <span>💳</span> Credit/Debit Card (Stripe)
          </label>
        </div>

        <div
          className={`method ${method === "razorpay" ? "active" : ""}`}
          onClick={() => setMethod("razorpay")}
        >
          <input
            type="radio"
            name="payment_method"
            value="razorpay"
            checked={method === "razorpay"}
            onChange={(e) => setMethod(e.target.value)}
          />
          <label>
            <span>🏦</span> Razorpay (UPI, Card, Netbanking)
          </label>
        </div>
      </div>

      {method === "stripe" && (
        <form onSubmit={handleStripeSubmit} className="card-form">
          <div className="card-input">
            <label>Card Details</label>
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#424770",
                    "::placeholder": { color: "#aab7c4" },
                  },
                  invalid: { color: "#fa755a" },
                },
              }}
            />
          </div>

          <button
            type="submit"
            disabled={!stripe || loading}
            className="pay-button stripe-button"
          >
            {loading ? "Processing..." : `Pay ₹${amount}`}
          </button>
        </form>
      )}

      {method === "razorpay" && (
        <div className="razorpay-section">
          <p className="razorpay-info">
            You will be redirected to Razorpay to complete the payment securely.
          </p>
          <button
            type="button"
            onClick={handleRazorpayPayment}
            disabled={loading}
            className="pay-button razorpay-button"
          >
            {loading ? "Processing..." : `Pay with Razorpay ₹${amount}`}
          </button>
        </div>
      )}

      <button type="button" onClick={onCancel} className="cancel-button" disabled={loading}>
        Cancel
      </button>

      <div className="security-note">
        🔒 Your payment is secure and encrypted
      </div>
    </div>
  );
};

export default function PaymentModal({
  isOpen,
  appointmentId,
  amount,
  doctorName,
  onSuccess,
  onClose,
}) {
  if (!isOpen) return null;

  const props = {
    appointmentId,
    amount,
    doctorName,
    onSuccess,
    onCancel: onClose,
  };

  if (!realPaymentsEnabled || !stripePromise) {
    return (
      <div className="payment-modal-overlay">
        <div className="payment-modal">
          <button type="button" className="close-btn" onClick={onClose}>
            ✕
          </button>
          <DemoPaymentForm {...props} />
        </div>
      </div>
    );
  }

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <button type="button" className="close-btn" onClick={onClose}>
          ✕
        </button>

        <Elements stripe={stripePromise}>
          <RealPaymentForm {...props} />
        </Elements>
      </div>
    </div>
  );
}
