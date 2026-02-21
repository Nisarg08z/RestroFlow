import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { LogOut, ChevronLeft, ChefHat } from "lucide-react";
import { restaurantLogout } from "../../utils/api";
import { toast } from "react-hot-toast";
import Logo from "../../assets/logo.png";

const ChefHeader = ({ restaurant }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await restaurantLogout();
            localStorage.removeItem("accessToken");
            localStorage.removeItem("role");
            localStorage.removeItem("showWelcomeAnimation");
            toast.success("Logged out successfully");
            navigate("/");
        } catch (error) {
            console.error("Logout error:", error);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("role");
            localStorage.removeItem("showWelcomeAnimation");
            toast.success("Logged out successfully");
            navigate("/");
        }
    };

    const isWelcomePage = location.pathname === "/chef" || location.pathname === "/chef/welcome";

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-3">
                        {!isWelcomePage ? (
                            <button
                                type="button"
                                onClick={() => navigate("/chef/welcome")}
                                className="p-2 rounded-xl hover:bg-muted/50 text-foreground transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                        ) : null}
                        <Link to="/chef" className="flex items-center gap-3 group relative z-50">
                            <div className="relative w-9 h-9 flex items-center justify-center">
                                <div className="absolute inset-0 bg-orange-500/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300" />
                                <img src={Logo} alt="RestroFlow" className="w-8 h-8 object-contain relative z-10" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-bold text-foreground tracking-tight">
                                    RestroFlow
                                </span>
                                <span className="text-[10px] font-medium text-orange-600 uppercase tracking-widest leading-none flex items-center gap-1">
                                    <ChefHat className="w-3 h-3" />
                                    Chef
                                </span>
                            </div>
                        </Link>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-2 lg:px-4 py-2 rounded-full lg:bg-red-500/10 text-red-500 lg:hover:bg-red-500 lg:hover:text-white transition-all duration-300 text-sm font-medium group"
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5 lg:w-4 lg:h-4 group-hover:-translate-x-0.5 transition-transform" />
                        <span className="hidden lg:inline">Logout</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default ChefHeader;
