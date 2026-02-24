import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Receipt, X, Loader2, Banknote, Smartphone, ChevronRight, Printer, User, Phone, Check, Percent } from "lucide-react";
import { getLocationOrders, markTablePaid } from "../../../utils/api";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const POLL_INTERVAL_MS = 5000;
const inrFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
});

const RESTRO_NAME = "RestroFlow";

function mergeDuplicateItems(items) {
    const map = new Map();
    for (const it of items) {
        const key = `${it.name}|${Number(it.price) || 0}|${(it.specialInstructions || "").trim()}`;
        const qty = Number(it.quantity) || 1;
        const price = Number(it.price) || 0;
        const existing = map.get(key);
        if (existing) {
            existing.quantity += qty;
        } else {
            map.set(key, {
                name: it.name,
                price,
                quantity: qty,
                specialInstructions: it.specialInstructions || "",
            });
        }
    }
    return Array.from(map.values());
}

function escapeHtml(s) {
    if (!s) return "";
    return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

const STATUS_LABELS = {
    PENDING: { label: "In cart", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
    SUBMITTED: { label: "Submitted", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
    PREPARING: { label: "Preparing", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
    SERVED: { label: "Served", color: "bg-green-500/10 text-green-600 border-green-500/20" },
};

function getCustomersFromTable(table) {
    const byPhone = new Map();
    for (const order of table.orders || []) {
        const phone = String(order.customerPhone || "").trim();
        const key = phone || `_${order._id}`;
        if (!byPhone.has(key)) {
            byPhone.set(key, {
                phone,
                name: order.customerName || "—",
                orders: [],
                amount: 0,
            });
        }
        const row = byPhone.get(key);
        const orderTotal = (order.items || []).reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0);
        row.amount += orderTotal;
        row.orders.push(order);
    }
    return Array.from(byPhone.values());
}

function buildBillPrintHtml(table, paymentMethod, selectedPhones = null, discountPercent = 0) {
    const orders = table.orders || [];
    const filteredOrders = selectedPhones && selectedPhones.length > 0
        ? orders.filter((o) => selectedPhones.includes(String(o.customerPhone || "").trim()))
        : orders;
    const allItems = filteredOrders.flatMap((order) => order.items || []);
    const merged = mergeDuplicateItems(allItems);
    const rows = merged.map((it) => {
        const qty = it.quantity;
        const price = it.price * qty;
        return {
            name: escapeHtml(it.name),
            qty,
            price,
            note: it.specialInstructions ? escapeHtml(it.specialInstructions) : "",
        };
    });
    const subtotal = rows.reduce((s, r) => s + r.price, 0);
    const discountAmount = discountPercent > 0 ? Math.round(subtotal * (discountPercent / 100)) : 0;
    const total = subtotal - discountAmount;
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
      ${discountAmount > 0 ? `<tr><td colspan="2">Discount (${discountPercent}%)</td><td>-${escapeHtml(inrFormatter.format(discountAmount))}</td></tr>` : ""}
      <tr><td colspan="2" class="total-row">TOTAL</td><td class="total-row">${escapeHtml(inrFormatter.format(total))}</td></tr>
    </tbody>
  </table>
  <div class="payment"><strong>Payment:</strong> ${paymentLabel}</div>
  <div class="footer">Thank you for dining with us!</div>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;
    return html;
}

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const backdropVariants = {
    hidden: { opacity: 0, backdropFilter: "blur(0px)" },
    visible: { opacity: 1, backdropFilter: "blur(8px)", transition: { duration: 0.4, ease: "easeOut" } }
};

const modalVariants = {
    hidden: { opacity: 0, scale: 0.85, y: 40, rotateX: 5 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        rotateX: 0,
        transition: { type: "spring", stiffness: 400, damping: 28, mass: 0.8 }
    },
    exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2, ease: "easeIn" } }
};

const BillingPOS = ({ locationId }) => {
    const [loading, setLoading] = useState(true);
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [selectedCustomers, setSelectedCustomers] = useState(new Set());
    const [discountPercent, setDiscountPercent] = useState(0);
    const [billStep, setBillStep] = useState("items");
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [completingPayment, setCompletingPayment] = useState(false);

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
        setDiscountPercent(0);
        const customers = getCustomersFromTable(table);
        setSelectedCustomers(new Set(customers.map((c) => c.phone).filter(Boolean)));
    };

    const closeBill = () => {
        setSelectedTable(null);
        setTimeout(() => {
            setSelectedCustomers(new Set());
            setDiscountPercent(0);
            setBillStep("items");
            setSelectedPayment(null);
        }, 300);
    };

    const toggleCustomer = (phone) => {
        setSelectedCustomers((prev) => {
            const next = new Set(prev);
            if (next.has(phone)) next.delete(phone);
            else next.add(phone);
            return next;
        });
    };

    const handlePaymentDone = async () => {
        if (!selectedTable || !locationId) return;
        const phones = Array.from(selectedCustomers).filter(Boolean);
        if (phones.length === 0) {
            toast.error("Select at least one customer to bill");
            return;
        }
        setCompletingPayment(true);
        try {
            await markTablePaid(locationId, String(selectedTable.tableNumber), {
                customerPhones: phones,
            });
            const customerCount = getCustomersFromTable(selectedTable).length;
            const msg = phones.length >= customerCount
                ? "Payment recorded. Table cleared."
                : `Payment recorded for ${phones.length} customer(s).`;
            toast.success(msg);
            closeBill();
            await fetchOrders();
        } catch (err) {
            console.error("Failed to mark table paid", err);
            toast.error(err.response?.data?.message || "Failed to complete payment");
        } finally {
            setCompletingPayment(false);
        }
    };

    const showPaymentOptions = () => setBillStep("payment");
    const backToItems = () => setBillStep("items");

    const handlePaymentSelect = (method) => {
        setSelectedPayment(method);
        setBillStep("billReady");
        toast.success(`Payment: ${method === "cash" ? "Cash" : "Online"} selected`);
    };

    const getSelectedSubtotal = () =>
        getCustomersFromTable(selectedTable || { orders: [] })
            .filter((c) => selectedCustomers.has(c.phone))
            .reduce((s, c) => s + c.amount, 0);

    const getDiscountAmount = () => {
        const sub = getSelectedSubtotal();
        return discountPercent > 0 ? Math.round(sub * (discountPercent / 100)) : 0;
    };

    const getFinalTotal = () => getSelectedSubtotal() - getDiscountAmount();

    const handlePrintBill = () => {
        if (!selectedTable) return;
        const phones = Array.from(selectedCustomers).filter(Boolean);
        const html = buildBillPrintHtml(
            selectedTable,
            selectedPayment,
            phones.length > 0 ? phones : null,
            discountPercent
        );
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
                <p className="text-sm text-muted-foreground font-medium">Loading orders…</p>
            </div>
        );
    }

    if (tables.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-24 px-4 text-center border-2 border-dashed border-border/60 rounded-3xl bg-card/30"
            >
                <div className="w-20 h-20 rounded-[2rem] bg-primary/10 flex items-center justify-center mb-6 shadow-inner">
                    <Receipt className="w-10 h-10 text-primary opacity-80" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">No Active Bills</h3>
                <p className="text-base text-muted-foreground font-medium max-w-sm">
                    Orders sent to the kitchen will automatically appear here for billing.
                </p>
            </motion.div>
        );
    }

    return (
        <div className="space-y-6">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
                {tables.map((table) => (
                    <motion.button
                        variants={itemVariants}
                        key={table.id}
                        type="button"
                        onClick={() => openBill(table)}
                        className="group relative text-left rounded-3xl border border-border/60 bg-card overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative p-6">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner group-hover:scale-105 transition-transform duration-300">
                                        <span className="text-xl font-bold text-primary">
                                            T{table.tableNumber}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-foreground tracking-tight">Table {table.tableNumber}</p>
                                        <p className="text-2xl font-black text-primary mt-0.5 tracking-tight group-hover:text-primary transition-colors">
                                            {inrFormatter.format(table.amount)}
                                        </p>
                                        {(() => {
                                            const orders = table.orders || [];
                                            const served = orders.filter((o) => o.status === "SERVED").length;
                                            const allServed = orders.length > 0 && served === orders.length;
                                            return (
                                                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border mt-1.5 inline-block transition-colors ${allServed ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                                    }`}>
                                                    {allServed ? "All served" : `${served}/${orders.length} served`}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
                                </div>
                            </div>
                            <div className="mt-5 pt-4 border-t border-border/50 flex flex-row items-center justify-between">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <Receipt className="w-3.5 h-3.5" />
                                    Process Bill
                                </p>
                            </div>
                        </div>
                    </motion.button>
                ))}
            </motion.div>

            {/* Bill modal */}
            {createPortal(
                <AnimatePresence>
                    {selectedTable && selectedTable.orders?.length > 0 && (
                        <motion.div
                            variants={backdropVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            onClick={closeBill}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4"
                            style={{ perspective: "1000px" }}
                        >
                            <motion.div
                                variants={modalVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                onClick={(e) => e.stopPropagation()}
                                className="bg-card border border-border/60 rounded-[2rem] shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden relative"
                            >
                                {/* Accent Glow */}
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />

                                <div className="flex items-center justify-between p-5 border-b border-border bg-muted/30">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner border border-primary/20">
                                            <Receipt className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-foreground tracking-tight">
                                                Table {selectedTable.tableNumber}
                                            </h2>
                                            <p className="text-sm font-medium text-muted-foreground">
                                                {billStep === "items" && "Select & Merge Orders"}
                                                {billStep === "payment" && "Choose Payment Method"}
                                                {billStep === "billReady" && "Finalize Bill"}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={closeBill}
                                        className="p-2.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors bg-background border border-border/50 shadow-sm hover:scale-105 active:scale-95"
                                        aria-label="Close"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="w-full shrink overflow-y-auto custom-scrollbar">
                                    <AnimatePresence mode="wait">
                                        {billStep === "billReady" ? (
                                            <motion.div
                                                key="billReady"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <div className="p-5 border-b border-border/50">
                                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/20 shadow-[0_0_15px_rgba(249,115,22,0.05)]">
                                                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shadow-inner">
                                                            {selectedPayment === "cash" ? (
                                                                <Banknote className="w-6 h-6 text-primary" />
                                                            ) : (
                                                                <Smartphone className="w-6 h-6 text-primary" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Payment Method</p>
                                                            <p className="font-extrabold text-foreground text-lg tracking-tight">
                                                                {selectedPayment === "cash" ? "Cash Transaction" : "Online (Card/UPI)"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-5 p-4 rounded-2xl bg-muted/40 border border-border/50 space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2 text-muted-foreground font-medium">
                                                                <Percent className="w-4 h-4" />
                                                                <span className="text-sm uppercase tracking-wide text-xs font-bold">Discount</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-2 py-1 shadow-inner">
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    max={100}
                                                                    value={discountPercent || ""}
                                                                    onChange={(e) => {
                                                                        const v = e.target.value === "" ? 0 : Math.min(100, Math.max(0, Number(e.target.value)));
                                                                        setDiscountPercent(v);
                                                                    }}
                                                                    placeholder="0"
                                                                    className="w-10 text-right bg-transparent text-foreground font-bold text-sm focus:outline-none"
                                                                />
                                                                <span className="text-xs font-bold text-muted-foreground">%</span>
                                                            </div>
                                                        </div>

                                                        <div className="border-t border-border/60 my-3"></div>

                                                        <div className="space-y-1">
                                                            <div className="flex justify-between text-sm font-medium text-muted-foreground">
                                                                <span>Subtotal</span>
                                                                <span>{inrFormatter.format(getSelectedSubtotal())}</span>
                                                            </div>
                                                            {discountPercent > 0 && (
                                                                <div className="flex justify-between text-sm font-bold text-green-500">
                                                                    <span>Discount ({discountPercent}%)</span>
                                                                    <span>-{inrFormatter.format(getDiscountAmount())}</span>
                                                                </div>
                                                            )}
                                                            <div className="flex justify-between items-center text-xl font-black text-foreground pt-2">
                                                                <span>Total Due</span>
                                                                <span className="text-primary text-2xl">{inrFormatter.format(getFinalTotal())}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-5 space-y-4">
                                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Bill Actions</p>
                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        type="button"
                                                        onClick={handlePrintBill}
                                                        className="w-full flex items-center justify-between p-4 rounded-2xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-xl bg-slate-500/10 flex items-center justify-center border border-slate-500/20">
                                                                <Printer className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                                                            </div>
                                                            <div className="text-left">
                                                                <p className="font-bold text-foreground">Print physical bill</p>
                                                                <p className="text-xs font-medium text-muted-foreground">Open print dialog for thermal receipt</p>
                                                            </div>
                                                        </div>
                                                        <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center shadow-sm">
                                                            <ChevronRight className="w-4 h-4 text-foreground" />
                                                        </div>
                                                    </motion.button>
                                                </div>
                                                <div className="p-5 pt-0 flex gap-3">
                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        type="button"
                                                        onClick={() => setBillStep("payment")}
                                                        disabled={completingPayment}
                                                        className="flex-1 py-3.5 rounded-2xl border border-border text-foreground font-bold hover:bg-muted transition-colors disabled:opacity-50 text-sm shadow-sm bg-background"
                                                    >
                                                        Change Method
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        type="button"
                                                        onClick={handlePaymentDone}
                                                        disabled={completingPayment}
                                                        className="flex-[2] py-3.5 rounded-2xl bg-primary text-primary-foreground font-black hover:bg-primary/90 transition-shadow disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.4)]"
                                                    >
                                                        {completingPayment ? (
                                                            <>
                                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                                Processing…
                                                            </>
                                                        ) : (
                                                            "Complete Order"
                                                        )}
                                                    </motion.button>
                                                </div>
                                            </motion.div>
                                        ) : billStep === "items" ? (
                                            <motion.div
                                                key="items"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <div className="p-5 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                                            Select Customers for this Bill
                                                        </p>
                                                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md border border-primary/20">
                                                            {selectedCustomers.size} Selected
                                                        </span>
                                                    </div>
                                                    <div className="space-y-3">
                                                        {getCustomersFromTable(selectedTable).map((customer) => {
                                                            const isSelected = selectedCustomers.has(customer.phone);
                                                            const items = mergeDuplicateItems(customer.orders.flatMap((o) => o.items || []));
                                                            return (
                                                                <motion.div
                                                                    whileHover={{ scale: 1.01 }}
                                                                    whileTap={{ scale: 0.99 }}
                                                                    key={customer.phone || customer.name}
                                                                    className={`rounded-2xl border bg-card transition-all duration-300 overflow-hidden ${isSelected
                                                                        ? "border-primary shadow-[0_0_15px_rgba(249,115,22,0.15)] ring-1 ring-primary/20"
                                                                        : "border-border shadow-sm hover:border-primary/40 bg-muted/10"
                                                                        }`}
                                                                >
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => toggleCustomer(customer.phone)}
                                                                        className="w-full text-left"
                                                                    >
                                                                        <div className={`p-4 flex items-start gap-4 ${isSelected ? "bg-primary/5" : ""}`}>
                                                                            <div
                                                                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${isSelected
                                                                                    ? "bg-primary border-primary text-primary-foreground shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                                                                                    : "border-muted-foreground/50 bg-background"
                                                                                    }`}
                                                                            >
                                                                                {isSelected && <Check className="w-3.5 h-3.5" />}
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <div className="flex items-center justify-between mb-1">
                                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                                        <span className="font-bold text-foreground flex items-center gap-1.5 tracking-tight">
                                                                                            <User className="w-4 h-4 text-muted-foreground" />
                                                                                            {customer.name}
                                                                                        </span>
                                                                                        {customer.phone && (
                                                                                            <span className="text-xs font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full flex items-center gap-1">
                                                                                                <Phone className="w-3 h-3" />
                                                                                                {customer.phone}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                    <span className="text-sm font-black text-primary">
                                                                                        {inrFormatter.format(customer.amount)}
                                                                                    </span>
                                                                                </div>

                                                                                <div className="flex flex-wrap gap-1 mb-3">
                                                                                    {customer.orders.map((ord) => {
                                                                                        const cfg = STATUS_LABELS[ord.status] || STATUS_LABELS.PENDING;
                                                                                        return (
                                                                                            <span
                                                                                                key={ord._id}
                                                                                                className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded border ${cfg.color}`}
                                                                                            >
                                                                                                {cfg.label}
                                                                                            </span>
                                                                                        );
                                                                                    })}
                                                                                </div>

                                                                                <div className="bg-background/60 rounded-xl p-3 border border-border/50">
                                                                                    <ul className="space-y-2">
                                                                                        {items.map((it, i) => (
                                                                                            <li key={i} className="flex justify-between items-start text-sm">
                                                                                                <span className="text-foreground font-medium pr-4 leading-tight">
                                                                                                    <span className="text-primary font-bold mr-1.5">{it.quantity}×</span>
                                                                                                    {it.name}
                                                                                                    {it.specialInstructions && (
                                                                                                        <span className="block text-[11px] text-muted-foreground italic mt-0.5">
                                                                                                            {it.specialInstructions}
                                                                                                        </span>
                                                                                                    )}
                                                                                                </span>
                                                                                                <span className="font-semibold text-muted-foreground shrink-0">
                                                                                                    {inrFormatter.format(it.price * it.quantity)}
                                                                                                </span>
                                                                                            </li>
                                                                                        ))}
                                                                                    </ul>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </button>
                                                                </motion.div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                                <div className="p-5 border-t border-border bg-muted/30 pb-safe">
                                                    <div className="flex justify-between items-center bg-background rounded-2xl p-4 border border-border shadow-sm mb-4">
                                                        <div>
                                                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Subtotal Selected</p>
                                                            <div className="text-2xl font-black text-foreground">
                                                                {inrFormatter.format(getSelectedSubtotal())}
                                                            </div>
                                                        </div>
                                                        <motion.button
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            type="button"
                                                            onClick={showPaymentOptions}
                                                            disabled={selectedCustomers.size === 0}
                                                            className="py-3 px-6 rounded-xl bg-primary text-primary-foreground font-black shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                                        >
                                                            Proceed to Pay
                                                            <ChevronRight className="w-5 h-5 ml-1" />
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="payment"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <div className="p-5 border-b border-border bg-primary/5 pb-6">
                                                    <h3 className="text-xs font-bold uppercase text-primary tracking-wider mb-4 opacity-80">Bill Summary</h3>
                                                    <div className="flex items-center justify-between p-4 bg-background border border-border/80 rounded-2xl shadow-sm relative overflow-hidden">
                                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                                <Receipt className="w-5 h-5 text-primary" />
                                                            </div>
                                                            <div>
                                                                <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">Total Amount</span>
                                                                <span className="text-3xl font-black text-foreground">
                                                                    {inrFormatter.format(getSelectedSubtotal())}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-5 space-y-4">
                                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Payment Method</p>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <motion.button
                                                            whileHover={{ scale: 1.03, y: -2 }}
                                                            whileTap={{ scale: 0.97 }}
                                                            type="button"
                                                            onClick={() => handlePaymentSelect("cash")}
                                                            className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 border-border bg-card hover:border-primary hover:shadow-[0_0_20px_rgba(249,115,22,0.15)] transition-all text-center group"
                                                        >
                                                            <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                                                                <Banknote className="w-7 h-7 text-amber-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-extrabold text-foreground text-lg tracking-tight group-hover:text-primary transition-colors">Cash</p>
                                                                <p className="text-[10px] uppercase font-bold text-muted-foreground mt-1 tracking-wider opacity-70">Over the counter</p>
                                                            </div>
                                                        </motion.button>

                                                        <motion.button
                                                            whileHover={{ scale: 1.03, y: -2 }}
                                                            whileTap={{ scale: 0.97 }}
                                                            type="button"
                                                            onClick={() => handlePaymentSelect("online")}
                                                            className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 border-border bg-card hover:border-primary hover:shadow-[0_0_20px_rgba(249,115,22,0.15)] transition-all text-center group"
                                                        >
                                                            <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                                                                <Smartphone className="w-7 h-7 text-emerald-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-extrabold text-foreground text-lg tracking-tight group-hover:text-primary transition-colors">Online</p>
                                                                <p className="text-[10px] uppercase font-bold text-muted-foreground mt-1 tracking-wider opacity-70">UPI • Card • Scan</p>
                                                            </div>
                                                        </motion.button>
                                                    </div>
                                                </div>
                                                <div className="p-5 pt-0 mt-4">
                                                    <button
                                                        type="button"
                                                        onClick={backToItems}
                                                        className="w-full py-3 rounded-xl border border-border text-foreground font-bold hover:bg-muted transition-colors text-sm"
                                                    >
                                                        Back to Customers
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

export default BillingPOS;
