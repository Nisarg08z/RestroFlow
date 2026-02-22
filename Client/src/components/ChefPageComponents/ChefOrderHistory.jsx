import React, { useState, useEffect } from "react";
import { getLocationOrders } from "../../utils/api";
import { Loader2, History, CheckCircle2, Clock, CheckCheck, User, ReceiptText } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, x: -20, scale: 0.95 },
    show: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 300, damping: 24 },
    },
};

const inrFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
});

const isToday = (date) => {
    const d = new Date(date);
    const today = new Date();
    return d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate();
};

const ChefOrderHistory = ({ locationId }) => {
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        getLocationOrders(locationId)
            .then((res) => {
                if (cancelled) return;
                const data = res.data?.data ?? res.data;
                const tables = data?.tables ?? [];

                // Flatten and tag all orders
                const allOrders = tables.flatMap((t) =>
                    (t.orders || []).map((o) => ({ ...o, tableNumber: t.tableNumber }))
                );

                // Filter only SERVED items from TODAY
                const todayServed = allOrders.filter(
                    (o) => o.status === "SERVED" && isToday(o.updatedAt || o.createdAt)
                );

                // Sort newest completed first
                todayServed.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

                setOrders(todayServed);
            })
            .catch(() => {
                if (!cancelled) toast.error("Failed to load order history");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [locationId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-lg font-medium text-muted-foreground animate-pulse">Loading today's logs...</p>
            </div>
        );
    }

    const totalServedItems = orders.reduce((acc, order) => {
        return acc + (order.items || []).reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
    }, 0);

    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-12">

            {/* Header Stats Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-card/60 backdrop-blur-md p-6 rounded-3xl border border-border/50 shadow-sm"
            >
                <div className="space-y-1 w-full sm:w-auto text-center sm:text-left">
                    <h2 className="text-2xl font-bold text-foreground tracking-tight">Today's Fulfillment Log</h2>
                    <p className="text-base text-muted-foreground leading-relaxed">
                        A historical record of all orders successfully marked as served today.
                    </p>
                </div>

                {/* Quick Stats Pill */}
                {orders.length > 0 && (
                    <div className="flex items-center gap-4 bg-background p-3 rounded-2xl border border-border/60 shrink-0 w-full sm:w-auto overflow-x-auto scrollbar-hide">
                        <div className="flex flex-col px-3 border-r border-border/50 shrink-0">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Orders</span>
                            <span className="text-xl font-black text-foreground">{orders.length}</span>
                        </div>
                        <div className="flex flex-col px-3 shrink-0">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dishes Served</span>
                            <span className="text-xl font-black text-primary">{totalServedItems}</span>
                        </div>
                    </div>
                )}
            </motion.div>

            {orders.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-24 rounded-[2.5rem] bg-gradient-to-b from-card to-background border-2 border-dashed border-border/60"
                >
                    <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                        <History className="w-12 h-12 text-muted-foreground opacity-50" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">No History Yet</h3>
                    <p className="text-muted-foreground max-w-sm text-center">
                        You haven't completed any orders yet today. Orders will appear here once you mark them as 'Served' from the Live Kitchen.
                    </p>
                </motion.div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="relative pl-4 sm:pl-0"
                >
                    {/* Vertical Timeline Line (Visible only on desktop) */}
                    <div className="hidden sm:block absolute top-4 bottom-4 left-8 w-0.5 bg-gradient-to-b from-primary/50 via-border to-transparent rounded-full" />

                    <AnimatePresence>
                        <div className="space-y-6">
                            {orders.map((order) => {
                                const total = order.total ?? (order.items || []).reduce(
                                    (s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 1),
                                    0
                                );

                                const timestamp = new Date(order.updatedAt || order.createdAt);
                                const timeStr = timestamp.toLocaleTimeString("en-IN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                });

                                return (
                                    <motion.div
                                        key={order._id}
                                        variants={itemVariants}
                                        layout
                                        className="relative flex items-stretch gap-6 group"
                                    >
                                        {/* Desktop Timeline Node */}
                                        <div className="hidden sm:flex flex-col items-center pt-5 w-16 shrink-0 relative z-10">
                                            <div className="w-10 h-10 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center shadow-sm backdrop-blur-md group-hover:scale-110 group-hover:bg-green-500/20 transition-all duration-300">
                                                <CheckCheck className="w-5 h-5 text-green-600" />
                                            </div>
                                        </div>

                                        {/* Order Card */}
                                        <div className="flex-1 bg-card border border-border hover:border-border/80 rounded-3xl p-5 sm:p-6 transition-all duration-300 hover:shadow-xl hover:shadow-black/5 group-hover:-translate-y-1">

                                            {/* Card Header */}
                                            <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-4 border-b border-border/50">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <div className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-xl font-bold tracking-tight shadow-sm">
                                                        Table {order.tableNumber}
                                                    </div>

                                                    {order.customerName && (
                                                        <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-xl">
                                                            <User className="w-4 h-4" />
                                                            {order.customerName}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 text-sm font-bold text-green-600 bg-green-500/10 px-3 py-1.5 rounded-xl border border-green-500/20 shadow-sm shrink-0">
                                                    <Clock className="w-4 h-4" />
                                                    {timeStr}
                                                </div>
                                            </div>

                                            {/* Order Contents */}
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                                                <ul className="flex-1 space-y-2.5 w-full">
                                                    {(order.items || []).map((it, i) => (
                                                        <li key={i} className="flex items-start gap-3">
                                                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                                                            <div className="flex-1 min-w-0">
                                                                <span className="font-semibold text-foreground break-words leading-tight">{it.name}</span>
                                                                <span className="ml-2 text-sm font-bold text-muted-foreground tracking-tight">× {it.quantity || 1}</span>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>

                                                {/* Price block */}
                                                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto p-4 sm:p-0 bg-muted/30 sm:bg-transparent rounded-2xl border sm:border-transparent border-border/50 shrink-0 sm:min-w-[120px]">
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-widest sm:mb-1">
                                                        <ReceiptText className="w-4 h-4" />
                                                        Total
                                                    </div>
                                                    <div className="text-2xl sm:text-3xl font-black text-foreground tracking-tighter">
                                                        {inrFormatter.format(total)}
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    );
};

export default ChefOrderHistory;
