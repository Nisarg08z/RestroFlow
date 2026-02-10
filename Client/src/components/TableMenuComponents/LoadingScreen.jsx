import React from 'react';

const LoadingScreen = () => {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground animate-pulse font-medium">
                    Loading Menu...
                </p>
            </div>
        </div>
    );
};

export default LoadingScreen;
