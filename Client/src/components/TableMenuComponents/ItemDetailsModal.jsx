import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UtensilsCrossed, ShoppingBag } from 'lucide-react';

const ItemDetailsModal = ({ selectedItem, setSelectedItem, onAddToOrder, inrFormatter, loading }) => {
    const [specialInstructions, setSpecialInstructions] = useState('');
    const [quantity, setQuantity] = useState(1);

    const handleAdd = () => {
        onAddToOrder(selectedItem, quantity, specialInstructions.trim());
        setSpecialInstructions('');
        setQuantity(1);
    };

    const handleClose = () => {
        setSelectedItem(null);
        setSpecialInstructions('');
        setQuantity(1);
    };

    return (
        <AnimatePresence>
            {selectedItem && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-4"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ y: "100%", scale: 0.95, opacity: 0 }}
                        animate={{ y: 0, scale: 1, opacity: 1 }}
                        exit={{ y: "100%", scale: 0.95, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200, mass: 1 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-card w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl border border-border/50 max-h-[90vh] flex flex-col relative"
                    >
                        {/* Glow effect behind */}
                        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

                        <div className="relative h-64 bg-muted flex-shrink-0">
                            {selectedItem.image?.url ? (
                                <img
                                    src={selectedItem.image.url}
                                    alt={selectedItem.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/30">
                                    <UtensilsCrossed className="w-16 h-16 text-muted-foreground opacity-30" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleClose}
                                className="absolute top-4 right-4 bg-black/40 backdrop-blur-md text-white p-2.5 rounded-full hover:bg-black/60 transition-colors border border-white/10"
                            >
                                <X className="w-5 h-5" />
                            </motion.button>
                        </div>

                        <div className="p-6 space-y-5 overflow-y-auto flex-1 z-10">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1 min-w-0">
                                    <motion.h3
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="text-3xl font-bold text-foreground tracking-tight"
                                    >
                                        {selectedItem.name}
                                    </motion.h3>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.15 }}
                                        className="text-sm text-primary font-semibold mt-1 uppercase tracking-wider"
                                    >
                                        {selectedItem.category}
                                    </motion.p>
                                </div>
                                <motion.span
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2, type: 'spring' }}
                                    className="text-2xl font-bold text-foreground whitespace-nowrap bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20"
                                >
                                    {inrFormatter.format(Number(selectedItem.price) || 0)}
                                </motion.span>
                            </div>

                            {selectedItem.description && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.25 }}
                                    className="text-muted-foreground leading-relaxed text-[15px]"
                                >
                                    {selectedItem.description}
                                </motion.p>
                            )}

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="pt-2"
                            >
                                <label className="block text-sm font-semibold text-foreground mb-2">
                                    Special instructions <span className="text-muted-foreground font-normal">(e.g. low spicy, no onions)</span>
                                </label>
                                <input
                                    type="text"
                                    value={specialInstructions}
                                    onChange={(e) => setSpecialInstructions(e.target.value)}
                                    placeholder="Any preferences? Low spicy, extra sauce..."
                                    className="w-full px-4 py-3.5 bg-background border border-border/60 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground/60 shadow-sm"
                                />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 }}
                                className="flex items-center justify-between pt-2"
                            >
                                <label className="text-base font-semibold text-foreground">Quantity</label>
                                <div className="flex items-center gap-3 bg-muted/50 p-1.5 rounded-2xl border border-border/50">
                                    <motion.button
                                        type="button"
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                        className="w-10 h-10 rounded-xl bg-background shadow-sm hover:bg-card flex items-center justify-center font-bold text-lg text-foreground transition-colors"
                                    >
                                        −
                                    </motion.button>
                                    <span className="w-6 text-center font-bold text-lg">{quantity}</span>
                                    <motion.button
                                        type="button"
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setQuantity((q) => q + 1)}
                                        className="w-10 h-10 rounded-xl bg-background shadow-sm hover:bg-card flex items-center justify-center font-bold text-lg text-foreground transition-colors"
                                    >
                                        +
                                    </motion.button>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="pt-4"
                            >
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={loading}
                                    className="w-full bg-primary hover:bg-primary/95 text-primary-foreground py-4 rounded-2xl font-bold shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70 text-lg relative overflow-hidden group"
                                    onClick={handleAdd}
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    {loading ? (
                                        <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <ShoppingBag className="w-5 h-5 z-10" />
                                    )}
                                    <span className="z-10">Add to Order {quantity > 1 ? `(${quantity})` : ''} - {inrFormatter.format((Number(selectedItem.price) || 0) * quantity)}</span>
                                </motion.button>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ItemDetailsModal;
