import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, ChefHat, Search, History } from 'lucide-react';

const MenuHeader = ({
    data,
    tableNumber,
    customerName,
    searchQuery,
    setSearchQuery,
    categories,
    activeCategory,
    setActiveCategory,
    cartItemCount = 0,
    onCartClick,
    onHistoryClick,
}) => {
    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-xl shadow-sm sticky top-0 z-30 bg-card border-b border-border"
        >
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

            <div className="px-5 py-5 space-y-5 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-2xl font-black tracking-tight text-foreground truncate"
                        >
                            {data.restaurantName}
                        </motion.h1>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="flex items-center gap-2 mt-1.5"
                        >
                            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                            <p className="text-sm font-medium text-muted-foreground truncate">
                                {data.locationName}
                            </p>
                            {tableNumber && (
                                <>
                                    <span className="text-muted-foreground">•</span>
                                    <span className="text-sm text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-md">
                                        Table {tableNumber}
                                    </span>
                                </>
                            )}
                            {customerName && (
                                <>
                                    <span className="text-muted-foreground">•</span>
                                    <span className="text-sm text-primary font-bold">
                                        Hi, {customerName}!
                                    </span>
                                </>
                            )}
                        </motion.div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                        {onHistoryClick && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onHistoryClick}
                                className="p-3 bg-muted/50 rounded-full hover:bg-muted transition-colors border border-border/50 shadow-sm"
                                aria-label="Order history"
                            >
                                <History className="w-6 h-6 text-foreground" />
                            </motion.button>
                        )}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onCartClick}
                            className="relative p-3 bg-primary/10 rounded-full hover:bg-primary/20 transition-colors border border-primary/20 shadow-sm"
                            aria-label="View order"
                        >
                            <ChefHat className="w-6 h-6 text-primary" />
                            {cartItemCount > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1.5 flex items-center justify-center bg-primary text-primary-foreground text-xs font-black rounded-full shadow-lg shadow-primary/30 border-2 border-card"
                                >
                                    {cartItemCount > 99 ? '99+' : cartItemCount}
                                </motion.span>
                            )}
                        </motion.button>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative group"
                >
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search menu items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-background/50 border border-border/80 rounded-2xl text-[15px] font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-muted-foreground/70 shadow-sm backdrop-blur-sm"
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="overflow-x-auto scrollbar-hide -mx-5 px-5"
                >
                    <div className="flex gap-2.5 pb-2">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveCategory("all")}
                            className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeCategory === "all"
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-100"
                                : "bg-muted/60 text-foreground hover:bg-muted border border-border/40 scale-95 opacity-80"
                                }`}
                        >
                            All
                        </motion.button>
                        {categories.map((cat, idx) => (
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                key={cat._id || cat.name || idx}
                                onClick={() => setActiveCategory(cat.name)}
                                className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeCategory === cat.name
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-100"
                                    : "bg-muted/60 text-foreground hover:bg-muted border border-border/40 scale-95 opacity-80"
                                    }`}
                            >
                                {cat.name}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </div>
        </motion.header >
    );
};

export default MenuHeader;
