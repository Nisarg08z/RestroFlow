import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle, XCircle, CreditCard, Calendar, Building2 } from "lucide-react";
import { getInvoiceByToken, createInvoicePaymentOrder, verifyInvoicePayment } from "../../utils/api";
import { toast } from "react-hot-toast";

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {

    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => setError("Failed to load payment gateway");
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (!token) {
      setError("Invalid payment link");
      setLoading(false);
      return;
    }

    if (razorpayLoaded) {
      fetchInvoice();
    }
  }, [token, razorpayLoaded]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getInvoiceByToken(token);
      if (response.data?.success) {
        setInvoice(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching invoice:", err);
      setError(err.response?.data?.message || "Failed to load invoice");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!invoice || !token) return;

    try {
      setProcessing(true);
      setError(null);

      const orderResponse = await createInvoicePaymentOrder({ token });
      if (!orderResponse.data?.success) {
        throw new Error("Failed to create payment order");
      }

      const { orderId, amount } = orderResponse.data.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount * 100,
        currency: "INR",
        name: "RestroFlow",
        description: invoice.description || "Subscription payment",
        order_id: orderId,
        handler: async function (response) {
          try {
            setProcessing(true);
            await verifyInvoicePayment({
              token,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            toast.success("Payment successful!");
            setTimeout(() => {
              navigate("/login");
            }, 2000);
          } catch (error) {
            toast.error(error.response?.data?.message || "Payment verification failed");
            setProcessing(false);
          }
        },
        prefill: {
          name: invoice.restaurantId?.restaurantName || "",
          email: invoice.restaurantId?.email || "",
        },
        theme: {
          color: "#f7931e",
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
            toast.error("Payment cancelled");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("Error initiating payment:", err);
      setError(err.response?.data?.message || "Failed to initiate payment");
      toast.error(err.response?.data?.message || "Failed to initiate payment");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[oklch(0.13_0.005_260)] px-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[oklch(0.7_0.18_45)] mx-auto mb-4 animate-spin" />
          <p className="text-[oklch(0.98_0_0)]">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error && !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[oklch(0.13_0.005_260)] px-4">
        <div className="bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-xl p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[oklch(0.98_0_0)] mb-2">Payment Error</h2>
          <p className="text-[oklch(0.65_0_0)] mb-4">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 bg-[oklch(0.7_0.18_45)] text-black rounded-lg hover:bg-[oklch(0.7_0.18_45)]/90"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (invoice?.status === "PAID") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[oklch(0.13_0.005_260)] px-4">
        <div className="bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[oklch(0.98_0_0)] mb-2">Payment Successful</h2>
          <p className="text-[oklch(0.65_0_0)] mb-4">This invoice has already been paid.</p>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 bg-[oklch(0.7_0.18_45)] text-black rounded-lg hover:bg-[oklch(0.7_0.18_45)]/90"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const formattedAmount = `₹${invoice?.amount.toLocaleString("en-IN")}`;
  const formattedDueDate = invoice?.dueDate
    ? new Date(invoice.dueDate).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div className="min-h-screen bg-[oklch(0.13_0.005_260)] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-xl p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-[oklch(0.98_0_0)] mb-2">
              Payment Required
            </h1>
            <p className="text-[oklch(0.65_0_0)]">
              {invoice?.restaurantId?.restaurantName || "Restaurant"}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div className="bg-[oklch(0.22_0.005_260)] rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[oklch(0.65_0_0)]">Amount Due</span>
                <span className="text-3xl font-bold text-[oklch(0.7_0.18_45)]">
                  {formattedAmount}
                </span>
              </div>
              <div className="border-t border-[oklch(0.28_0.005_260)] pt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-[oklch(0.65_0_0)]">
                  <Building2 className="w-4 h-4" />
                  <span>{invoice?.restaurantId?.restaurantName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[oklch(0.65_0_0)]">
                  <CreditCard className="w-4 h-4" />
                  <span>{invoice?.description || "Subscription payment"}</span>
                </div>
                {formattedDueDate && (
                  <div className="flex items-center gap-2 text-sm text-[oklch(0.65_0_0)]">
                    <Calendar className="w-4 h-4" />
                    <span>Due: {formattedDueDate}</span>
                  </div>
                )}
                {invoice?.type === "EXTRA_TABLE" && invoice?.tablesAdded && (
                  <div className="text-sm text-[oklch(0.65_0_0)]">
                    Extra Tables: {invoice.tablesAdded} ({invoice.proratedDays} days prorated)
                  </div>
                )}
                {invoice?.type === "EXTENSION" && invoice?.monthsAdded && (
                  <div className="text-sm text-[oklch(0.65_0_0)]">
                    Extension: {invoice.monthsAdded} month(s)
                  </div>
                )}
                {invoice?.type === "RENEWAL" && invoice?.monthsAdded && (
                  <div className="text-sm text-[oklch(0.65_0_0)]">
                    Renewal: {invoice.monthsAdded} month(s)
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={processing || invoice?.status === "PAID" || !razorpayLoaded || !window.Razorpay}
            className="w-full bg-[oklch(0.7_0.18_45)] text-black py-3 rounded-lg hover:bg-[oklch(0.7_0.18_45)]/90 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : !razorpayLoaded ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading payment gateway...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Pay {formattedAmount}
              </>
            )}
          </button>

          <p className="text-xs text-[oklch(0.65_0_0)] text-center mt-4">
            Secure payment powered by Razorpay
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
