import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCurrentRestaurant } from "../../utils/api";
import { ChefLocationCard } from "../../components/ChefPageComponents";
import { Loader2, ChefHat } from "lucide-react";

const ChefWelcomePage = () => {
    const [restaurant, setRestaurant] = useState(null);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await getCurrentRestaurant();
            if (res.data?.success) {
                const data = res.data.data;
                setRestaurant(data);
                if (data.locations && data.locations.length > 0) {
                    setLocations(data.locations);
                } else {
                    setLocations([]);
                }
            }
        } catch (error) {
            console.error("Failed to fetch restaurant data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLocationSelect = (locationId) => {
        navigate(`/chef/kitchen/${locationId}`);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                <p className="text-sm text-muted-foreground">Loading locations…</p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <div className="max-w-6xl mx-auto space-y-8">
                    <div className="space-y-6">
                        <div className="space-y-2 flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <ChefHat className="w-8 h-8 text-orange-500" />
                                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                                        Kitchen Dashboard
                                    </h2>
                                </div>
                                <p className="text-muted-foreground text-lg">
                                    Select a location to view and manage kitchen orders
                                </p>
                            </div>
                            <Link
                                to="/restaurant/welcome"
                                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted/50 font-medium text-sm transition-colors"
                            >
                                Manager View
                            </Link>
                        </div>

                        {locations.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {locations.map((loc) => (
                                    <ChefLocationCard
                                        key={loc._id || loc.id}
                                        location={loc}
                                        onSelect={handleLocationSelect}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 border border-dashed border-border rounded-2xl bg-muted/30">
                                <div className="max-w-md mx-auto space-y-4">
                                    <ChefHat className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
                                    <p className="text-muted-foreground text-lg">
                                        No locations available
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Contact your manager to get access to a kitchen location
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChefWelcomePage;
