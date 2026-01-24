import React, { useState } from "react";
import { Power, AlertCircle } from "lucide-react";

const RestaurantOpener = ({ onOpen, locationName, isSubscriptionExpired }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in duration-700 p-4">
            <div className="text-center space-y-8 max-w-md mx-auto">
                <div className="space-y-2">
                    <h2 className="text-2xl md:text-4xl font-bold text-foreground">
                        {locationName} is Closed
                    </h2>
                    {isSubscriptionExpired ? (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 space-y-2">
                            <div className="flex items-center justify-center gap-2 text-red-500">
                                <AlertCircle className="w-5 h-5" />
                                <p className="font-semibold">Subscription Expired</p>
                            </div>
                            <p className="text-muted-foreground text-sm">
                                Your subscription has expired. Please renew your subscription to open this location.
                            </p>
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-base md:text-lg">
                            Ready to start the day? Open the restaurant to access billing and management tools.
                        </p>
                    )}
                </div>

                <div
                    className={`relative group inline-flex justify-center ${
                        isSubscriptionExpired ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                    }`}
                    onMouseEnter={() => !isSubscriptionExpired && setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onClick={() => !isSubscriptionExpired && onOpen()}
                >
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-75 duration-[3000ms]" />
                    <div className="absolute inset-4 bg-primary/20 rounded-full animate-ping opacity-75 animation-delay-500 duration-[3000ms]" />

                    <div className={`
                        relative w-32 h-32 md:w-40 md:h-40 rounded-full 
                        flex items-center justify-center 
                        bg-gradient-to-br from-primary to-primary/80 
                        shadow-2xl shadow-primary/30 
                        transition-all duration-500 ease-out border-4 border-background
                        ${isHovered ? 'scale-105 shadow-primary/50' : 'scale-100'}
                    `}>
                        <Power className={`w-12 h-12 md:w-16 md:h-16 text-primary-foreground transition-all duration-500 ${isHovered ? 'opacity-100 scale-110' : 'opacity-90'}`} />
                    </div>
                </div>

                <p className="text-sm font-medium text-muted-foreground animate-pulse">
                    Power On to Begin Operations
                </p>
            </div>
        </div>
    );
};

export default RestaurantOpener;
