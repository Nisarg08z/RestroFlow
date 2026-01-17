import React from "react";
import { Loader2 } from "lucide-react";
import Logo from "../../assets/logo.png";

const LoadingScreen = ({ restaurant }) => {
    return (
        <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center animate-in fade-in duration-500">
            <div className="flex flex-col items-center space-y-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                    <img
                        src={Logo}
                        alt="RestroFlow"
                        className="w-24 h-24 md:w-32 md:h-32 object-contain relative z-10 animate-bounce"
                    />
                </div>

                <div className="text-center space-y-2">
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground animate-pulse">
                        Welcome to RestroFlow
                    </h1>
                    {restaurant && (
                        <p className="text-xl text-muted-foreground font-medium fade-in duration-1000">
                            {restaurant.restaurantName || restaurant.email}
                        </p>
                    )}
                    {!restaurant && (
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary mt-4" />
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
