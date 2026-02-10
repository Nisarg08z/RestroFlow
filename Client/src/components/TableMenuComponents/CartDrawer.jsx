import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChefHat, Send } from 'lucide-react';

const CartDrawer = ({ isOpen, onClose, pendingOrder, inrFormatter, onSubmitOrder, submitLoading }) => {
    const items = pendingOrder?.items || [];
    const total = items.reduce(
        (sum, it) => sum + (it.price || 0) * (it.quantity || 1),
        0
    );

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
                                <ChefHat className="w-6 h-6 text-primary" />
                                <h2 className="text-xl font-bold text-foreground">Your Order</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-muted text-foreground transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <ChefHat className="w-16 h-16 text-muted-foreground opacity-30 mb-4" />
                                    <p className="text-muted-foreground font-medium">Your cart is empty</p>
                                    <p className="text-sm text-muted-foreground mt-1">Add items from the menu</p>
                                </div>
                            ) : (
                                <ul className="space-y-4">
                                    {items.map((it, idx) => (
                                        <li key={idx} className="flex justify-between gap-4 py-3 border-b border-border last:border-0">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-foreground">
                                                    {it.name} × {it.quantity}
                                                </p>
                                                {it.specialInstructions && (
                                                    <p className="text-sm text-muted-foreground mt-0.5 italic">
                                                        Note: {it.specialInstructions}
                                                    </p>
                                                )}
                                            </div>
                                            <span className="font-semibold text-foreground whitespace-nowrap">
                                                {inrFormatter.format((it.price || 0) * (it.quantity || 1))}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {items.length > 0 && (
                            <div className="p-4 border-t border-border bg-muted/30 space-y-3">
                                <div className="flex justify-between items-center text-lg font-bold">
                                    <span className="text-foreground">Total</span>
                                    <span className="text-primary">{inrFormatter.format(total)}</span>
                                </div>
                                <button
                                    onClick={onSubmitOrder}
                                    disabled={submitLoading}
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3.5 rounded-xl font-semibold shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70"
                                >
                                    {submitLoading ? (
                                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                    Send to Kitchen
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;
