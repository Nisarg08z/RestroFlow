import React from "react";
import { ChefHat, MapPin, ArrowRight } from "lucide-react";
import { useSpring, animated, config } from "@react-spring/web";

const ChefLocationCard = ({ location, onSelect }) => {
    const address = [location.address, location.city, location.state]
        .filter(Boolean)
        .join(", ") || "No address provided";

    const isActive = location?.isActive === true;

    const [{ scale, y, shadow }, api] = useSpring(() => ({
        scale: 1,
        y: 0,
        shadow: 0,
        config: config.wobbly
    }));

    return (
        <animated.div
            style={{
                scale,
                y,
                boxShadow: shadow.to(s => `0px ${s}px ${s * 2}px rgba(0,0,0,0.15)`),
                cursor: 'pointer'
            }}
            onClick={() => onSelect(location._id || location.id)}
            onMouseEnter={() => api.start({ scale: 1.02, y: -5, shadow: 15 })}
            onMouseLeave={() => api.start({ scale: 1, y: 0, shadow: 0 })}
           className="group bg-card border-2 border-border/50 rounded-3xl p-6 transition-colors duration-300 relative overflow-hidden flex flex-col h-full hover:border-orange-500/40"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="absolute top-6 right-6 flex items-center gap-2">
                <div
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border ${isActive
                            ? "bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.2)]"
                            : "bg-red-500/10 text-red-500 border-red-500/20"
                        }`}
                >
                    {isActive ? "Kitchen Open" : "Closed"}
                </div>
            </div>

            <div className="space-y-6 relative z-10 flex-1 flex flex-col">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-2xl flex items-center justify-center border border-orange-500/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-inner">
                    <ChefHat className="w-8 h-8 text-orange-500" />
                </div>

                <div className="space-y-2 flex-1">
                    <h3 className="text-2xl font-black text-foreground group-hover:text-orange-500 transition-colors tracking-tight">
                        {location.locationName || location.restaurantName || "Main Location"}
                    </h3>
                    <div className="flex items-start gap-2 text-muted-foreground text-sm font-medium">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-orange-500/70" />
                        <span className="line-clamp-2 leading-relaxed">{address}</span>
                    </div>
                </div>

                <div className="pt-5 border-t border-border/60 mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-muted px-3 py-1.5 rounded-lg flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Tables</span>
                            <span className="font-black text-foreground text-lg leading-none mt-0.5">
                                {location.totalTables || 0}
                            </span>
                        </div>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                </div>
            </div>
        </animated.div>
    );
};

export default ChefLocationCard;
