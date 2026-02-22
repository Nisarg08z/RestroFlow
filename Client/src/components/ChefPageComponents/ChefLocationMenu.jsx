import React, { useState, useEffect } from "react";
import { getLocationMenu, hideItemFromLocation, showItemInLocation } from "../../utils/api";
import { Loader2, UtensilsCrossed, CheckCircle2, XCircle, Search } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 24 },
    },
};

const ChefLocationMenu = ({ locationId }) => {
    const [loading, setLoading] = useState(true);
    const [menu, setMenu] = useState(null);
    const [togglingId, setTogglingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchMenu = async () => {
        try {
            const res = await getLocationMenu(locationId);
            const data = res.data?.data ?? res.data;
            if (data) setMenu(data);
        } catch (err) {
            console.error("Failed to fetch location menu", err);
            toast.error("Failed to load menu");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenu();
    }, [locationId]);

    const handleToggle = async (itemId, isHidden) => {
        setTogglingId(itemId);
        try {
            if (isHidden) {
                await showItemInLocation(locationId, { itemId });
                toast.success("Item added back to menu");
            } else {
                await hideItemFromLocation(locationId, { itemId });
                toast.success("Item removed from menu for this location");
            }
            await fetchMenu();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update");
        } finally {
            setTogglingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-lg font-medium text-muted-foreground animate-pulse">Synchronizing Menu...</p>
            </div>
        );
    }

    const allItems = menu?.items ?? [];

    // Filter items based on safely checked search query
    const filteredItems = allItems.filter(item => {
        const query = searchQuery.toLowerCase();
        const nMatch = (item.name || "").toLowerCase().includes(query);
        const cMatch = (item.category || "").toLowerCase().includes(query);
        return nMatch || cMatch;
    });

    const byCategory = filteredItems.reduce((acc, item) => {
        const cat = item.category || "Other";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {});

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-12">

            {/* Header / Info Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/60 backdrop-blur-md p-6 rounded-3xl border border-border/50 shadow-sm"
            >
                <div className="space-y-1 max-w-2xl">
                    <h2 className="text-2xl font-bold text-foreground tracking-tight">Menu Availability Tracking</h2>
                    <p className="text-base text-muted-foreground leading-relaxed">
                        Control which items are visible to customers at this specific location.
                        Hidden items will be instantly removed from active ordering.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-72 shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search menu items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium placeholder:font-normal"
                    />
                </div>
            </motion.div>

            {allItems.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-24 rounded-[2.5rem] bg-gradient-to-b from-card to-background border-2 border-dashed border-border/60"
                >
                    <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                        <UtensilsCrossed className="w-12 h-12 text-muted-foreground opacity-50" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">No Menu Items Found</h3>
                    <p className="text-muted-foreground max-w-sm text-center">
                        It looks like there are no menu items assigned to this location yet. Please add them from the Admin or Manager dashboard.
                    </p>
                </motion.div>
            ) : filteredItems.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-center py-20"
                >
                    <p className="text-lg text-muted-foreground">No items match your search for "{searchQuery}".</p>
                </motion.div>
            ) : (
                <motion.div layout className="space-y-10">
                    <AnimatePresence mode="popLayout">
                        {Object.entries(byCategory).map(([category, categoryItems]) => (
                            <motion.div
                                key={category}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center gap-4">
                                    <h3 className="text-lg font-bold text-foreground uppercase tracking-widest bg-muted px-4 py-1.5 rounded-lg border border-border/50 shadow-sm">
                                        {category}
                                    </h3>
                                    <div className="h-px bg-border/50 flex-1" />
                                </div>

                                <motion.ul layout className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <AnimatePresence mode="popLayout">
                                        {categoryItems.map((item) => {
                                            const id = item._id?.toString?.() || item._id;
                                            const isHidden = !!item.isHidden;
                                            const busy = togglingId === id;

                                            return (
                                                <motion.li
                                                    key={id}
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    transition={{ duration: 0.2 }}
                                                    className={`group relative flex items-center justify-between gap-4 p-5 rounded-2xl border transition-all duration-300 ${isHidden
                                                        ? "bg-muted/30 border-dashed border-border/60 grayscale-[0.4]"
                                                        : "bg-card border-border hover:shadow-md hover:border-primary/30"
                                                        }`}
                                                >
                                                    {/* Left side details */}
                                                    <div className="min-w-0 pr-4 flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className={`font-bold text-lg truncate ${isHidden ? "text-muted-foreground line-through decoration-muted-foreground/50" : "text-foreground"}`}>
                                                                {item.name}
                                                            </h4>
                                                        </div>

                                                        {item.price != null && (
                                                            <p className="text-sm font-semibold text-primary/80">
                                                                ₹{Number(item.price).toLocaleString("en-IN")}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Right side animated toggle */}
                                                    <button
                                                        type="button"
                                                        disabled={busy}
                                                        onClick={() => handleToggle(id, isHidden)}
                                                        className={`relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all duration-300 shrink-0 overflow-hidden outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary ${isHidden
                                                            ? "bg-green-500/10 text-green-600 hover:bg-green-500/20 border border-green-500/20"
                                                            : "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
                                                            }`}
                                                    >
                                                        {busy ? (
                                                            <Loader2 className="w-5 h-5 animate-spin" />
                                                        ) : isHidden ? (
                                                            <>
                                                                <CheckCircle2 className="w-5 h-5" />
                                                                <span>Restore</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <XCircle className="w-5 h-5" />
                                                                <span>Hide</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </motion.li>
                                            );
                                        })}
                                    </AnimatePresence>
                                </motion.ul>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    );
};

export default ChefLocationMenu;
