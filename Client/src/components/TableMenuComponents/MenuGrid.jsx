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
                        transition={{ delay: index * 0.05 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center gap-3 sticky top-[180px] bg-background/95 backdrop-blur-sm py-2 -mx-4 px-4 z-20">
                            <h2 className="text-xl font-bold text-foreground">{categoryName}</h2>
                            <span className="px-2.5 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full">
                                {items.length} {items.length === 1 ? "item" : "items"}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
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
                    className="grid grid-cols-1 gap-3"
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
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                >
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Search className="w-10 h-10 text-muted-foreground opacity-50" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">No items found</h3>
                    <p className="text-sm text-muted-foreground">
                        Try selecting a different category or search term
                    </p>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MenuGrid;
