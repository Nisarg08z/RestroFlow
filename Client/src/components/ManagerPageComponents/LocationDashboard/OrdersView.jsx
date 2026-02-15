import React, { useState, useEffect, useCallback } from "react";
import { getLocationOrders } from "../../../utils/api";
import { Loader2, Receipt, Clock, ChefHat, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";

const POLL_INTERVAL_MS = 5000;
const inrFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
});

const STATUS_GROUP = {
    pending: { label: "Pending (in cart)", statuses: ["PENDING"], icon: Clock, color: "text-amber-600 bg-amber-500/10 border-amber-500/20" },
    inProgress: { label: "In kitchen", statuses: ["SUBMITTED", "PREPARING"], icon: ChefHat, color: "text-blue-600 bg-blue-500/10 border-blue-500/20" },
    served: { label: "Served", statuses: ["SERVED"], icon: CheckCircle, color: "text-green-600 bg-green-500/10 border-green-500/20" },
};

function OrderCard({ order, tableNumber }) {
    const [expanded, setExpanded] = useState(true);
    const items = order.items || [];
    const total = order.total ?? items.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0);
    const statusConfig = Object.values(STATUS_GROUP).find((g) => g.statuses.includes(order.status)) || STATUS_GROUP.pending;
    const Icon = statusConfig.icon;

    return (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
            <button
                type="button"
                onClick={() => setExpanded((e) => !e)}
                className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${statusConfig.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {order.status}
                    </div>
                    <span className="font-semibold text-foreground">Table {tableNumber}</span>
                    <span className="text-sm text-muted-foreground truncate">{order.customerName}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-primary">{inrFormatter.format(total)}</span>
                    {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
            </button>
            {expanded && (
                <div className="px-4 pb-4 pt-0 border-t border-border/50">
                    <ul className="mt-3 space-y-2">
                        {(order.items || []).map((it, i) => (
                            <li key={i} className="flex justify-between text-sm">
                                <span className="text-foreground">
                                    {it.name} × {it.quantity || 1}
                                    {it.specialInstructions && <span className="text-muted-foreground italic ml-1">({it.specialInstructions})</span>}
                                </span>
                                <span className="font-medium text-foreground">
                                    {inrFormatter.format((Number(it.price) || 0) * (Number(it.quantity) || 1))}
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
    const [tables, setTables] = useState([]);

    const fetchOrders = useCallback(async () => {
        if (!locationId) return;
        try {
            const res = await getLocationOrders(locationId);
            if (res.data?.success) {
                setTables(res.data.data?.tables || []);
            }
        } catch (err) {
            console.error("Failed to fetch orders", err);
        } finally {
            setLoading(false);
        }
    }, [locationId]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    useEffect(() => {
        const t = setInterval(fetchOrders, POLL_INTERVAL_MS);
        return () => clearInterval(t);
    }, [fetchOrders]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Loading orders…</p>
            </div>
        );
    }

    const tablesWithOrders = tables.filter((t) => t.orders?.length > 0);
    const ordersByGroup = { pending: [], inProgress: [], served: [] };
    tablesWithOrders.forEach((table) => {
        (table.orders || []).forEach((order) => {
            if (STATUS_GROUP.pending.statuses.includes(order.status)) ordersByGroup.pending.push({ table, order });
            else if (STATUS_GROUP.inProgress.statuses.includes(order.status)) ordersByGroup.inProgress.push({ table, order });
            else if (STATUS_GROUP.served.statuses.includes(order.status)) ordersByGroup.served.push({ table, order });
        });
    });

    const hasAny = ordersByGroup.pending.length > 0 || ordersByGroup.inProgress.length > 0 || ordersByGroup.served.length > 0;

    if (!hasAny) {
        return (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                <Receipt className="w-16 h-16 text-muted-foreground opacity-40 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-1">No orders yet</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                    When customers place orders from the table menu, they will appear here by status.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {(Object.entries(STATUS_GROUP)).map(([key, config]) => {
                const list = ordersByGroup[key];
                if (!list?.length) return null;
                const Icon = config.icon;
                return (
                    <section key={key}>
                        <div className="flex items-center gap-2 mb-4">
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${config.color}`}>
                                <Icon className="w-4 h-4" />
                                <span className="font-semibold text-sm">{config.label}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">({list.length} order{list.length !== 1 ? "s" : ""})</span>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {list.map(({ table, order }) => (
                                <OrderCard key={order._id} order={order} tableNumber={table.tableNumber} />
                            ))}
                        </div>
                    </section>
                );
            })}
        </div>
    );
};

export default OrdersView;
