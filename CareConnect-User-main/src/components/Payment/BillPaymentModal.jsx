import React, { useState } from "react";
import { X, Loader2, Shield } from "lucide-react";
import axios from "axios";
import BASE_URL from "@/constants/api";
import "./PaymentModal.css";

const realPaymentsEnabled =
  import.meta.env.VITE_ENABLE_REAL_PAYMENTS === "true";

export default function BillPaymentModal({
  open,
  onClose,
  bill,
  onPaymentSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("demo");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvc: "",
  });
  const [success, setSuccess] = useState(false);

  if (!open || !bill) return null;

  const handleDemoPayment = async () => {
    setLoading(true);
    setError("");

    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.post(
        `${BASE_URL}/hospital/bills/pay`,
        {
          billId: bill._id,
          amount: bill.balanceDue,
          paymentMethod: "demo",
          transactionId: `DEMO-${Date.now()}`,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          onPaymentSuccess(response.data.data);
          handleClose();
        }, 2000);
      } else {
        setError(response.data.message || "Payment failed");
      }
    } catch (err) {
      console.error("Demo payment error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Demo payment processing error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async () => {
    if (!window.Razorpay) {
      setError("Razorpay is not loaded. Please try Demo payment.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = sessionStorage.getItem("token");
      const user = JSON.parse(sessionStorage.getItem("user") || "{}");

      const response = await axios.post(
        `${BASE_URL}/hospital/bills/razorpay-order`,
        {
          billId: bill._id,
          amount: bill.balanceDue,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.data.success) {
        setError(response.data.message || "Failed to create payment order");
        setLoading(false);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: response.data.data.amount,
        currency: "INR",
        order_id: response.data.data.orderId,
        description: `Hospital Bill #${bill.billNumber}`,
        handler: async (paymentResponse) => {
          try {
            const verifyRes = await axios.post(
              `${BASE_URL}/hospital/bills/verify-razorpay`,
              {
                billId: bill._id,
                razorpayPaymentId: paymentResponse.razorpay_payment_id,
                razorpayOrderId: paymentResponse.razorpay_order_id,
                razorpaySignature: paymentResponse.razorpay_signature,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              },
            );

            if (verifyRes.data.success) {
              setSuccess(true);
              setTimeout(() => {
                onPaymentSuccess(verifyRes.data.data);
                handleClose();
              }, 2000);
            } else {
              setError("Payment verification failed");
            }
          } catch (err) {
            setError("Verification error: " + err.message);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user.fullname || "Patient",
          email: user.email || "",
          contact: user.phone || "",
        },
        theme: { color: "#0ea5e9" },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Razorpay error:", err);
      setError(err.message || "Failed to initialize Razorpay");
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    setSuccess(false);
    setCardDetails({
      cardNumber: "",
      cardName: "",
      expiry: "",
      cvc: "",
    });
    onClose();
  };

  const money = (value = 0) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value || 0);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in fade-in-0 zoom-in-95 max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:bg-muted"
        >
          <X size={20} />
        </button>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield size={32} />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Payment Successful!
            </h2>
            <p className="text-muted-foreground">
              Your bill payment of {money(bill.balanceDue)} has been processed.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Pay Bill
            </h2>
            <p className="text-muted-foreground mb-6">
              Bill #{bill.billNumber}
            </p>

            {/* Bill Summary */}
            <div className="bg-muted/50 rounded-xl p-4 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="font-semibold text-foreground">
                    {money(bill.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Already Paid:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {money(bill.paidAmount)}
                  </span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between">
                  <span className="font-semibold text-foreground">
                    Amount Due:
                  </span>
                  <span className="font-bold text-lg text-red-600 dark:text-red-400">
                    {money(bill.balanceDue)}
                  </span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-300 p-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            {/* Payment Methods */}
            <div className="space-y-3 mb-6">
              <label className="block text-sm font-semibold text-foreground mb-3">
                Select Payment Method
              </label>

              {/* Demo Payment */}
              <div
                className={`p-4 border rounded-xl cursor-pointer transition ${
                  paymentMethod === "demo"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setPaymentMethod("demo")}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment_method"
                    value="demo"
                    checked={paymentMethod === "demo"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="cursor-pointer"
                  />
                  <div>
                    <p className="font-semibold text-foreground">Demo Mode</p>
                    <p className="text-xs text-muted-foreground">
                      Test payment (no real charges)
                    </p>
                  </div>
                </div>
              </div>

              {/* Razorpay */}
              {import.meta.env.VITE_RAZORPAY_KEY_ID && (
                <div
                  className={`p-4 border rounded-xl cursor-pointer transition ${
                    paymentMethod === "razorpay"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setPaymentMethod("razorpay")}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      value="razorpay"
                      checked={paymentMethod === "razorpay"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="cursor-pointer"
                    />
                    <div>
                      <p className="font-semibold text-foreground">Razorpay</p>
                      <p className="text-xs text-muted-foreground">
                        UPI, Cards, Wallets
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Button */}
            <button
              onClick={
                paymentMethod === "razorpay"
                  ? handleRazorpayPayment
                  : handleDemoPayment
              }
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90"
              }`}
            >
              {loading && <Loader2 className="animate-spin" size={18} />}
              {loading ? "Processing..." : `Pay ${money(bill.balanceDue)}`}
            </button>

            {/* Security Note */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-lg text-xs text-blue-700 dark:text-blue-300">
              🔒 Your payment information is secure and encrypted.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
