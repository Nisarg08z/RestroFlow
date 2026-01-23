import React from "react";
import { Store, MapPin } from "lucide-react";

const LocationCard = ({ location, onSelect }) => {
    const address = [location.address, location.city, location.state]
        .filter(Boolean)
        .join(", ") || "No address provided";

    const isActive = location?.isActive === true;

    return (
        <div
            onClick={() => onSelect(location._id || location.id)}
            className="group bg-card hover:bg-muted/50 border border-border hover:border-primary/50 cursor-pointer rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className={`w-2 h-2 rounded-full ${isActive ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"}`} />
            </div>

            <div className="space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Store className="w-6 h-6 text-primary" />
                </div>

                <div className="space-y-1">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {location.locationName || location.restaurantName || "Main Location"}
                    </h3>
                    <div className="flex items-start gap-2 text-muted-foreground text-sm">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{address}</span>
                    </div>
                </div>

                <div className="pt-4 border-t border-border mt-4 flex items-center justify-between text-sm">
                    <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">Tables</span>
                        <span className="font-semibold text-foreground">
                            {location.totalTables || 0}
                        </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full font-medium text-xs ${isActive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                        {isActive ? "Open" : "Closed"}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default LocationCard;
