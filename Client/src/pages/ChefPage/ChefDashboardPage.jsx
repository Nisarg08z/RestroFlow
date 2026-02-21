import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCurrentRestaurant } from "../../utils/api";
import { ChefView } from "../../components/ChefPageComponents";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

const ChefDashboardPage = () => {
    const { locationId } = useParams();
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState(null);
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);

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
                    navigate("/chef");
                }
            } else {
                toast.error("Could not load locations");
                navigate("/chef");
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
            toast.error("Failed to load location data");
            navigate("/chef");
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

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-lg font-semibold text-foreground">
                    {location.locationName || "Kitchen"}
                </h1>
                <p className="text-sm text-muted-foreground">
                    {location.address}, {location.city}
                </p>
            </div>
            <ChefView locationId={locationId} />
        </div>
    );
};

export default ChefDashboardPage;
