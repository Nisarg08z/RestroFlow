import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  UtensilsCrossed,
  LayoutDashboard,
  Inbox,
  Activity,
  CreditCard,
  HeadphonesIcon,
  X,
  LogOut,
} from "lucide-react";
import { adminLogout } from "../../utils/api";
import toast from "react-hot-toast";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, path: "/admin/dashboard" },
  { id: "requests", label: "Restaurant Requests", icon: <Inbox className="w-5 h-5" />, path: "/admin/dashboard/requests" },
  { id: "status", label: "Restaurant Status", icon: <Activity className="w-5 h-5" />, path: "/admin/dashboard/status" },
  { id: "subscriptions", label: "Subscriptions", icon: <CreditCard className="w-5 h-5" />, path: "/admin/dashboard/subscriptions" },
  { id: "support", label: "Support Tickets", icon: <HeadphonesIcon className="w-5 h-5" />, path: "/admin/dashboard/support" },
];

const AdminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path) => {
    if (path === "/admin/dashboard") {
      return location.pathname === "/admin/dashboard" || location.pathname === "/admin/dashboard/";
    }
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await adminLogout();
      localStorage.removeItem("role");
      localStorage.removeItem("accessToken");
      toast.success("Logged out successfully");
      navigate("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.removeItem("role");
      localStorage.removeItem("accessToken");
      navigate("/admin/login");
    }
  };
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-[oklch(0.13_0.005_260)]/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[oklch(0.17_0.005_260)] border-r border-[oklch(0.28_0.005_260)] z-50 flex flex-col transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        
        <div className="p-6 border-b border-[oklch(0.28_0.005_260)] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[oklch(0.7_0.18_45)] rounded-lg flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-[oklch(0.13_0.005_260)]" />
            </div>
            <div>
              <span className="text-lg font-bold text-[oklch(0.98_0_0)]">
                RestroFlow
              </span>
              <p className="text-xs text-[oklch(0.65_0_0)]">Admin Panel</p>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="lg:hidden text-[oklch(0.65_0_0)] hover:text-[oklch(0.98_0_0)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              onClick={onClose}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                ${
                  isActive(item.path)
                    ? "bg-[oklch(0.7_0.18_45)] text-[oklch(0.13_0.005_260)]"
                    : "text-[oklch(0.65_0_0)] hover:text-[oklch(0.98_0_0)] hover:bg-[oklch(0.22_0.005_260)]"
                }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        
        <div className="p-4 border-t border-[oklch(0.28_0.005_260)]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-lg border border-[oklch(0.28_0.005_260)] text-[oklch(0.98_0_0)] hover:bg-[oklch(0.22_0.005_260)] transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
