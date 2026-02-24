import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Receipt, ChefHat, CheckCircle, Clock, UtensilsCrossed } from "lucide-react";

const STATUS_CONFIG = {
    PENDING: { label: "In cart", icon: Receipt, className: "bg-muted/50 text-muted-foreground border-border/50" },
    SUBMITTED: { label: "Sent to kitchen", icon: Clock, className: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
    PREPARING: { label: "Preparing", icon: ChefHat, className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    SERVED: { label: "Served", icon: CheckCircle, className: "bg-green-500/10 text-green-500 border-green-500/20" },
    PAID: { label: "Paid", icon: CheckCircle, className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
    CANCELLED: { label: "Cancelled", icon: Receipt, className: "bg-red-500/10 text-red-500 border-red-500/20" },
};

const OrderStatusStep = ({ data, tableNumber, customerName, previousOrders, sessionStartTime, inrFormatter, onGoToMenu }) => {
    const trackOrders = useMemo(() => {
        if (!previousOrders || previousOrders.length === 0) return [];
        const today = new Date();
        const sessionStart = sessionStartTime
            ? new Date(sessionStartTime)
            : new Date(today.getFullYear(), today.getMonth(), today.getDate());

        return previousOrders
            .filter((order) => {
                if (!order.createdAt) return false;
                if (order.status === "PENDING") return false;
                if (order.status === "PAID") return false;
                const orderDate = new Date(order.createdAt);
                return orderDate >= sessionStart;
            })
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [previousOrders, sessionStartTime]);

    const hasOrders = trackOrders.length > 0;

    return (
        <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
            {/* Atmospheric Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />
            <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-primary/10 rounded-full blur-[100px] pointer-events-none transform translate-x-1/2 -translate-y-1/2" />

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 border-b border-border/50 bg-card/80 backdrop-blur-xl relative z-10 shadow-sm"
            >
                <div className="max-w-lg mx-auto w-full">
                    <h1 className="text-2xl font-black text-foreground tracking-tight truncate">
                        {data?.restaurantName}
                    </h1>
                    <div className="flex items-center gap-2 mt-1.5">
                        <p className="text-sm font-medium text-muted-foreground truncate">
                            {data?.locationName}
                        </p>
                        <span className="text-muted-foreground/40">•</span>
                        <span className="text-sm text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-md">
                            Table {tableNumber}
                        </span>
                    </div>
                    {customerName && (
                        <p className="text-sm font-medium mt-1 text-primary">Hi, {customerName}!</p>
                    )}
                </div>
            </motion.div>

            <main className="flex-1 px-4 py-8 max-w-lg mx-auto w-full space-y-8 relative z-10 flex flex-col">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-3"
                >
                    <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20">
                        <Receipt className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground tracking-tight">Your orders</h2>
                </motion.div>

                {!hasOrders ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="rounded-[2rem] border border-border/50 bg-card/60 backdrop-blur-lg p-10 text-center shadow-lg flex-1 flex flex-col justify-center max-h-[40vh]"
                    >
                        <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-border/50">
                            <Receipt className="w-10 h-10 text-muted-foreground opacity-50" />
                        </div>
                        <p className="text-xl font-bold text-foreground">No orders yet</p>
                        <p className="text-muted-foreground font-medium mt-2 max-w-[250px] mx-auto">
                            Your active orders will appear here once submitted to the kitchen.
                        </p>
                    </motion.div>
                ) : (
                    <div className="space-y-5 flex-1 overflow-y-auto custom-scrollbar pb-4 pr-1">
                        {trackOrders.map((order, index) => {
                            const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                            const Icon = config.icon;
                            const orderDate = new Date(order.createdAt);
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
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + index * 0.1 }}
                                    key={order._id}
                                    className="rounded-[1.5rem] border border-border/60 bg-card/80 backdrop-blur-md overflow-hidden shadow-md hover:shadow-lg transition-all hover:border-border"
                                >
                                    <div className="p-5">
                                        <div className="flex items-start justify-between gap-2 mb-4">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-foreground/80">
                                                    Order at {timeStr}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-0.5 truncate uppercase tracking-wider">
                                                    ID: {order._id.slice(-6)}
                                                </p>
                                            </div>
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 border uppercase tracking-wide ${config.className}`}
                                            >
                                                <Icon className="w-3.5 h-3.5" />
                                                {config.label}
                                            </span>
                                        </div>

                                        <ul className="space-y-3 pt-3 border-t border-border/50">
                                            {(order.items || []).map((item, i) => (
                                                <li
                                                    key={i}
                                                    className="flex justify-between items-start gap-4 text-sm text-foreground bg-background/40 p-3 rounded-xl border border-border/30"
                                                >
                                                    <div className="flex-1">
                                                        <span className="font-semibold">{item.name}</span>
                                                        {item.specialInstructions && (
                                                            <div className="text-xs text-primary/80 mt-1 font-medium bg-primary/5 inline-block px-2 py-0.5 rounded-md">
                                                                Note: {item.specialInstructions}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 font-bold bg-muted/50 px-2 py-1 rounded-lg text-sm shrink-0">
                                                        <span>x{item.quantity}</span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="pt-4 border-t border-border/60 flex justify-between items-center mt-4">
                                            <span className="font-semibold text-foreground">Total</span>
                                            <span className="text-xl font-black text-primary">
                                                {inrFormatter.format(total)}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="pt-4 sticky bottom-6"
                >
                    <button
                        type="button"
                        onClick={onGoToMenu}
                        className="w-full flex items-center justify-center gap-3 py-4 sm:py-5 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-xl shadow-primary/30 hover:bg-primary/95 transition-all group relative overflow-hidden active:scale-[0.98]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] transition-transform" />
                        <UtensilsCrossed className="w-5 h-5 z-10 group-hover:rotate-12 transition-transform" />
                        <span className="z-10">{hasOrders ? "Want anything else?" : "See menu & order"}</span>
                    </button>
                </motion.div>
            </main>
        </div>
    );
};

export default OrderStatusStep;
