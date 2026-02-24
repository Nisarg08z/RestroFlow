import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getLocationPaidOrders } from "../../../utils/api";
import { Loader2, Receipt, Banknote, Calendar, User, Phone, X, ChevronRight, FilterX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
const POLL_INTERVAL_MS = 10000;
const inrFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
});

/** Merge duplicate items (same name, price, instructions) and sum quantities */
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

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.05 }
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

function PaidOrderCard({ entry, onClick }) {
    const orders = entry.orders || [];
    const amount = entry.amount ?? orders.reduce((s, o) => s + (o.total || 0), 0);
    const paidAt = entry.paidAt ? new Date(entry.paidAt) : null;
    const { tableNumber, customerName, customerPhone } = entry;

    return (
        <motion.button
            variants={itemVariants}
            type="button"
            onClick={() => onClick(entry)}
            className="group relative text-left rounded-3xl border border-border/60 bg-card overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-6">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner group-hover:scale-105 transition-transform duration-300">
                            <span className="text-xl font-bold text-primary">
                                T{tableNumber}
                            </span>
                        </div>
                        <div>
                            <p className="font-bold text-foreground tracking-tight">Table {tableNumber}</p>
                            <p className="text-2xl font-black text-primary mt-0.5 tracking-tight group-hover:text-primary/80 transition-colors">
                                {inrFormatter.format(amount)}
                            </p>
                            {paidAt && (
                                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border mt-1.5 inline-block transition-colors bg-primary/10 text-primary border-primary/20`}>
                                    Paid {paidAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
                    </div>
                </div>
                <div className="mt-5 pt-4 border-t border-border/50 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1.5 text-foreground font-semibold">
                            <User className="w-4 h-4 text-muted-foreground/70" />
                            {customerName || "—"}
                        </span>
                        <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                            <Phone className="w-4 h-4 text-muted-foreground/70" />
                            {customerPhone || "—"}
                        </span>
                    </div>
                </div>
            </div>
        </motion.button>
    );
}

const OrdersView = ({ locationId }) => {
    const [loading, setLoading] = useState(true);
    const [paidTables, setPaidTables] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const fetchPaidOrders = useCallback(async () => {
        if (!locationId) return;
        try {
            const res = await getLocationPaidOrders(locationId);
            if (res.data?.success) {
                setPaidTables(res.data.data?.tables || []);
            }
        } catch (err) {
            console.error("Failed to fetch paid orders", err);
        } finally {
            setLoading(false);
        }
    }, [locationId]);

    const groupedOrders = useMemo(() => {
        const groups = {};
        paidTables.forEach(order => {
            const dateStr = order.paidAt ? new Date(order.paidAt).toLocaleDateString("en-US", {
                weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
            }) : "Unknown Date";

            if (!groups[dateStr]) {
                groups[dateStr] = [];
            }
            groups[dateStr].push(order);
        });

        return Object.entries(groups).map(([date, orders]) => ({ date, orders }));
    }, [paidTables]);

    useEffect(() => {
        fetchPaidOrders();
    }, [fetchPaidOrders]);

    useEffect(() => {
        const t = setInterval(fetchPaidOrders, POLL_INTERVAL_MS);
        return () => clearInterval(t);
    }, [fetchPaidOrders]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Loading paid orders…</p>
            </div>
        );
    }

    if (!paidTables?.length) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-24 px-4 text-center border-2 border-dashed border-border/60 rounded-3xl bg-card/30 mt-6"
            >
                <div className="w-20 h-20 rounded-[2rem] bg-primary/10 flex items-center justify-center mb-6 shadow-inner">
                    <Receipt className="w-10 h-10 text-primary opacity-80" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">No Paid Orders</h3>
                <p className="text-base text-muted-foreground font-medium max-w-sm">
                    When you complete payment for a table in Billing, the receipt will appear here.
                </p>
            </motion.div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <section>
                <div className="flex items-center gap-2 mb-8">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-primary bg-primary/10 border-primary/20">
                        <Banknote className="w-4 h-4" />
                        <span className="font-semibold text-sm">Paid orders</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">
                        ({paidTables.length} order{paidTables.length !== 1 ? "s" : ""})
                    </span>
                </div>

                {groupedOrders.map((group, groupIdx) => (
                    <div key={group.date} className="mb-10 last:mb-0">
                        <div className="relative flex items-center mb-6">
                            <div className="flex-grow border-t border-border/60"></div>
                            <span className="flex-shrink-0 mx-4 text-xs font-bold text-muted-foreground uppercase tracking-widest bg-background px-4 py-1.5 rounded-full border border-border/40 shadow-sm">
                                {group.date}
                            </span>
                            <div className="flex-grow border-t border-border/60"></div>
                        </div>
                        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {group.orders.map((entry, idx) => (
                                <PaidOrderCard
                                    key={`${entry.tableNumber}-${entry.customerPhone}-${idx}`}
                                    entry={entry}
                                    onClick={setSelectedOrder}
                                />
                            ))}
                        </motion.div>
                    </div>
                ))}
            </section>

            {createPortal(
                <AnimatePresence>
                    {selectedOrder && (
                        <motion.div
                            variants={backdropVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            onClick={() => setSelectedOrder(null)}
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
                                                Table {selectedOrder.tableNumber}
                                            </h2>
                                            <p className="text-sm font-medium text-muted-foreground">
                                                Paid Order Details
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedOrder(null)}
                                        className="p-2.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors bg-background border border-border/50 shadow-sm hover:scale-105 active:scale-95"
                                        aria-label="Close"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="w-full shrink overflow-y-auto custom-scrollbar p-5">
                                    <div className="flex items-start justify-between mb-5">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Customer info</span>
                                            <div className="flex flex-col gap-1 text-sm font-semibold text-foreground mt-0.5">
                                                <span className="flex items-center gap-2"><User className="w-4 h-4 text-muted-foreground" /> {selectedOrder.customerName || "—"}</span>
                                                <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /> {selectedOrder.customerPhone || "—"}</span>
                                            </div>
                                        </div>
                                        {selectedOrder.paidAt && (
                                            <div className="text-right flex flex-col items-end gap-1.5">
                                                <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Paid at</span>
                                                <span className="text-sm font-semibold text-foreground flex items-center justify-end gap-1 mt-0.5 bg-muted/50 px-2.5 py-1 rounded-lg">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(selectedOrder.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-muted/10 rounded-2xl border border-border/60 overflow-hidden mt-2">
                                        <div className="px-4 py-3 bg-muted/30 border-b border-border/50 text-xs uppercase font-bold tracking-wider text-muted-foreground">Order Items</div>
                                        <ul className="divide-y divide-border/50">
                                            {mergeDuplicateItems((selectedOrder.orders || []).flatMap((o) => o.items || [])).map((it, i) => (
                                                <li key={i} className="flex justify-between items-start text-sm p-4 hover:bg-muted/10 transition-colors">
                                                    <span className="text-foreground font-semibold leading-tight pr-4">
                                                        <span className="text-primary font-black mr-2">{it.quantity}×</span>
                                                        {it.name}
                                                        {it.specialInstructions && (
                                                            <span className="block text-[11px] text-muted-foreground font-medium italic mt-1.5 p-1.5 bg-background rounded-md border border-border/40">
                                                                Note: {it.specialInstructions}
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span className="font-bold text-foreground shrink-0 mt-0.5 bg-muted/30 px-2 py-0.5 rounded-md">
                                                        {inrFormatter.format(it.price * it.quantity)}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="mt-5 p-4 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-between relative overflow-hidden shadow-sm">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Banknote className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold text-primary/70 uppercase tracking-wider block">Total Amount Paid</span>
                                                <span className="text-2xl font-black text-foreground">
                                                    {inrFormatter.format(selectedOrder.amount ?? (selectedOrder.orders || []).reduce((s, o) => s + (o.total || 0), 0))}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
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

export default OrdersView;
