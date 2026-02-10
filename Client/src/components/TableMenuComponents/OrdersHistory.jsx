import React from 'react';
import { motion } from 'framer-motion';
import { History } from 'lucide-react';

const OrdersHistory = ({ previousOrders, inrFormatter }) => {
    if (!previousOrders || previousOrders.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
        >
            <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Your previous orders</h2>
            </div>
            <div className="space-y-3">
                {previousOrders.map((order) => (
                    <div
                        key={order._id}
                        className="bg-card border border-border rounded-xl p-4 space-y-2"
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
        </motion.div>
    );
};

export default OrdersHistory;
