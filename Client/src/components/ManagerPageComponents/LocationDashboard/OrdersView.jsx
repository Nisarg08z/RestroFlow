import React, { useState, useEffect, useCallback } from "react";
import { getLocationPaidOrders } from "../../../utils/api";
import { Loader2, Receipt, ChevronDown, ChevronUp, Banknote, Calendar, User, Phone } from "lucide-react";

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

function PaidOrderCard({ entry }) {
    const [expanded, setExpanded] = useState(false);
    const orders = entry.orders || [];
    const amount = entry.amount ?? orders.reduce((s, o) => s + (o.total || 0), 0);
    const paidAt = entry.paidAt ? new Date(entry.paidAt) : null;
    const { tableNumber, customerName, customerPhone } = entry;

    return (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
            <button
                type="button"
                onClick={() => setExpanded((e) => !e)}
                className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
            >
                <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold text-emerald-600 bg-emerald-500/10 border-emerald-500/20">
                            <Banknote className="w-3.5 h-3.5" />
                            Paid
                        </div>
                        <span className="font-semibold text-foreground">Table {tableNumber}</span>
                        {paidAt && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {paidAt.toLocaleString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm">
                        <span className="flex items-center gap-1 text-foreground font-medium">
                            <User className="w-3.5 h-3.5 text-muted-foreground" />
                            {customerName || "—"}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                            <Phone className="w-3.5 h-3.5" />
                            {customerPhone || "—"}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-primary">{inrFormatter.format(amount)}</span>
                    {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
            </button>
            {expanded && (
                <div className="px-4 pb-4 pt-0 border-t border-border/50">
                    <ul className="mt-3 space-y-2">
                        {mergeDuplicateItems(orders.flatMap((o) => o.items || [])).map((it, i) => (
                            <li key={i} className="flex justify-between text-sm">
                                <span className="text-foreground">
                                    {it.name} × {it.quantity}
                                    {it.specialInstructions && (
                                        <span className="text-muted-foreground italic ml-1">({it.specialInstructions})</span>
                                    )}
                                </span>
                                <span className="font-medium text-foreground">
                                    {inrFormatter.format(it.price * it.quantity)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

const OrdersView = ({ locationId }) => {
    const [loading, setLoading] = useState(true);
    const [paidTables, setPaidTables] = useState([]);

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
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                <Receipt className="w-16 h-16 text-muted-foreground opacity-40 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-1">No paid orders yet</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                    When you complete payment for a table in Billing, it will appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-emerald-600 bg-emerald-500/10 border-emerald-500/20">
                        <Banknote className="w-4 h-4" />
                        <span className="font-semibold text-sm">Paid orders</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                        ({paidTables.length} paid order{paidTables.length !== 1 ? "s" : ""})
                    </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {paidTables.map((entry, idx) => (
                        <PaidOrderCard
                            key={`${entry.tableNumber}-${entry.customerPhone}-${idx}`}
                            entry={entry}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default OrdersView;
