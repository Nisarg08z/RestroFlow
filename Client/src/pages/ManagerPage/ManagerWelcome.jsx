import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentRestaurant } from "../../utils/api";
import { Plus } from "lucide-react";
import { LocationCard, AddLocationModal, LoadingScreen, ManagerHeader } from "../../components/ManagerPageComponents";

const ManagerWelcome = () => {
    const [showAnimation, setShowAnimation] = useState(true);
    const [restaurant, setRestaurant] = useState(null);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddLocation, setShowAddLocation] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        let timer = null;

        const fetchAndShowAnimation = async () => {
            await fetchData();

            const shouldShowAnimation = localStorage.getItem("showWelcomeAnimation") === "true";

            if (shouldShowAnimation) {
                timer = setTimeout(() => {
                    setShowAnimation(false);
                    localStorage.removeItem("showWelcomeAnimation");
                }, 4000);
            } else {
                setShowAnimation(false);
            }
        };

        fetchAndShowAnimation();

        return () => {
            if (timer) clearTimeout(timer);
        };
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
        navigate(`/restaurant/location/${locationId}`);
    };

    const handleLocationAdded = () => {
        fetchData();
    };

    if (showAnimation) {
        return <LoadingScreen restaurant={restaurant} />;
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <ManagerHeader restaurant={restaurant} />
            <div className="p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="max-w-6xl mx-auto space-y-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                                Choose Location to Manage
                            </h2>
                            <p className="text-muted-foreground text-lg">
                                Select a location or add a new one to get started
                            </p>
                        </div>

                        {locations.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {locations.map((loc) => (
                                    <LocationCard
                                        key={loc._id || loc.id}
                                        location={loc}
                                        onSelect={handleLocationSelect}
                                    />
                                ))}

                                <div
                                    onClick={() => setShowAddLocation(true)}
                                    className="group bg-muted/30 border border-dashed border-border hover:border-primary/50 rounded-2xl p-6 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-muted/50 transition-all duration-300 min-h-[200px]"
                                >
                                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-medium text-muted-foreground group-hover:text-primary transition-colors">
                                            Add New Location
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Click to add a new restaurant location
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 border border-dashed border-border rounded-2xl bg-muted/30">
                                <div className="max-w-md mx-auto space-y-4">
                                    <p className="text-muted-foreground text-lg">
                                        No locations added yet
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Start by adding your first restaurant location
                                    </p>
                                    <button
                                        onClick={() => setShowAddLocation(true)}
                                        className="mt-4 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 font-medium transition-colors shadow-lg shadow-primary/20 inline-flex items-center gap-2"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Add Your First Location
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AddLocationModal
                isOpen={showAddLocation}
                onClose={() => setShowAddLocation(false)}
                restaurant={restaurant}
                onSuccess={handleLocationAdded}
            />
        </div>
    );
};

export default ManagerWelcome;
