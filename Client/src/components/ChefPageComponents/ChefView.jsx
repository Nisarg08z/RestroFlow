import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { io } from "socket.io-client";
import { getLocationOrders, updateLocationOrderStatus, markOrderAsSeenByChef } from "../../utils/api";
import {
    Loader2,
    ChefHat,
    Clock,
    CheckCircle,
    Flame,
    X,
    UtensilsCrossed,
    Wallet
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useSpring, animated, config } from "@react-spring/web";

const inrFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
});

function playNewOrderSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = 800;
        oscillator.type = "sine";
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) { }
}

const OrderCard = ({ order, onClick, isUnseen, cardClass, badgeClass, keyType }) => {
    const [{ scale, y, shadow }, api] = useSpring(() => ({
        scale: 1,
        y: 0,
        shadow: 0,
        config: config.wobbly
    }));

    return (
        <animated.div
            style={{
                scale,
                y,
                boxShadow: shadow.to(s => `0px ${s}px ${s * 2}px rgba(0,0,0,0.15)`),
                cursor: 'pointer'
            }}
            onClick={onClick}
            onMouseEnter={() => api.start({ scale: 1.02, y: -4, shadow: 12 })}
            onMouseLeave={() => api.start({ scale: 1, y: 0, shadow: 0 })}
            className={`rounded-2xl border overflow-hidden text-left bg-card h-full flex flex-col transition-all duration-300 ${cardClass} ${isUnseen ? 'border-emerald-500/80 ring-2 ring-emerald-400/60 shadow-[0_0_20px_rgba(16,185,129,0.4)] bg-emerald-500/5' : 'border-border/50'}`}
        >
            <div className="p-5 flex-1 flex flex-col relative z-10 bg-gradient-to-br from-background/50 to-transparent">
                <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                            <UtensilsCrossed className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-lg font-bold text-foreground">
                            Table {order.tableNumber}
                        </span>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${badgeClass}`}>
                        {order.status === "SUBMITTED" ? "New" : "Preparing"}
                    </span>
                </div>
                <p className="text-sm font-medium text-muted-foreground mb-4 pl-1">
                    {order.customerName || "Walk-in Customer"}
                </p>
                <div className="flex-1">
                    <ul className="space-y-2.5 mb-4">
                        {(order.items || []).slice(0, 3).map((it, i) => (
                            <li key={i} className="text-sm font-medium text-foreground flex items-start gap-3">
                                <span className="bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded text-xs font-bold min-w-[32px] text-center">
                                    {it.quantity || 1}x
                                </span>
                                <span className="flex-1 leading-snug">{it.name}
                                    {it.specialInstructions && (
                                        <span className="block text-xs text-orange-500/80 italic mt-1 font-normal bg-orange-500/10 px-2 py-1 rounded w-fit">
                                            Note: {it.specialInstructions}
                                        </span>
                                    )}</span>
                            </li>
                        ))}
                        {(order.items || []).length > 3 && (
                            <li className="text-xs font-semibold text-muted-foreground bg-muted border border-border/50 w-max px-2.5 py-1 rounded-full mt-2">
                                +{(order.items || []).length - 3} more items
                            </li>
                        )}
                    </ul>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-border/50 mt-auto">
                    <div className="flex items-center gap-1.5 text-foreground">
                        <Wallet className="w-4 h-4 text-primary/70" />
                        <span className="font-bold text-lg">
                            {inrFormatter.format(order.total || 0)}
                        </span>
                    </div>
                    <motion.span
                        whileHover={{ x: 3 }}
                        className="text-xs font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                    >
                        View Details <span className="text-lg leading-none">&rarr;</span>
                    </motion.span>
                </div>
            </div>
        </animated.div>
    );
};

function OrderDetailModal({ order, tableNumber, onClose, onStatusUpdate, updatingId }) {
    if (!order) return null;
    const items = order.items || [];
    const total =
        order.total ??
        items.reduce(
            (s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 1),
            0
        );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };
    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    const modalContent = (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 md:p-6"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 30, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 30, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden relative"
            >
                <div className="flex items-start justify-between p-6 pb-4 relative z-10 border-b border-border/10 bg-muted/20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                            <UtensilsCrossed className="w-6 h-6 text-orange-500" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-2xl font-black text-foreground tracking-tight">
                                    Table {tableNumber ?? order.tableNumber}
                                </h2>
                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${order.status === "SUBMITTED"
                                    ? "bg-amber-500/15 text-amber-500"
                                    : "bg-blue-500/15 text-blue-500"
                                    }`}>
                                    {order.status === "SUBMITTED" ? "New" : "Preparing"}
                                </span>
                            </div>
                            <p className="text-sm font-semibold text-muted-foreground">
                                {order.customerName || "Walk-in Guest"}
                            </p>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-xl bg-transparent hover:bg-muted text-foreground/70 hover:text-foreground transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </motion.button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4 relative z-10 custom-scrollbar">
                    <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                        Order Items
                    </h3>

                    <motion.ul
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-4"
                    >
                        {items.map((it, i) => (
                            <motion.li
                                variants={itemVariants}
                                key={i}
                                className="flex justify-between gap-4 p-4 rounded-2xl bg-background border border-border/30"
                            >
                                <div className="flex gap-4 items-start">
                                    <div className="bg-muted text-foreground px-3 py-1.5 rounded-xl text-sm font-black min-w-[44px] text-center shadow-sm">
                                        {it.quantity || 1}x
                                    </div>
                                    <div>
                                        <p className="font-bold text-foreground text-[15px] leading-tight mb-1">
                                            {it.name}
                                        </p>
                                        {it.specialInstructions && (
                                            <div className="text-sm font-medium text-orange-500/90 bg-orange-500/10 px-3 py-1.5 rounded-lg w-fit flex items-start gap-1.5">
                                                <span className="italic">"{it.specialInstructions}"</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <span className="font-black text-foreground shrink-0 text-sm flex items-center">
                                    {inrFormatter.format((Number(it.price) || 0) * (Number(it.quantity) || 1))}
                                </span>
                            </motion.li>
                        ))}
                    </motion.ul>
                </div>

                <div className="p-6 pt-0 mt-4 relative z-10 bg-background">
                    <div className="flex justify-between items-center mb-6 px-1">
                        <span className="text-foreground font-bold text-sm">Total Amount</span>
                        <span className="text-orange-500 font-black text-xl tracking-tight">{inrFormatter.format(total)}</span>
                    </div>

                    <div className="flex gap-4">
                        {order.status === "SUBMITTED" && (
                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                disabled={updatingId === order._id}
                                onClick={() => onStatusUpdate(order._id, "PREPARING")}
                                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-orange-500 text-white font-bold shadow-lg shadow-orange-500/25 transition-all outline-none border-none disabled:opacity-50 text-sm"
                            >
                                {updatingId === order._id ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Clock className="w-5 h-5" />
                                )}
                                Start Preparing
                            </motion.button>
                        )}

                        {order.status === "PREPARING" && (
                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                disabled={updatingId === order._id}
                                onClick={() => onStatusUpdate(order._id, "SERVED")}
                                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-green-500 text-white font-bold shadow-lg shadow-green-500/25 transition-all disabled:opacity-50 text-sm"
                            >
                                {updatingId === order._id ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <CheckCircle className="w-5 h-5" />
                                )}
                                Mark as Served
                            </motion.button>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );

    return createPortal(modalContent, document.body);
}

const ChefView = ({ locationId }) => {
    const [loading, setLoading] = useState(true);
    const [kitchenOrders, setKitchenOrders] = useState([]);
    const [updatingId, setUpdatingId] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const socketRef = useRef(null);

    const normalizeOrder = useCallback((o, tableNum) => {
        const total =
            o.total ??
            (o.items || []).reduce(
                (s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 1),
                0
            );
        return { ...o, tableNumber: tableNum ?? o.tableNumber, total };
    }, []);

    const fetchOrders = useCallback(async () => {
        if (!locationId) return;
        try {
            const res = await getLocationOrders(locationId);
            if (res.data?.success) {
                const tables = res.data.data?.tables || [];
                const orders = [];
                tables.forEach((t) => {
                    (t.orders || []).forEach((o) => {
                        if (o.status === "SUBMITTED" || o.status === "PREPARING") {
                            orders.push(normalizeOrder(o, t.tableNumber));
                        }
                    });
                });
                orders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                setKitchenOrders(orders);
            }
        } catch (err) {
            console.error("Failed to fetch kitchen orders", err);
        } finally {
            setLoading(false);
        }
    }, [locationId, normalizeOrder]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    useEffect(() => {
        const socketUrl = import.meta.env.VITE_SOCKET_URL || "";
        if (!socketUrl || !locationId) return;
        const socket = io(socketUrl, { withCredentials: true });
        socketRef.current = socket;
        socket.emit("joinLocation", locationId);

        socket.on("order:new", ({ order }) => {
            if (!order || order.locationId !== locationId) return;
            playNewOrderSound();
            const tableNumber = order.tableNumber ?? 0;
            setKitchenOrders((prev) => {
                const filtered = prev.filter((o) => o._id !== order._id);
                return [normalizeOrder(order, tableNumber), ...filtered].sort(
                    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                );
            });
            toast.success("New order received!");
        });

        socket.on("order:updated", ({ order }) => {
            if (!order || order.locationId !== locationId) return;
            setKitchenOrders((prev) => {
                if (order.status === "SERVED") {
                    setSelectedOrder((s) => (s?._id === order._id ? null : s));
                    return prev.filter((o) => o._id !== order._id);
                }
                const tableNumber = order.tableNumber ?? 0;
                const updated = normalizeOrder(order, tableNumber);
                const next = prev.map((o) => (o._id === order._id ? updated : o));
                if (!prev.some((o) => o._id === order._id)) next.push(updated);
                return next.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            });
            setSelectedOrder((s) => (s?._id === order._id ? normalizeOrder(order, order.tableNumber) : s));
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [locationId, normalizeOrder]);

    const handleStatusUpdate = async (orderId, newStatus) => {
        setUpdatingId(orderId);
        try {
            await updateLocationOrderStatus(locationId, orderId, newStatus);
            toast.success(
                newStatus === "PREPARING" ? "Order started" : "Order marked as complete"
            );
            setSelectedOrder(null);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to update order");
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading && kitchenOrders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-6">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                >
                    <Loader2 className="w-12 h-12 text-primary" />
                </motion.div>
                <p className="text-base font-medium text-muted-foreground animate-pulse">Loading amazing tools for the chef…</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <div className="flex items-center justify-between bg-card p-6 rounded-2xl border border-border shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-orange-500/10 p-3 rounded-xl border border-orange-500/20">
                        <Flame className="w-8 h-8 text-orange-500" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-foreground">Kitchen Dashboard</h2>
                        {kitchenOrders.length > 0 ? (
                            <p className="text-sm font-medium text-muted-foreground mt-1">
                                {kitchenOrders.length} active order{kitchenOrders.length !== 1 ? 's' : ''} right now
                            </p>
                        ) : (
                            <p className="text-sm font-medium text-muted-foreground mt-1">
                                Kitchen is quiet...
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {kitchenOrders.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-24 px-4 text-center bg-card rounded-2xl border border-border border-dashed"
                >
                    <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mb-6 shadow-inner border border-primary/20">
                        <ChefHat className="w-12 h-12 text-primary opacity-80" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Ready for Action</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                        No active orders right now. When customers place an order, it will appear here immediately.
                    </p>
                </motion.div>
            ) : (
                <div className="space-y-10">
                    {[
                        {
                            key: "submitted",
                            label: "New Orders (Waiting)",
                            orders: kitchenOrders.filter((o) => o.status === "SUBMITTED"),
                            color: "bg-amber-500/10 text-amber-600 border-amber-500/30",
                            cardClass: "border-border/50 bg-gradient-to-br from-card to-amber-500/5 hover:border-amber-500/40",
                            badgeClass: "bg-amber-500/15 text-amber-600 border border-amber-500/20",
                            icon: Clock,
                        },
                        {
                            key: "preparing",
                            label: "In Progress (Preparing)",
                            orders: kitchenOrders.filter((o) => o.status === "PREPARING"),
                            color: "bg-blue-500/10 text-blue-600 border-blue-500/30",
                            cardClass: "border-border/50 bg-gradient-to-br from-card to-blue-500/5 hover:border-blue-500/40",
                            badgeClass: "bg-blue-500/15 text-blue-600 border border-blue-500/20",
                            icon: Flame,
                        },
                    ].map(({ key, label, orders, color, cardClass, badgeClass, icon: Icon }) =>
                        orders.length > 0 ? (
                            <motion.section
                                key={key}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ staggerChildren: 0.1 }}
                            >
                                <div className="flex items-center gap-3 mb-6 relative">
                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${color} shadow-sm backdrop-blur-sm`}>
                                        <Icon className="w-5 h-5" />
                                        <span className="font-bold">{label}</span>
                                    </div>
                                    <span className="text-sm font-bold text-muted-foreground bg-muted px-2 py-1 rounded-md">
                                        {orders.length}
                                    </span>
                                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-border/50 -z-10" />
                                </div>

                                <motion.div
                                    className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                                    layout
                                >
                                    <AnimatePresence>
                                        {orders.map((order) => {
                                            const isUnseen = !order.chefViewedAt;
                                            return (
                                                <motion.div
                                                    key={order._id}
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    transition={{ type: "spring", bounce: 0.3 }}
                                                >
                                                    <OrderCard
                                                        order={order}
                                                        isUnseen={isUnseen}
                                                        cardClass={cardClass}
                                                        badgeClass={badgeClass}
                                                        keyType={key}
                                                        onClick={async () => {
                                                            if (!order.chefViewedAt) {
                                                                try {
                                                                    await markOrderAsSeenByChef(locationId, order._id);
                                                                    setKitchenOrders((prev) =>
                                                                        prev.map((o) =>
                                                                            o._id === order._id
                                                                                ? { ...o, chefViewedAt: new Date().toISOString() }
                                                                                : o
                                                                        )
                                                                    );
                                                                } catch (err) {
                                                                    console.error("Failed to mark order as seen", err);
                                                                }
                                                            }
                                                            setSelectedOrder(order);
                                                        }}
                                                    />
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </motion.div>
                            </motion.section>
                        ) : null
                    )}
                </div>
            )}

            <AnimatePresence>
                {selectedOrder && (
                    <OrderDetailModal
                        order={selectedOrder}
                        tableNumber={selectedOrder.tableNumber}
                        onClose={() => setSelectedOrder(null)}
                        onStatusUpdate={handleStatusUpdate}
                        updatingId={updatingId}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ChefView;

