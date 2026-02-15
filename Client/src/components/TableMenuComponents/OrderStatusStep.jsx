import React, { useMemo } from "react";
import { Receipt, ChefHat, CheckCircle, Clock, UtensilsCrossed } from "lucide-react";

const STATUS_CONFIG = {
    PENDING: { label: "In cart", icon: Receipt, className: "bg-muted text-muted-foreground" },
    SUBMITTED: { label: "Sent to kitchen", icon: Clock, className: "bg-amber-500/15 text-amber-700" },
    PREPARING: { label: "Preparing", icon: ChefHat, className: "bg-blue-500/15 text-blue-700" },
    SERVED: { label: "Served", icon: CheckCircle, className: "bg-green-500/15 text-green-700" },
    CANCELLED: { label: "Cancelled", icon: Receipt, className: "bg-red-500/15 text-red-700" },
};

const OrderStatusStep = ({ data, tableNumber, customerName, previousOrders, inrFormatter, onGoToMenu }) => {
    const todayOrders = useMemo(() => {
        if (!previousOrders || previousOrders.length === 0) return [];
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        return previousOrders
            .filter((order) => {
                if (!order.createdAt) return false;
                const orderDate = new Date(order.createdAt);
                return orderDate >= todayStart;
            })
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [previousOrders]);

    const hasOrders = todayOrders.length > 0;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <div className="p-4 border-b border-border bg-card">
                <h1 className="text-xl font-bold text-foreground truncate">
                    {data?.restaurantName}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    {data?.locationName} · Table {tableNumber}
                </p>
                {customerName && (
                    <p className="text-sm text-primary font-medium mt-1">Hi, {customerName}</p>
                )}
            </div>

            <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full space-y-6">
                <div className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-bold text-foreground">Your orders</h2>
                </div>

                {!hasOrders ? (
                    <div className="rounded-xl border border-border bg-card p-6 text-center">
                        <p className="text-muted-foreground">No orders yet.</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Tap below to see the menu and order.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {todayOrders.map((order) => {
                            const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                            const Icon = config.icon;
                            const orderDate = new Date(order.createdAt);
                            const dateStr = orderDate.toLocaleDateString("en-IN", {
                                month: "short",
                                day: "numeric",
                            });
                            const timeStr = orderDate.toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                            });
                            const total =
                                order.total ??
                                (order.items || []).reduce(
                                    (s, it) =>
                                        s + (Number(it.price) || 0) * (Number(it.quantity) || 1),
                                    0
                                );
                            return (
                                <div
                                    key={order._id}
                                    className="rounded-xl border border-border bg-card overflow-hidden"
                                >
                                    <div className="p-4">
                                        <div className="flex items-start justify-between gap-2 mb-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-muted-foreground">
                                                    {dateStr} at {timeStr}
                                                </p>
                                            </div>
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 ${config.className}`}
                                            >
                                                <Icon className="w-3.5 h-3.5" />
                                                {config.label}
                                            </span>
                                        </div>
                                        <ul className="space-y-1.5 pt-2 border-t border-border/50">
                                            {(order.items || []).map((item, i) => (
                                                <li
                                                    key={i}
                                                    className="flex justify-between text-sm text-foreground"
                                                >
                                                    <span>
                                                        {item.name}
                                                        {item.quantity > 1 && (
                                                            <span className="text-muted-foreground ml-1">
                                                                × {item.quantity}
                                                            </span>
                                                        )}
                                                        {item.specialInstructions && (
                                                            <span className="text-muted-foreground italic ml-1">
                                                                (+ note)
                                                            </span>
                                                        )}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="pt-2 border-t border-border flex justify-between font-semibold mt-2">
                                            <span>Total</span>
                                            <span className="text-primary">
                                                {inrFormatter.format(total)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <button
                    type="button"
                    onClick={onGoToMenu}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg hover:bg-primary/90 transition-colors"
                >
                    <UtensilsCrossed className="w-5 h-5" />
                    {hasOrders ? "Want anything else?" : "See menu & order"}
                </button>
            </main>
        </div>
    );
};

export default OrderStatusStep;
