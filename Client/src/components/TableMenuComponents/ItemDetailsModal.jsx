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
                className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={handleClose}
            >
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-card w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-border max-h-[90vh] overflow-y-auto"
                >
                    <div className="relative h-64 bg-muted flex-shrink-0">
                        {selectedItem.image?.url ? (
                            <img
                                src={selectedItem.image.url}
                                alt={selectedItem.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <UtensilsCrossed className="w-16 h-16 text-muted-foreground opacity-30" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm text-foreground p-2 rounded-full hover:bg-card transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-2xl font-bold text-foreground">
                                    {selectedItem.name}
                                </h3>
                                <p className="text-sm text-primary font-semibold mt-1">
                                    {selectedItem.category}
                                </p>
                            </div>
                            <span className="text-2xl font-bold text-foreground whitespace-nowrap">
                                {inrFormatter.format(Number(selectedItem.price) || 0)}
                            </span>
                        </div>

                        {selectedItem.description && (
                            <p className="text-muted-foreground leading-relaxed">
                                {selectedItem.description}
                            </p>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Special instructions <span className="text-muted-foreground font-normal">(e.g. low spicy, no onions)</span>
                            </label>
                            <input
                                type="text"
                                value={specialInstructions}
                                onChange={(e) => setSpecialInstructions(e.target.value)}
                                placeholder="Any preferences? Low spicy, extra sauce..."
                                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-foreground">Quantity</label>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                    className="w-9 h-9 rounded-lg bg-muted hover:bg-muted/80 font-semibold text-foreground"
                                >
                                    −
                                </button>
                                <span className="w-8 text-center font-semibold">{quantity}</span>
                                <button
                                    type="button"
                                    onClick={() => setQuantity((q) => q + 1)}
                                    className="w-9 h-9 rounded-lg bg-muted hover:bg-muted/80 font-semibold text-foreground"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3.5 rounded-xl font-semibold shadow-lg transition-all flex items-center justify-center gap-2 mt-4 active:scale-[0.98] disabled:opacity-70"
                            onClick={handleAdd}
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <ShoppingBag className="w-5 h-5" />
                            )}
                            Add to Order {quantity > 1 ? `(${quantity})` : ''}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ItemDetailsModal;
