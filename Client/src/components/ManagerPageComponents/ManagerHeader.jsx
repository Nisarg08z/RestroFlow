import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut, UserCircle, Settings, ChevronDown, LifeBuoy } from "lucide-react";
import { restaurantLogout } from "../../utils/api";
import { toast } from "react-hot-toast";
import Logo from "../../assets/logo.png";

const ManagerHeader = ({ restaurant }) => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await restaurantLogout();
            localStorage.removeItem("accessToken");
            localStorage.removeItem("role");
            toast.success("Logged out successfully");
            navigate("/login");
        } catch (error) {
            console.error("Logout error:", error);
            // Clear local storage even if API call fails
            localStorage.removeItem("accessToken");
            localStorage.removeItem("role");
            toast.success("Logged out successfully");
            navigate("/login");
        }
    };

    const handleProfile = () => {
        setShowUserMenu(false);
        navigate("/restaurant/profile");
    };

    const handleSettings = () => {
        setShowUserMenu(false);
        // TODO: Navigate to settings page when implemented
        toast.info("Settings page coming soon");
    };

    const restaurantName = restaurant?.restaurantName || restaurant?.email || "Restaurant";
    const displayName = restaurantName.length > 20
        ? restaurantName.substring(0, 20) + "..."
        : restaurantName;

    return (
        <header className="sticky top-0 z-50 w-full bg-card border-b border-border shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <img
                            src={Logo}
                            alt="RestroFlow"
                            className="h-8 w-8 object-contain"
                        />
                        <span className="text-xl font-bold text-foreground hidden sm:inline">
                            RestroFlow
                        </span>
                    </div>

                    {/* User Menu */}
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors group"
                        >
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <User className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-sm font-medium text-foreground hidden md:inline max-w-[200px] truncate">
                                {displayName}
                            </span>
                            <ChevronDown
                                className={`w-4 h-4 text-muted-foreground transition-transform ${showUserMenu ? "rotate-180" : ""
                                    }`}
                            />
                        </button>

                        {/* Dropdown Menu */}
                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg py-1 animate-in fade-in zoom-in-95 duration-200">
                                <div className="px-4 py-2 border-b border-border">
                                    <p className="text-sm font-medium text-foreground truncate">
                                        {restaurantName}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {restaurant?.email}
                                    </p>
                                </div>

                                <button
                                    onClick={handleProfile}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                                >
                                    <UserCircle className="w-4 h-4 text-muted-foreground" />
                                    Profile
                                </button>

                                <button
                                    onClick={() => {
                                        setShowUserMenu(false);
                                        navigate("/restaurant/support");
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                                >
                                    <LifeBuoy className="w-4 h-4 text-muted-foreground" />
                                    Help & Support
                                </button>

                                <button
                                    onClick={handleSettings}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                                >
                                    <Settings className="w-4 h-4 text-muted-foreground" />
                                    Settings
                                </button>

                                <div className="border-t border-border my-1" />

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default ManagerHeader;
