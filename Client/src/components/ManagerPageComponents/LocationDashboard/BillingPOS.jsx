import React, { useState, useEffect, useCallback } from "react";
import { Receipt, X, Loader2, Banknote, Smartphone, ChevronRight, Printer } from "lucide-react";
import { getLocationOrders } from "../../../utils/api";
import { toast } from "react-hot-toast";

const POLL_INTERVAL_MS = 5000;
const inrFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
});

const RESTRO_NAME = "RestroFlow";


function escapeHtml(s) {
    if (!s) return "";
    return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function buildBillPrintHtml(table, paymentMethod) {
    const rows = (table.orders || []).flatMap((order) =>
        (order.items || []).map((it) => {
            const qty = Number(it.quantity) || 1;
            const price = (Number(it.price) || 0) * qty;
            return {
                name: escapeHtml(it.name),
                qty,
                price,
                note: it.specialInstructions ? escapeHtml(it.specialInstructions) : "",
            };
        })
    );
    const paymentLabel = paymentMethod === "cash" ? "Cash" : "Online (Card/UPI)";
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Bill - Table ${table.tableNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; padding: 16px; font-size: 14px; max-width: 320px; margin: 0 auto; }
    .header { text-align: center; border-bottom: 2px dashed #333; padding-bottom: 12px; margin-bottom: 12px; }
    .header h1 { font-size: 18px; margin-bottom: 4px; }
    .meta { font-size: 12px; color: #555; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 6px 0; border-bottom: 1px solid #ddd; font-size: 11px; color: #666; }
    td { padding: 6px 0; border-bottom: 1px solid #eee; }
    td:last-child { text-align: right; font-weight: 600; }
    .note { font-size: 11px; color: #666; font-style: italic; padding-left: 8px; }
    .total-row { border-top: 2px solid #333; font-weight: bold; font-size: 16px; padding-top: 8px !important; }
    .payment { margin-top: 12px; padding-top: 12px; border-top: 1px dashed #333; font-size: 12px; }
    .footer { text-align: center; margin-top: 16px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${RESTRO_NAME}</h1>
    <p class="meta">Table ${table.tableNumber} &nbsp; | &nbsp; ${new Date().toLocaleString("en-IN")}</p>
  </div>
  <table>
    <thead><tr><th>Item</th><th>Qty</th><th>Amount</th></tr></thead>
    <tbody>
      ${rows.map((r) => `<tr><td>${r.name}${r.note ? `<br><span class="note">${r.note}</span>` : ""}</td><td>${r.qty}</td><td>${escapeHtml(inrFormatter.format(r.price))}</td></tr>`).join("")}
      <tr><td colspan="2" class="total-row">TOTAL</td><td class="total-row">${escapeHtml(inrFormatter.format(table.amount))}</td></tr>
    </tbody>
  </table>
  <div class="payment"><strong>Payment:</strong> ${paymentLabel}</div>
  <div class="footer">Thank you for dining with us!</div>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;
    return html;
}

const BillingPOS = ({ locationId }) => {
    const [loading, setLoading] = useState(true);
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [billStep, setBillStep] = useState("items"); // "items" | "payment" | "billReady"
    const [selectedPayment, setSelectedPayment] = useState(null);

    const fetchOrders = useCallback(async () => {
        if (!locationId) return;
        try {
            const res = await getLocationOrders(locationId);
            if (res.data?.success) {
                const { tables: tableSummaries } = res.data.data;
                const occupied = (tableSummaries || []).filter((t) => t.status === "occupied");
                setTables(
                    occupied.map((t) => ({
                        id: t.tableNumber,
                        tableNumber: t.tableNumber,
                        amount: t.amount || 0,
                        orders: t.orders || [],
                    }))
                );
            }
        } catch (err) {
            console.error("Failed to fetch location orders", err);
            if (loading) toast.error("Failed to load billing data");
            setTables([]);
        } finally {
            setLoading(false);
        }
    }, [locationId, loading]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    useEffect(() => {
        if (!locationId) return;
        const id = setInterval(fetchOrders, POLL_INTERVAL_MS);
        return () => clearInterval(id);
    }, [locationId, fetchOrders]);

    const openBill = (table) => {
        setSelectedTable(table);
        setBillStep("items");
        setSelectedPayment(null);
    };

    const closeBill = () => {
        setSelectedTable(null);
        setBillStep("items");
        setSelectedPayment(null);
    };

    const showPaymentOptions = () => setBillStep("payment");
    const backToItems = () => setBillStep("items");

    const handlePaymentSelect = (method) => {
        setSelectedPayment(method);
        setBillStep("billReady");
        toast.success(`Payment: ${method === "cash" ? "Cash" : "Online"} selected`);
    };

    const handlePrintBill = () => {
        if (!selectedTable) return;
        const html = buildBillPrintHtml(selectedTable, selectedPayment);
        const w = window.open("", "_blank");
        if (!w) {
            toast.error("Allow popups to print bill");
            return;
        }
        w.document.write(html);
        w.document.close();
        w.focus();
        toast.success("Print dialog opened");
    };

    if (loading && tables.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Loading orders…</p>
            </div>
        );
    }

    if (tables.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <Receipt className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">No bills yet</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                    When a table sends an order to the kitchen, their bill will appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500 fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {tables.map((table) => (
                    <button
                        key={table.id}
                        type="button"
                        onClick={() => openBill(table)}
                        className="group relative text-left rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-lg hover:border-primary/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative p-5">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <span className="text-lg font-bold text-primary">
                                            T-{table.tableNumber}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground">Table {table.tableNumber}</p>
                                        <p className="text-2xl font-bold text-primary mt-0.5">
                                            {inrFormatter.format(table.amount)}
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary shrink-0 mt-1" />
                            </div>
                            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                                <Receipt className="w-3.5 h-3.5" />
                                View bill & pay
                            </p>
                        </div>
                    </button>
                ))}
            </div>

            {/* Bill modal */}
            {selectedTable && selectedTable.orders?.length > 0 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Receipt className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-foreground">
                                        Table {selectedTable.tableNumber} — Bill
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        {billStep === "items" && "Order summary"}
                                        {billStep === "payment" && "Choose payment method"}
                                        {billStep === "billReady" && "Print or send bill"}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={closeBill}
                                className="p-2 rounded-xl hover:bg-muted text-foreground transition-colors"
                                aria-label="Close"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {billStep === "billReady" ? (
                                <>
                                    <div className="p-4 border-b border-border">
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10">
                                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                                {selectedPayment === "cash" ? (
                                                    <Banknote className="w-5 h-5 text-primary" />
                                                ) : (
                                                    <Smartphone className="w-5 h-5 text-primary" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Payment method</p>
                                                <p className="font-semibold text-foreground">
                                                    {selectedPayment === "cash" ? "Cash" : "Online (Card/UPI)"}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-3">
                                            Total: <span className="font-bold text-foreground">{inrFormatter.format(selectedTable.amount)}</span>
                                        </p>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <p className="text-sm font-medium text-foreground">Bill actions</p>
                                        <button
                                            type="button"
                                            onClick={handlePrintBill}
                                            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-slate-500/10 flex items-center justify-center">
                                                <Printer className="w-6 h-6 text-slate-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-foreground">Print bill</p>
                                                <p className="text-xs text-muted-foreground">Open print dialog for receipt</p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                        </button>
                                    </div>
                                    <div className="p-4 pt-0 flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setBillStep("payment")}
                                            className="flex-1 py-2.5 rounded-xl border border-border text-foreground font-medium hover:bg-muted transition-colors"
                                        >
                                            Change payment
                                        </button>
                                        <button
                                            type="button"
                                            onClick={closeBill}
                                            className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                                        >
                                            Done
                                        </button>
                                    </div>
                                </>
                            ) : billStep === "items" ? (
                                <>
                                    <div className="p-4 space-y-4">
                                        {selectedTable.orders.map((order, idx) => (
                                            <div key={order._id || idx} className="space-y-2">
                                                {selectedTable.orders.length > 1 && (
                                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                        {order.customerName} — {order.status}
                                                    </p>
                                                )}
                                                <ul className="space-y-2">
                                                    {(order.items || []).map((it, i) => (
                                                        <li
                                                            key={i}
                                                            className="flex justify-between gap-3 text-sm py-1.5 border-b border-border/50 last:border-0"
                                                        >
                                                            <span className="text-foreground flex-1 min-w-0">
                                                                <span className="font-medium">{it.name}</span>
                                                                <span className="text-muted-foreground"> × {it.quantity || 1}</span>
                                                                {it.specialInstructions && (
                                                                    <span className="block text-xs text-muted-foreground italic mt-0.5">
                                                                        {it.specialInstructions}
                                                                    </span>
                                                                )}
                                                            </span>
                                                            <span className="font-semibold text-foreground whitespace-nowrap">
                                                                {inrFormatter.format(
                                                                    (Number(it.price) || 0) * (Number(it.quantity) || 1)
                                                                )}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                                {selectedTable.orders.length > 1 && (
                                                    <p className="text-xs font-semibold text-foreground text-right pt-1">
                                                        Subtotal: {inrFormatter.format(order.total || 0)}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-4 border-t border-border bg-muted/20">
                                        <div className="flex justify-between items-center text-lg font-bold mb-4">
                                            <span className="text-foreground">Total</span>
                                            <span className="text-primary text-xl">
                                                {inrFormatter.format(selectedTable.amount)}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={showPaymentOptions}
                                            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                                        >
                                            Proceed to pay
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="p-4 border-b border-border">
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Bill total</span>
                                            <span className="text-xl font-bold text-primary">
                                                {inrFormatter.format(selectedTable.amount)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <p className="text-sm font-medium text-foreground">Select payment method</p>
                                        <button
                                            type="button"
                                            onClick={() => handlePaymentSelect("cash")}
                                            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                                <Banknote className="w-6 h-6 text-amber-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-foreground">Cash</p>
                                                <p className="text-xs text-muted-foreground">Pay by cash at the counter</p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handlePaymentSelect("online")}
                                            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                                <Smartphone className="w-6 h-6 text-emerald-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-foreground">Online</p>
                                                <p className="text-xs text-muted-foreground">UPI, card, or wallet</p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                        </button>
                                    </div>
                                    <div className="p-4 pt-0">
                                        <button
                                            type="button"
                                            onClick={backToItems}
                                            className="w-full py-2.5 rounded-xl border border-border text-foreground font-medium hover:bg-muted transition-colors"
                                        >
                                            Back to bill
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BillingPOS;
