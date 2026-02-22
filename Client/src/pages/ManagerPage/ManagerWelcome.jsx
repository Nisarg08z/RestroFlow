import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentRestaurant } from "../../utils/api";
import { Plus, Building2 } from "lucide-react";
import { LocationCard, AddLocationModal, LoadingScreen, ManagerHeader, TypewriterText } from "../../components/ManagerPageComponents";
import { motion } from "framer-motion";

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 24 },
    },
};

const AddLocationCard = ({ onClick }) => (
    <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.02, y: -5 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="group relative bg-muted/20 border-2 border-dashed border-border/60 hover:border-primary/50 hover:bg-muted/40 cursor-pointer rounded-3xl p-6 transition-colors duration-300 min-h-[220px] flex flex-col items-center justify-center space-y-5 overflow-hidden shadow-sm"
    >
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none" />

        <div className="w-16 h-16 bg-background border border-border/80 shadow-sm rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:border-primary group-hover:shadow-primary/20 transition-all duration-300 relative z-10">
            <Plus className="w-8 h-8 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
        </div>

        <div className="text-center relative z-10 space-y-1">
            <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors tracking-tight">
                Add New Workspace
            </h3>
            <p className="text-sm font-medium text-muted-foreground">
                Click to expand your operations
            </p>
        </div>
    </motion.div>
);

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

            <div className="p-6 md:p-8 lg:px-12 pt-8 md:pt-12">
                <div className="max-w-7xl mx-auto space-y-10">

                    {/* Header Section */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/50"
                    >
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 sm:p-2.5 bg-primary/10 rounded-xl">
                                    <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary/80" />
                                </div>
                                <h2 className="text-3xl md:text-3xl font-extrabold text-foreground tracking-tight flex items-center">
                                    <TypewriterText text="Active Workspaces" />
                                </h2>
                            </div>
                            <p className="text-lg font-medium text-muted-foreground ml-1">
                                Select an operations center to manage its performance
                            </p>
                        </div>
                    </motion.div>

                    {/* Content Section */}
                    {locations.length > 0 ? (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        >
                            {locations.map((loc) => (
                                <LocationCard
                                    key={loc._id || loc.id}
                                    location={loc}
                                    onSelect={handleLocationSelect}
                                />
                            ))}

                            <AddLocationCard onClick={() => setShowAddLocation(true)} />
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center max-w-2xl mx-auto py-24 text-center border-2 border-dashed border-border/60 rounded-[3rem] bg-gradient-to-b from-card/50 to-background"
                        >
                            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 shadow-inner pointer-events-none">
                                <Building2 className="w-10 h-10 text-primary" />
                            </div>

                            <h3 className="text-3xl font-bold tracking-tight text-foreground mb-3">
                                Welcome to RestroFlow!
                            </h3>
                            <p className="text-lg font-medium text-muted-foreground max-w-md mb-8">
                                To begin managing orders, viewing analytics, and configuring settings, you must first register your first physical location.
                            </p>

                            <button
                                onClick={() => setShowAddLocation(true)}
                                className="group px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold tracking-wide transition-all shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 active:translate-y-0 active:scale-95 inline-flex items-center gap-3"
                            >
                                <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                                Configure First Location
                            </button>
                        </motion.div>
                    )}
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
