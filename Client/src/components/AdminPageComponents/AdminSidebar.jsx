import React from "react";
import {
  Link,
  useLocation,
  useNavigate
} from "react-router-dom";
import {
  LayoutDashboard,
  Inbox,
  Activity,
  CreditCard,
  HeadphonesIcon,
  X,
  LogOut
} from "lucide-react";
import Logo from "../../assets/logo.png";
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
      navigate("/admin/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.removeItem("role");
      localStorage.removeItem("accessToken");
      navigate("/admin/login", { replace: true });
    }
  };
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-sidebar/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-sidebar border-r border-sidebar-border z-50 flex flex-col transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >

        <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={Logo} alt="RestroFlow" className="w-9 h-9 object-contain" />
            <div>
              <span className="text-lg font-bold text-sidebar-foreground">
                RestroFlow
              </span>
              <p className="text-xs text-sidebar-foreground/70">Admin Panel</p>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="lg:hidden text-sidebar-foreground/70 hover:text-sidebar-foreground"
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
                ${isActive(item.path)
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>


        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-lg border border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition"
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
