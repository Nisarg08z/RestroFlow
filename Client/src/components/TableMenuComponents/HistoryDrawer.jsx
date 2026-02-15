import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History } from 'lucide-react';

const HistoryDrawer = ({ isOpen, onClose, previousOrders, inrFormatter }) => {
    const orders = previousOrders || [];
    const hasOrders = orders.length > 0;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border shadow-2xl z-50 flex flex-col"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <div className="flex items-center gap-2">
                                <History className="w-6 h-6 text-primary" />
                                <h2 className="text-xl font-bold text-foreground">Order history</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-muted text-foreground transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            {!hasOrders ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <History className="w-16 h-16 text-muted-foreground opacity-30 mb-4" />
                                    <p className="text-muted-foreground font-medium">No orders yet</p>
                                    <p className="text-sm text-muted-foreground mt-1">Your order history will appear here</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map((order) => (
                                        <div
                                            key={order._id}
                                            className="bg-background border border-border rounded-xl p-4 space-y-2"
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-semibold text-primary uppercase">
                                                    {order.status}
                                                </span>
                                                <span className="text-sm text-muted-foreground">
                                                    {new Date(order.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <ul className="space-y-1">
                                                {order.items?.map((it, idx) => (
                                                    <li key={idx} className="flex justify-between text-sm">
                                                        <div>
                                                            <span className="text-foreground">
                                                                {it.name} × {it.quantity}
                                                            </span>
                                                            {it.specialInstructions && (
                                                                <p className="text-xs text-muted-foreground italic mt-0.5">
                                                                    {it.specialInstructions}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <span className="font-medium flex-shrink-0 ml-2">
                                                            {inrFormatter.format((it.price || 0) * (it.quantity || 1))}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="pt-2 border-t border-border flex justify-between font-semibold">
                                                <span>Total</span>
                                                <span>
                                                    {inrFormatter.format(
                                                        order.items?.reduce(
                                                            (sum, it) => sum + (it.price || 0) * (it.quantity || 1),
                                                            0
                                                        ) || 0
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default HistoryDrawer;
