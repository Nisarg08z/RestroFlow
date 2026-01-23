import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCurrentRestaurant, updateLocation } from "../../utils/api";
import { LoadingScreen } from "../../components/ManagerPageComponents";
import {
    BarChart3, Package, Users, Loader2
} from "lucide-react";
import { toast } from "react-hot-toast";

import {
    LocationHeader,
    RestaurantOpener,
    BillingPOS,
    PlaceholderView,
    LocationSettings
} from "../../components/ManagerPageComponents/LocationDashboard";

const LocationDashboard = () => {
    const { locationId } = useParams();
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState(null);
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);

    const [isOpen, setIsOpen] = useState(false);
    const [isOpening, setIsOpening] = useState(false);
    const [activeTab, setActiveTab] = useState('billing');
    const [isClosing, setIsClosing] = useState(false);
    const [showBackConfirm, setShowBackConfirm] = useState(false);

    useEffect(() => {
        fetchData();
    }, [locationId]);

    const fetchData = async () => {
        try {
            const res = await getCurrentRestaurant();
            if (res.data?.success) {
                setRestaurant(res.data.data);
                const loc = res.data.data.locations.find(l => (l._id || l.id) === locationId);
                if (loc) {
                    setLocation(loc);
                    setIsOpen(loc?.isActive === true);
                } else {
                    toast.error("Location not found");
                    navigate("/restaurant/welcome");
                }
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
            toast.error("Failed to load location data");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenRestaurant = async () => {
        if (!locationId) return;
        setIsOpening(true);
        try {
            await updateLocation(locationId, { isActive: true });
            setIsOpen(true);
            setLocation((prev) => (prev ? { ...prev, isActive: true } : prev));
            toast.success("Location is now OPEN!");
        } catch (error) {
            console.error("Failed to open location", error);
            toast.error(error.response?.data?.message || "Failed to open location");
        } finally {
            setIsOpening(false);
        }
    };

    const handleCloseRestaurant = async () => {
        if (!locationId) return;
        setIsClosing(true);
        try {
            await updateLocation(locationId, { isActive: false });
            setIsOpen(false);
            setLocation((prev) => (prev ? { ...prev, isActive: false } : prev));
            toast.success("Location closed");
        } catch (error) {
            console.error("Failed to close location", error);
            toast.error(error.response?.data?.message || "Failed to close location");
        } finally {
            setIsClosing(false);
        }
    };

    const handleRequestBack = () => {
        if (isOpen) {
            setShowBackConfirm(true);
            return;
        }

        navigate("/restaurant/welcome");
    };

    if (loading) return <LoadingScreen restaurant={restaurant} />;
    if (!location) return null;

    return (
        <div className="min-h-screen bg-background pb-8 flex flex-col">
            <LocationHeader
                locationName={location.locationName}
                locationAddress={`${location.address}, ${location.city}`}
                isOpen={isOpen}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onBack={handleRequestBack}
            />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6">
                {!isOpen ? (
                    isOpening ? (
                        <div className="flex flex-col items-center justify-center h-[60vh] animate-in fade-in duration-500">
                            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                            <h2 className="text-xl font-semibold text-foreground animate-pulse">
                                Opening {location.locationName}...
                            </h2>
                            <p className="text-muted-foreground">Synchronizing daily menu and inventory</p>
                        </div>
                    ) : (
                        <RestaurantOpener
                            onOpen={handleOpenRestaurant}
                            locationName={location.locationName}
                        />
                    )
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {activeTab === 'billing' && <BillingPOS />}
                        {activeTab === 'reports' && <PlaceholderView title="Analytics & Reports" icon={BarChart3} />}
                        {activeTab === 'staff' && <PlaceholderView title="Staff Management" icon={Users} />}
                        {activeTab === 'inventory' && <PlaceholderView title="Inventory Management" icon={Package} />}
                        {activeTab === 'settings' && (
                            <LocationSettings
                                location={location}
                                restaurantId={restaurant?._id || restaurant?.id}
                                locationId={locationId}
                            />
                        )}
                    </div>
                )}
            </main>

            {showBackConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-card border border-border rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
                        <h2 className="text-lg md:text-xl font-bold text-foreground">
                            Close location before going back?
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            This location is currently <span className="font-semibold text-green-500">OPEN</span>. If you go
                            back to the locations screen, it will be marked as{" "}
                            <span className="font-semibold text-red-500">CLOSED</span>.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Do you want to close this location and go back to the locations list?
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <button
                                type="button"
                                disabled={isClosing}
                                onClick={() => {
                                    setShowBackConfirm(false);
                                }}
                                className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground hover:bg-muted transition-colors text-sm font-medium disabled:opacity-50"
                            >
                                Keep Location Open
                            </button>
                            <button
                                type="button"
                                disabled={isClosing}
                                onClick={async () => {
                                    await handleCloseRestaurant();
                                    setShowBackConfirm(false);
                                    navigate("/restaurant/welcome");
                                }}
                                className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isClosing ? "Closing..." : "Close & Go Back"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationDashboard;
