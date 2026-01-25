import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Download,
  X,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { getMySubscription, renewMySubscription, getMyInvoices } from "../../utils/api";
import { toast } from "react-hot-toast";

const PRICE_PER_TABLE = 50;

const RestaurantSubscription = ({ restaurant, onUpdate }) => {
  const [subscription, setSubscription] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renewing, setRenewing] = useState(false);
  const [showInvoices, setShowInvoices] = useState(false);
  const [showMonthsModal, setShowMonthsModal] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState(1);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const [subRes, invoicesRes] = await Promise.all([
        getMySubscription(),
        getMyInvoices({ limit: 10 }),
      ]);

      if (subRes.data?.success) {
        setSubscription(subRes.data.data);
      }

      if (invoicesRes.data?.success) {
        setInvoices(invoicesRes.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
      toast.error(error.response?.data?.message || "Failed to load subscription");
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async (months = selectedMonths) => {
    if (!subscription) return;

    try {
      setRenewing(true);
      const response = await renewMySubscription({ months });

      if (response.data?.success && response.data.data.invoice) {
        const invoice = response.data.data.invoice;
        
        if (invoice.paymentLink) {
          window.open(invoice.paymentLink, "_blank");
          toast.success("Payment link opened in new tab");
        } else {
          toast.success("Renewal invoice created successfully");
        }
        
        setShowMonthsModal(false);
        await fetchSubscription();
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error("Error renewing subscription:", error);
      toast.error(error.response?.data?.message || "Failed to renew subscription");
    } finally {
      setRenewing(false);
    }
  };

  const handleDownloadReceipt = (invoice) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPos = margin;

      doc.setFontSize(20);
      doc.setFont(undefined, "bold");
      doc.text("RestroFlow", pageWidth / 2, yPos, { align: "center" });
      yPos += 10;

      doc.setFontSize(16);
      doc.text("Payment Receipt", pageWidth / 2, yPos, { align: "center" });
      yPos += 15;

      doc.setFontSize(12);
      doc.setFont(undefined, "normal");
      doc.text(`Invoice ID: ${invoice._id || invoice.id}`, margin, yPos);
      yPos += 7;

      if (invoice.createdAt) {
        doc.text(`Date: ${formatDate(invoice.createdAt)}`, margin, yPos);
        yPos += 7;
      }

      if (restaurant) {
        doc.text(`Restaurant: ${restaurant.restaurantName || "N/A"}`, margin, yPos);
        yPos += 7;
      }

      yPos += 5;

      doc.setFontSize(16);
      doc.setFont(undefined, "bold");
      doc.text(`Amount: ₹${invoice.amount}`, margin, yPos);
      yPos += 10;

      doc.setFontSize(12);
      doc.setFont(undefined, "normal");
      const statusText = invoice.status === "PAID" ? "Status: Paid" : `Status: ${invoice.status || "Pending"}`;
      doc.text(statusText, margin, yPos);
      yPos += 7;

      if (invoice.description) {
        doc.text(`Description: ${invoice.description}`, margin, yPos);
        yPos += 7;
      }

      if (invoice.type) {
        doc.text(`Type: ${invoice.type}`, margin, yPos);
        yPos += 7;
      }

      yPos = doc.internal.pageSize.getHeight() - 20;
      doc.setFontSize(10);
      doc.setFont(undefined, "italic");
      doc.text("Thank you for your business!", pageWidth / 2, yPos, { align: "center" });

      const fileName = `receipt-${invoice._id || invoice.id}-${new Date().getTime()}.pdf`;
      doc.save(fileName);
      toast.success("Receipt downloaded successfully");
    } catch (error) {
      console.error("Error generating receipt:", error);
      toast.error("Failed to generate receipt");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    if (status === "active") return "bg-green-500/10 text-green-500";
    if (status === "expiring") return "bg-yellow-500/10 text-yellow-500";
    if (status === "expired") return "bg-red-500/10 text-red-500";
    return "bg-muted text-muted-foreground";
  };

  const getStatusIcon = (status) => {
    if (status === "active") return <CheckCircle2 className="w-4 h-4" />;
    if (status === "expiring" || status === "expired") return <AlertCircle className="w-4 h-4" />;
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
        <p>No subscription found</p>
      </div>
    );
  }

  const totalPrice = subscription.totalTables * PRICE_PER_TABLE;
  const daysUntilExpiry = subscription.endDate
    ? Math.ceil((new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const paidInvoices = invoices.filter(
    (invoice) => invoice.status?.toUpperCase() === "PAID"
  );

  return (
    <div className="space-y-6">
      {/* Subscription Details */}
      <div className="bg-muted/30 border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Current Subscription</h3>
            <p className="text-sm text-muted-foreground">
              {subscription.totalTables} table{subscription.totalTables !== 1 ? "s" : ""} × ₹{PRICE_PER_TABLE}/month
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(subscription.status)}`}>
            {getStatusIcon(subscription.status)}
            {subscription.status === "active" ? "Active" : subscription.status === "expiring" ? "Expiring Soon" : "Expired"}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Monthly Price</p>
            <p className="text-2xl font-bold text-foreground">₹{totalPrice}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Start Date</p>
            <p className="text-foreground font-medium">{formatDate(subscription.startDate)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">End Date</p>
            <p className="text-foreground font-medium">
              {formatDate(subscription.endDate)}
              {daysUntilExpiry !== null && daysUntilExpiry > 0 && (
                <span className="text-xs text-muted-foreground block mt-1">
                  {daysUntilExpiry} day{daysUntilExpiry !== 1 ? "s" : ""} remaining
                </span>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowMonthsModal(true)}
          disabled={renewing}
          className="w-full mt-4 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className="w-4 h-4" />
          {subscription.status === "expiring" || subscription.status === "expired" 
            ? "Renew Subscription" 
            : "Extend Subscription"}
        </button>
      </div>

      {/* Invoices Section */}
      <div>
        <button
          onClick={() => setShowInvoices(!showInvoices)}
          className="flex items-center justify-between w-full p-4 bg-muted/30 border border-border rounded-xl hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">Payment History</span>
            <span className="text-sm text-muted-foreground">({paidInvoices.length})</span>
          </div>
          <span className="text-muted-foreground">{showInvoices ? "Hide" : "Show"}</span>
        </button>

        {showInvoices && (
          <div className="mt-4 space-y-2">
            {paidInvoices.length > 0 ? (
              paidInvoices.map((invoice) => (
                <div
                  key={invoice._id || invoice.id}
                  className="p-4 bg-card border border-border rounded-xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-semibold text-foreground text-lg">₹{invoice.amount}</p>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                          Paid
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(invoice.createdAt || invoice.dueDate)}
                      </p>
                      {invoice.description && (
                        <p className="text-xs text-muted-foreground mt-1">{invoice.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadReceipt(invoice)}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium text-sm flex items-center gap-2 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Receipt
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No payment history found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Months Selection Modal */}
      {showMonthsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-foreground">Extend Subscription</h3>
              <button
                onClick={() => setShowMonthsModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground">
              Select the number of months to extend your subscription:
            </p>

            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 6, 12].map((months) => {
                const price = totalPrice * months;
                return (
                  <button
                    key={months}
                    onClick={() => setSelectedMonths(months)}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      selectedMonths === months
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <p className="font-semibold text-foreground">{months} Month{months !== 1 ? "s" : ""}</p>
                    <p className="text-sm text-muted-foreground mt-1">₹{price}</p>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold text-foreground">₹{totalPrice * selectedMonths}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowMonthsModal(false)}
                  className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRenew(selectedMonths)}
                  disabled={renewing}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {renewing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Continue"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantSubscription;
