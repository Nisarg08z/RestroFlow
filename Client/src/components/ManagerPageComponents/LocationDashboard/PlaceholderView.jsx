import React from "react";

const PlaceholderView = ({ title, icon: Icon }) => (
    <div className="flex flex-col items-center justify-center h-[50vh] text-center p-6 animate-in fade-in duration-500">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Icon className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground max-w-sm">
            This module is currently under development. Soon you will be able to manage your {title.toLowerCase()} here.
        </p>
    </div>
);

export default PlaceholderView;
