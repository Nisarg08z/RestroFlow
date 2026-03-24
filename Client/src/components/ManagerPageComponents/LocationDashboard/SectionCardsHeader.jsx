import React, { useEffect, useState } from "react";
import { ArrowLeft, BarChart3, Clock } from "lucide-react";
import { motion } from "framer-motion";

const SectionCardsHeader = ({
    locationName,
    locationAddress,
    isOpen,
    onBack,
    onOpenLocationStatus,
}) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <>
            <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border shadow-sm">
                <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
                    <div className="flex items-center justify-between gap-3 md:gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onBack}
                                className="group p-2.5 bg-muted/40 hover:bg-muted rounded-xl transition-all duration-300 border border-border/50 hover:border-border hover:shadow-md"
                                title="Back to Locations"
                            >
                                <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                            </button>

                            <h1 className="sm:hidden text-base font-bold text-foreground truncate max-w-[45vw]">
                                {locationName}
                            </h1>

                            <div className="hidden sm:flex flex-col">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
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
                                        {isOpen ? "Open" : "Closed"}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1 font-medium max-w-sm sm:max-w-md truncate">
                                    {locationAddress}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 sm:gap-3">
                            {isOpen && onOpenLocationStatus && (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onOpenLocationStatus}
                                    className="inline-flex items-center justify-center rounded-xl border border-border/70 bg-muted/40 hover:bg-muted text-sm font-semibold text-foreground transition-colors shadow-sm w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-2.5"
                                    title="Location Status"
                                >
                                    <BarChart3 className="w-4 h-4" />
                                    <span className="hidden sm:inline">Location Status</span>
                                </motion.button>
                            )}

                            <div className="hidden lg:flex items-center gap-3 pl-6 border-l border-border/60 shrink-0">
                                <div className="p-2.5 bg-muted/40 rounded-xl border border-border/50 text-muted-foreground">
                                    <Clock className="w-5 h-5 animate-[spin_60s_linear_infinite]" />
                                </div>
                                <div className="flex flex-col items-start pr-1">
                                    <span className="text-lg font-bold text-foreground font-mono tracking-tight leading-none">
                                        {currentTime.toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit",
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
                <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            </header>

        </>
    );
};

export default SectionCardsHeader;
