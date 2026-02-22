import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { getCurrentRestaurant } from "../utils/api";
import { ManagerHeader, LoadingScreen } from "../components/ManagerPageComponents";

const ManagerPageLayout = () => {
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                const res = await getCurrentRestaurant();
                if (res.data?.success) {
                    setRestaurant(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch restaurant globally", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurant();
    }, []);

    if (loading) {
        return <LoadingScreen restaurant={null} />;
    }

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground relative">
            <ManagerHeader restaurant={restaurant} />
            <main className="flex-1 w-full relative">
                <Outlet context={{ restaurant }} />
            </main>
        </div>
    );
};

export default ManagerPageLayout;
