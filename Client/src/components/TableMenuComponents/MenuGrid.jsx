import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import MenuItemCard from './MenuItemCard';

const MenuGrid = ({ groupedItems, filteredItems, setSelectedItem, inrFormatter }) => {
    return (
        <AnimatePresence mode="wait">
            {groupedItems ? (
                Object.entries(groupedItems).map(([categoryName, items], index) => (
                    <motion.div
                        key={categoryName}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08, type: "spring", stiffness: 260, damping: 20 }}
                        className="space-y-4 mb-8 relative z-0"
                    >
                        <div className="flex items-center gap-3 sticky top-[180px] bg-background/80 backdrop-blur-md py-3 -mx-4 px-4 border-b border-border/20 z-20 shadow-sm">
                            <h2 className="text-2xl font-black text-foreground tracking-tight uppercase tracking-wider">{categoryName}</h2>
                            <span className="px-3 py-1 text-xs font-bold bg-primary text-primary-foreground rounded-full shadow-md shadow-primary/20">
                                {items.length} {items.length === 1 ? "item" : "items"}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
                            {items.map((item) => (
                                <MenuItemCard
                                    key={item._id}
                                    item={item}
                                    onSelect={setSelectedItem}
                                    inrFormatter={inrFormatter}
                                />
                            ))}
                        </div>
                    </motion.div>
                ))
            ) : filteredItems.length > 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                    {filteredItems.map((item) => (
                        <MenuItemCard
                            key={item._id}
                            item={item}
                            onSelect={setSelectedItem}
                            inrFormatter={inrFormatter}
                        />
                    ))}
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-32 text-center"
                >
                    <div className="w-24 h-24 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-border/50">
                        <Search className="w-10 h-10 text-muted-foreground opacity-60" />
                    </div>
                    <h3 className="text-2xl font-black text-foreground mb-2 tracking-tight">No items found</h3>
                    <p className="text-muted-foreground/90 font-medium">
                        Try selecting a different category or refining your search.
                    </p>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MenuGrid;
