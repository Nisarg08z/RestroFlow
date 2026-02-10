import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, ChefHat, Search } from 'lucide-react';

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
    onCartClick
}) => {
    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-0 z-30 bg-card border-b border-border shadow-sm"
        >
            <div className="px-4 py-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl font-bold text-foreground truncate">
                            {data.restaurantName}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                            <p className="text-sm text-muted-foreground truncate">
                                {data.locationName}
                            </p>
                            {tableNumber && (
                                <>
                                    <span className="text-muted-foreground">•</span>
                                    <span className="text-sm text-primary font-semibold">
                                        Table {tableNumber}
                                    </span>
                                </>
                            )}
                            {customerName && (
                                <>
                                    <span className="text-muted-foreground">•</span>
                                    <span className="text-sm text-primary font-semibold">
                                        Hi, {customerName}!
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onCartClick}
                        className="relative p-2.5 bg-primary/10 rounded-full flex-shrink-0 hover:bg-primary/20 transition-colors"
                        aria-label="View order"
                    >
                        <ChefHat className="w-6 h-6 text-primary" />
                        {cartItemCount > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-primary text-primary-foreground text-xs font-bold rounded-full">
                                {cartItemCount > 99 ? '99+' : cartItemCount}
                            </span>
                        )}
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search menu items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground"
                    />
                </div>

                <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveCategory("all")}
                            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeCategory === "all"
                                    ? "bg-primary text-primary-foreground shadow-lg"
                                    : "bg-muted text-foreground hover:bg-muted/80"
                                }`}
                        >
                            All
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat._id}
                                onClick={() => setActiveCategory(cat.name)}
                                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeCategory === cat.name
                                        ? "bg-primary text-primary-foreground shadow-lg"
                                        : "bg-muted text-foreground hover:bg-muted/80"
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </motion.header>
    );
};

export default MenuHeader;
