import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCurrentRestaurant } from "../../utils/api";
import { LoadingScreen } from "../../components/ManagerPageComponents";
import {
    ManagerHeader,
    BillingPOS,
    OrdersView,
    LocationSettings,
    StaffManagement,
} from "../../components/ManagerPageComponents/LocationDashboard";
import { toast } from "react-hot-toast";

const ManagerDashboardPage = () => {
    const { locationId } = useParams();
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState(null);
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("billing");

    useEffect(() => {
        fetchData();
    }, [locationId]);

    const fetchData = async () => {
        try {
            const res = await getCurrentRestaurant();
            const data = res.data?.success !== false ? (res.data?.data || res.data) : null;
            if (data && Array.isArray(data.locations)) {
                setRestaurant(data);
                const loc = data.locations.find(
                    (l) => String(l._id ?? l.id ?? "") === String(locationId ?? "")
                );
                if (loc) {
                    setLocation(loc);
                } else {
                    toast.error("Location not found");
                    navigate("/restaurant/welcome");
                }
            } else {
                toast.error("Could not load locations");
                navigate("/restaurant/welcome");
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
            toast.error("Failed to load location data");
            navigate("/restaurant/welcome");
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate(`/restaurant/location/${locationId}`);
    };

    if (loading) return <LoadingScreen restaurant={restaurant} />;
    if (!location) return null;

    const isOpen = location?.isActive === true;

    return (
        <div className="min-h-screen bg-background pb-8 flex flex-col">
            <ManagerHeader
                locationName={location.locationName}
                locationAddress={`${location.address}, ${location.city}`}
                isOpen={isOpen}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onBack={handleBack}
            />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6">
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {activeTab === "billing" && <BillingPOS locationId={locationId} />}
                    {activeTab === "orders" && <OrdersView locationId={locationId} />}
                    {activeTab === "staff" && (
                        <StaffManagement
                            restaurantId={restaurant?._id || restaurant?.id}
                            locationId={locationId}
                        />
                    )}
                    {activeTab === "settings" && (
                        <LocationSettings
                            location={location}
                            restaurantId={restaurant?._id || restaurant?.id}
                            locationId={locationId}
                        />
                    )}
                </div>
            </main>
        </div>
    );
};

export default ManagerDashboardPage;
