import React from "react";
import { Store, MapPin, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    show: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 24 }
    },
};

const LocationCard = ({ location, onSelect }) => {
    const address = [location.address, location.city, location.state]
        .filter(Boolean)
        .join(", ") || "No address provided";

    const isActive = location?.isActive === true;

    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(location._id || location.id)}
            className="group relative bg-card/60 backdrop-blur-xl border border-border hover:border-primary/50 cursor-pointer rounded-3xl p-6 transition-colors duration-300 shadow-sm hover:shadow-2xl overflow-hidden flex flex-col justify-between"
        >
            {/* Background Gradient Effect on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none" />

            <div className="relative z-10 space-y-5">
                {/* Header: Icon & Status */}
                <div className="flex justify-between items-start">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-inner">
                        <Store className="w-7 h-7 text-primary" />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span
                            className={`flex items-center gap-1.5 px-3 py-1 text-[10px] uppercase font-bold rounded-full border tracking-wider shadow-sm transition-colors duration-300 ${isActive
                                    ? "bg-green-500/10 text-green-600 border-green-500/20 shadow-green-500/10"
                                    : "bg-red-500/10 text-red-600 border-red-500/20 shadow-red-500/10"
                                }`}
                        >
                            <span
                                className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500 animate-[pulse_2s_ease-in-out_infinite]" : "bg-red-500"
                                    }`}
                            />
                            {isActive ? "Open" : "Closed"}
                        </span>
                    </div>
                </div>

                {/* Body: Title & Address */}
                <div className="space-y-1.5 pt-2">
                    <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors tracking-tight">
                        {location.locationName || location.restaurantName || "Main Location"}
                    </h3>
                    <div className="flex items-start gap-2 text-muted-foreground text-sm font-medium">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary/70" />
                        <span className="line-clamp-2 leading-relaxed">{address}</span>
                    </div>
                </div>
            </div>

            {/* Footer: Tables & Action */}
            <div className="relative z-10 pt-5 border-t border-border/50 mt-5 flex items-center justify-between text-sm group-hover:border-primary/20 transition-colors">
                <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Capacity</span>
                    <span className="text-base font-black text-foreground">
                        {location.totalTables || 0} <span className="text-sm font-medium text-muted-foreground">Tables</span>
                    </span>
                </div>

                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground text-primary transition-all duration-300 transform group-hover:translate-x-1">
                    <ArrowRight className="w-4 h-4" />
                </div>
            </div>
        </motion.div>
    );
};

export default LocationCard;
