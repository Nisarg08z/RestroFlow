import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCurrentRestaurant } from "../../utils/api";
import { ChefView, ChefHeader, ChefLocationMenu, ChefOrderHistory } from "../../components/ChefPageComponents";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

const ChefDashboardPage = () => {
    const { locationId } = useParams();
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState(null);
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("kitchen");

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

    if (loading && !location) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                <p className="text-sm text-muted-foreground">Loading kitchen…</p>
            </div>
        );
    }

    if (!location) return null;

    const locationName = location.locationName || "Kitchen";
    const locationAddress = [location.address, location.city].filter(Boolean).join(", ") || "—";
    const isOpen = location.isActive === true;

    return (
        <div className="min-h-screen flex flex-col pb-8">
            <ChefHeader
                locationId={locationId}
                locationName={locationName}
                locationAddress={locationAddress}
                isOpen={isOpen}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />
            <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6">
                {activeTab === "kitchen" && <ChefView locationId={locationId} />}
                {activeTab === "menu" && <ChefLocationMenu locationId={locationId} />}
                {activeTab === "history" && <ChefOrderHistory locationId={locationId} />}
            </div>
        </div>
    );
};

export default ChefDashboardPage;
