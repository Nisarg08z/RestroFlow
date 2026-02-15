import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History, MapPin, Clock } from 'lucide-react';
import { groupAndAggregateOrders } from '../../utils/orderUtils';

const STATUS_CONFIG = {
    PENDING: { label: "In cart", className: "bg-muted text-muted-foreground" },
    SUBMITTED: { label: "Sent to kitchen", className: "bg-amber-500/15 text-amber-700" },
    PREPARING: { label: "Preparing", className: "bg-blue-500/15 text-blue-700" },
    SERVED: { label: "Served", className: "bg-green-500/15 text-green-700" },
    CANCELLED: { label: "Cancelled", className: "bg-red-500/15 text-red-700" },
};

const HistoryDrawer = ({ isOpen, onClose, previousOrders, inrFormatter }) => {
    const groupedOrders = useMemo(() => {
        return groupAndAggregateOrders(previousOrders || []);
    }, [previousOrders]);

    const hasOrders = groupedOrders.length > 0;

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
                                    {groupedOrders.map((group, idx) => {
                                        const statusConfig = STATUS_CONFIG[group.latestStatus] || STATUS_CONFIG.PENDING;
                                        return (
                                            <div
                                                key={`${group.tableNumber}_${group.date}_${group.time}_${idx}`}
                                                className="bg-background border border-border rounded-xl p-4 space-y-3"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                                                            <span className="font-semibold text-foreground">
                                                                Table {group.tableNumber}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            <span>{group.dateTimeDisplay || `${group.date} at ${group.time}`}</span>
                                                        </div>
                                                    </div>
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold shrink-0 ${statusConfig.className}`}>
                                                        {statusConfig.label}
                                                    </span>
                                                </div>
                                                <ul className="space-y-1.5 pt-2 border-t border-border/50">
                                                    {group.items.map((item, i) => (
                                                        <li key={i} className="flex justify-between text-sm">
                                                            <span className="text-foreground">
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
                                                <div className="pt-2 border-t border-border flex justify-between font-semibold">
                                                    <span>Total</span>
                                                    <span>{inrFormatter.format(group.total)}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
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
