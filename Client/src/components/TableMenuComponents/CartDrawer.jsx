import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChefHat, Send, Trash2, Minus, Plus } from 'lucide-react';

const CartDrawer = ({ isOpen, onClose, pendingOrder, inrFormatter, onSubmitOrder, submitLoading, onRemoveItem, onUpdateQuantity, removeLoading }) => {
    const items = pendingOrder?.items || [];
    const total = items.reduce(
        (sum, it) => sum + (it.price || 0) * (it.quantity || 1),
        0
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="cart-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />
            )}
            {isOpen && (
                <motion.div
                    key="cart-drawer"
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200, mass: 0.8 }}
                    className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-border shadow-2xl z-50 flex flex-col overflow-hidden"
                >
                    <div className="flex items-center justify-between p-5 border-b border-border bg-card relative z-10 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                                <ChefHat className="w-5 h-5 text-primary" />
                            </div>
                            <h2 className="text-xl font-black text-foreground tracking-tight">Your Order</h2>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-muted text-foreground transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </motion.button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {items.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 }}
                                className="flex flex-col items-center justify-center h-full text-center py-10"
                            >
                                <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-5 border border-border/50">
                                    <ChefHat className="w-10 h-10 text-muted-foreground opacity-40 transform -rotate-12" />
                                </div>
                                <p className="text-lg font-bold text-foreground">Your cart is empty</p>
                                <p className="text-sm text-muted-foreground mt-1 max-w-[200px] mx-auto">
                                    Add some delicious items from the menu
                                </p>
                            </motion.div>
                        ) : (
                            <div className="space-y-4 pt-1">
                                {items.map((it, idx) => {
                                    const qty = it.quantity || 1;
                                    return (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20, scale: 0.95 }}
                                            transition={{ delay: idx * 0.05 }}
                                            key={idx}
                                            className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow hover:border-border/80 flex flex-col gap-3 group"
                                        >
                                            <div className="flex justify-between gap-3 items-start">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-[15px] text-foreground tracking-tight">{it.name}</p>
                                                    {it.specialInstructions && (
                                                        <div className="mt-1.5">
                                                            <span className="text-xs font-medium text-amber-600/90 bg-amber-500/10 px-2 py-0.5 rounded-md inline-block border border-amber-500/20">
                                                                Note: {it.specialInstructions}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="font-bold text-[15px] text-foreground whitespace-nowrap bg-muted px-2 py-1 rounded-lg">
                                                    {inrFormatter.format((it.price || 0) * qty)}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between gap-2 mt-1 pt-3 border-t border-border/50">
                                                <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1 border border-border/50">
                                                    <motion.button
                                                        whileTap={{ scale: 0.9 }}
                                                        type="button"
                                                        onClick={() => onUpdateQuantity?.(idx, qty - 1)}
                                                        disabled={removeLoading || qty <= 1}
                                                        className="p-1.5 rounded-lg text-foreground hover:bg-background disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                                                    >
                                                        <Minus className="w-3.5 h-3.5" />
                                                    </motion.button>
                                                    <span className="min-w-[28px] text-center text-sm font-bold">{qty}</span>
                                                    <motion.button
                                                        whileTap={{ scale: 0.9 }}
                                                        type="button"
                                                        onClick={() => onUpdateQuantity?.(idx, qty + 1)}
                                                        disabled={removeLoading}
                                                        className="p-1.5 rounded-lg text-foreground hover:bg-background disabled:opacity-40 transition-colors shadow-sm"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                    </motion.button>
                                                </div>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    type="button"
                                                    onClick={() => onRemoveItem?.(idx)}
                                                    disabled={removeLoading}
                                                    className="p-2 rounded-xl text-muted-foreground hover:text-white hover:bg-destructive transition-all disabled:opacity-50 border border-transparent hover:border-destructive hover:shadow-lg hover:shadow-destructive/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Remove from cart"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {items.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="p-5 border-t border-border bg-card relative z-20 space-y-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]"
                        >
                            <div className="flex justify-between items-end bg-primary/5 p-4 rounded-xl border border-primary/10">
                                <span className="text-foreground font-semibold text-sm uppercase tracking-wider text-muted-foreground">Total Amount</span>
                                <span className="text-2xl font-black text-primary tracking-tight">{inrFormatter.format(total)}</span>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onSubmitOrder}
                                disabled={submitLoading}
                                className="w-full bg-primary hover:bg-primary/95 text-primary-foreground py-4 rounded-xl font-bold text-lg shadow-xl shadow-primary/25 transition-all flex items-center justify-center gap-3 disabled:opacity-70 group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] transition-transform" />
                                {submitLoading ? (
                                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin z-10" />
                                ) : (
                                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform z-10" />
                                )}
                                <span className="z-10 tracking-wide">Send to Kitchen</span>
                            </motion.button>
                        </motion.div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;