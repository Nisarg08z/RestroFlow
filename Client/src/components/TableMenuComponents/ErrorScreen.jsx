import React from 'react';
import { UtensilsCrossed } from 'lucide-react';

const ErrorScreen = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
            <UtensilsCrossed className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
                Menu Not Available
            </h2>
            <p className="text-muted-foreground">
                Unable to load the menu at this moment.
            </p>
        </div>
    );
};

export default ErrorScreen;
