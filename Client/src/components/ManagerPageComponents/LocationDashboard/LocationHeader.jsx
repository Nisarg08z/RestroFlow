import React from "react";
import {
    ArrowLeft, DollarSign, BarChart3, Users,
    Package, Settings
} from "lucide-react";

const LocationHeader = ({
    locationName,
    locationAddress,
    isOpen,
    activeTab,
    onTabChange,
    onBack,
}) => {
    const [currentTime, setCurrentTime] = React.useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    return (
        <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="group p-2 hover:bg-muted rounded-full transition-all duration-200 border border-transparent hover:border-border"
                            title="Back to Locations"
                        >
                            <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </button>

                        <div className="flex flex-col">
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl font-bold text-foreground leading-none tracking-tight">
                                    {locationName}
                                </h1>
                                <span className={`flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] uppercase font-bold rounded-full border tracking-wider shadow-sm ${isOpen
                                        ? 'bg-green-500/10 text-green-600 border-green-500/20'
                                        : 'bg-red-500/10 text-red-600 border-red-500/20'
                                    }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                    {isOpen ? 'Open' : 'Closed'}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 font-medium flex items-center gap-1.5">
                                <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-muted-foreground/50"></span>
                                {locationAddress}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex flex-col items-end mr-2">
                            <span className="text-xs font-bold text-foreground">
                                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                                {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>

                {isOpen && (
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-3 pt-1">
                        {[
                            { id: 'billing', label: 'Billing', icon: DollarSign },
                            { id: 'reports', label: 'Reports', icon: BarChart3 },
                            { id: 'staff', label: 'Staff', icon: Users },
                            { id: 'inventory', label: 'Inventory', icon: Package },
                            { id: 'settings', label: 'Settings', icon: Settings },
                        ].map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => onTabChange(tab.id)}
                                    className={`
                                        relative group flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ease-out whitespace-nowrap
                                        ${isActive
                                            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                                            : 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }
                                    `}
                                >
                                    <Icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </header>
    );
};

export default LocationHeader;
