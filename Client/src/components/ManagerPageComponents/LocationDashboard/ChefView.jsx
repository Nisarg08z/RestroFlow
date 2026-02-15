import React, { useState, useEffect, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import { getLocationOrders, updateLocationOrderStatus } from "../../../utils/api";
import {
    Loader2,
    ChefHat,
    Clock,
    CheckCircle,
    Flame,
    X,
    UtensilsCrossed,
} from "lucide-react";
import { toast } from "react-hot-toast";

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
    } catch (_) {}
}

function OrderDetailModal({ order, tableNumber, onClose, onStatusUpdate, updatingId }) {
    if (!order) return null;
    const items = order.items || [];
    const total =
        order.total ??
        items.reduce(
            (s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 1),
            0
        );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <UtensilsCrossed className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground">
                                Table {tableNumber ?? order.tableNumber}
                            </h2>
                            <p className="text-xs text-muted-foreground">{order.customerName}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-muted text-foreground"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            order.status === "SUBMITTED"
                                ? "bg-amber-500/20 text-amber-700"
                                : "bg-blue-500/20 text-blue-700"
                        }`}
                    >
                        {order.status === "SUBMITTED" ? "New order" : "Preparing"}
                    </div>
                    <ul className="space-y-3">
                        {items.map((it, i) => (
                            <li
                                key={i}
                                className="flex justify-between gap-2 py-2 border-b border-border/50 last:border-0"
                            >
                                <div>
                                    <p className="font-medium text-foreground">
                                        {it.name} × {it.quantity || 1}
                                    </p>
                                    {it.specialInstructions && (
                                        <p className="text-sm text-muted-foreground italic mt-0.5">
                                            Note: {it.specialInstructions}
                                        </p>
                                    )}
                                </div>
                                <span className="font-semibold text-foreground shrink-0">
                                    {inrFormatter.format(
                                        (Number(it.price) || 0) * (Number(it.quantity) || 1)
                                    )}
                                </span>
                            </li>
                        ))}
                    </ul>
                    <div className="flex justify-between items-center pt-2 border-t border-border font-bold text-lg">
                        <span className="text-foreground">Total</span>
                        <span className="text-primary">{inrFormatter.format(total)}</span>
                    </div>
                </div>
                <div className="p-4 border-t border-border bg-muted/20 flex gap-2">
                    {order.status === "SUBMITTED" && (
                        <button
                            type="button"
                            disabled={updatingId === order._id}
                            onClick={() => onStatusUpdate(order._id, "PREPARING")}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 disabled:opacity-50"
                        >
                            {updatingId === order._id ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Clock className="w-5 h-5" />
                            )}
                            Start preparing
                        </button>
                    )}
                    {order.status === "PREPARING" && (
                        <button
                            type="button"
                            disabled={updatingId === order._id}
                            onClick={() => onStatusUpdate(order._id, "SERVED")}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 disabled:opacity-50"
                        >
                            {updatingId === order._id ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <CheckCircle className="w-5 h-5" />
                            )}
                            Mark complete
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-3 rounded-xl border border-border text-foreground font-medium hover:bg-muted"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
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
            if (newStatus === "SERVED") setSelectedOrder(null);
            else
                setSelectedOrder((s) =>
                    s?._id === orderId ? { ...s, status: newStatus } : s
                );
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update order");
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading && kitchenOrders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Loading kitchen orders…</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Flame className="w-6 h-6 text-orange-500" />
                    <h2 className="text-xl font-bold text-foreground">Kitchen orders</h2>
                    {kitchenOrders.length > 0 && (
                        <span className="text-sm text-muted-foreground">
                            ({kitchenOrders.length} active)
                        </span>
                    )}
                </div>
            </div>

            {kitchenOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                        <ChefHat className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">No orders in kitchen</h3>
                    <p className="text-sm text-muted-foreground max-w-xs">
                        New orders will appear here when customers send them to the kitchen. You’ll hear a sound when a new order arrives.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {kitchenOrders.map((order) => (
                        <button
                            key={order._id}
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className={`rounded-xl border-2 overflow-hidden text-left transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                                order.status === "SUBMITTED"
                                    ? "border-amber-500/40 bg-amber-500/5 hover:border-amber-500/60"
                                    : "border-blue-500/40 bg-blue-500/5 hover:border-blue-500/60"
                            }`}
                        >
                            <div className="p-4">
                                <div className="flex items-center justify-between gap-2 mb-3">
                                    <span className="font-bold text-foreground">
                                        Table {order.tableNumber}
                                    </span>
                                    <span
                                        className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                                            order.status === "SUBMITTED"
                                                ? "bg-amber-500/20 text-amber-700"
                                                : "bg-blue-500/20 text-blue-700"
                                        }`}
                                    >
                                        {order.status === "SUBMITTED" ? "New" : "Preparing"}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">
                                    {order.customerName}
                                </p>
                                <ul className="space-y-1.5 mb-4">
                                    {(order.items || []).slice(0, 3).map((it, i) => (
                                        <li key={i} className="text-sm text-foreground">
                                            {it.name} × {it.quantity || 1}
                                            {it.specialInstructions && (
                                                <span className="text-muted-foreground italic ml-1">
                                                    (+ note)
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                    {(order.items || []).length > 3 && (
                                        <li className="text-xs text-muted-foreground">
                                            +{(order.items || []).length - 3} more
                                        </li>
                                    )}
                                </ul>
                                <div className="flex justify-between items-center pt-2 border-t border-border">
                                    <span className="font-semibold text-primary">
                                        {inrFormatter.format(order.total || 0)}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        Tap for details →
                                    </span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    tableNumber={selectedOrder.tableNumber}
                    onClose={() => setSelectedOrder(null)}
                    onStatusUpdate={handleStatusUpdate}
                    updatingId={updatingId}
                />
            )}
        </div>
    );
};

export default ChefView;
