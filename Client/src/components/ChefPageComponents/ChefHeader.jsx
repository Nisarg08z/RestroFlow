import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Flame, UtensilsCrossed, History, Clock } from "lucide-react";
import { motion } from "framer-motion";

const ChefHeader = ({ locationId, locationName, locationAddress, isOpen, activeTab, onTabChange }) => {
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleBack = () => navigate(`/restaurant/location/${locationId}`);

    const tabs = [
        { id: "kitchen", label: "Live Kitchen", icon: Flame },
        { id: "menu", label: "Menu Status", icon: UtensilsCrossed },
        { id: "history", label: "Order History", icon: History },
    ];

    return (
        <>
            <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border shadow-sm">
                <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                        {/* Left Section: Back Button & Location Title */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleBack}
                                className="group p-2.5 bg-muted/40 hover:bg-muted rounded-xl transition-all duration-300 border border-border/50 hover:border-border hover:shadow-md"
                                title="Back to Dashboard"
                            >
                                <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                            </button>

                            <div className="flex flex-col">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
                                        {locationName}
                                    </h1>
                                    <span
                                        className={`flex items-center gap-2 px-3 py-1 text-[11px] sm:text-xs uppercase font-bold rounded-full border tracking-wider shadow-sm transition-colors duration-300 ${isOpen
                                            ? "bg-green-500/10 text-green-600 border-green-500/20 shadow-green-500/10"
                                            : "bg-red-500/10 text-red-600 border-red-500/20 shadow-red-500/10"
                                            }`}
                                    >
                                        <span
                                            className={`w-2 h-2 rounded-full ${isOpen ? "bg-green-500 animate-pulse shadow-sm shadow-green-500" : "bg-red-500"
                                                }`}
                                        />
                                        {isOpen ? "Kitchen Open" : "Closed"}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1 font-medium flex items-center gap-2 max-w-sm sm:max-w-md truncate">
                                    {locationAddress}
                                </p>
                            </div>
                        </div>

                        {/* Right Section: View Controls and Clock */}
                        <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">

                            {/* Tab Navigation Desktop */}
                            <div className="hidden md:flex items-center p-1 bg-muted/30 rounded-2xl border border-border/50 max-w-full overflow-x-auto scrollbar-hide shrink-0">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;

                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => onTabChange(tab.id)}
                                            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ease-out shrink-0 ${isActive
                                                ? "text-primary-foreground"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                                }`}
                                        >
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeTabChef"
                                                    className="absolute inset-0 bg-primary rounded-xl shadow-md"
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                />
                                            )}
                                            <span className="relative z-10 flex items-center gap-2">
                                                <Icon className={`w-4 h-4 ${isActive ? "animate-pulse" : ""}`} />
                                                {tab.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Live Clock Section */}
                            <div className="hidden lg:flex items-center gap-3 pl-6 border-l border-border/60 shrink-0">
                                <div className="p-2.5 bg-muted/40 rounded-xl border border-border/50 text-muted-foreground">
                                    <Clock className="w-5 h-5 animate-[spin_60s_linear_infinite]" />
                                </div>
                                <div className="flex flex-col items-start pr-1">
                                    <span className="text-lg font-bold text-foreground font-mono tracking-tight leading-none">
                                        {currentTime.toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit"
                                        })}
                                    </span>
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-1">
                                        {currentTime.toLocaleDateString("en-US", {
                                            weekday: "short",
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </span>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Subtle bottom gradient line */}
                <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            </header>

            {/* Mobile Bottom Navigation Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-card/90 backdrop-blur-xl border-t border-border shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)]">
                <div className="flex items-center justify-around px-2 py-2 gap-1 pb-safe">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={`relative flex flex-col items-center justify-center gap-1.5 flex-1 py-2 rounded-xl transition-all duration-300 ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTabMobileChef"
                                        className="absolute inset-0 bg-primary/10 rounded-xl"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <Icon className={`w-6 h-6 relative z-10 ${isActive ? "animate-pulse" : ""}`} />
                                <span className="text-[10px] font-bold tracking-wide relative z-10 text-center">
                                    {tab.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default ChefHeader;
