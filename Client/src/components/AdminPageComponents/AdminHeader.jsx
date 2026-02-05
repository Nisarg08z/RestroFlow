import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Building2,
  MessageSquare,
  LayoutDashboard,
  Inbox,
  Activity,
  CreditCard,
  HeadphonesIcon,
  LogOut,
} from "lucide-react";
import { io } from "socket.io-client";
import { adminLogout } from "../../utils/api";
import toast from "react-hot-toast";
import Logo from "../../assets/logo.png";
import { useAdminData } from "../../context/AdminDataContext";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { id: "requests", label: "Requests", icon: Inbox, path: "/admin/dashboard/requests" },
  { id: "status", label: "Status", icon: Activity, path: "/admin/dashboard/status" },
  { id: "subscriptions", label: "Plans", icon: CreditCard, path: "/admin/dashboard/subscriptions" },
  { id: "support", label: "Tickets", icon: HeadphonesIcon, path: "/admin/dashboard/support" },
];

const AdminHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { requests, tickets, setRequests, setTickets } = useAdminData();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [readVersion, setReadVersion] = useState(0);

  const socketRef = useRef(null);
  const notificationRef = useRef(null);

  const notifications = useMemo(() => {
    const readIds = JSON.parse(localStorage.getItem("adminReadNotifications") || "[]");
    const pendingRequests = requests.filter((r) => r.status === "pending");
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const newTickets = tickets.filter(
      (t) => t.status === "OPEN" && new Date(t.createdAt) > oneDayAgo
    );

    const requestNotifications = pendingRequests.slice(0, 5).map((req) => ({
      id: req._id,
      type: "request",
      title: "Restaurant Request",
      message: `${req.restaurantName} submitted a request`,
      restaurantName: req.restaurantName,
      ownerName: req.ownerName,
      email: req.email,
      createdAt: req.createdAt,
      read: readIds.includes(req._id) || location.pathname === "/admin/dashboard/requests",
    }));

    const ticketNotifications = newTickets.slice(0, 5).map((ticket) => ({
      id: ticket._id,
      type: "ticket",
      title: "New Support Ticket",
      message: `${ticket.restaurantId?.restaurantName || "Restaurant"} submitted: ${ticket.subject}`,
      ticketToken: ticket.ticketToken,
      restaurantName: ticket.restaurantId?.restaurantName,
      createdAt: ticket.createdAt,
      read: readIds.includes(ticket._id) || location.pathname === "/admin/dashboard/support",
    }));

    return [...ticketNotifications, ...requestNotifications]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);
  }, [requests, tickets, location.pathname, readVersion]);

  useEffect(() => {
    setUnreadCount(notifications.filter((n) => !n.read).length);
  }, [notifications]);

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL, {
      withCredentials: true,
    });

    socketRef.current.on("newRestaurantRequest", (newRequest) => {
      setRequests((prev) => [newRequest, ...prev]);
      toast.success(`New request from ${newRequest.restaurantName}`);
    });

    socketRef.current.on("newTicket", (newTicket) => {
      setTickets((prev) => [newTicket, ...prev]);
      toast.success(`New ticket from ${newTicket.restaurantId?.restaurantName || "Restaurant"}`);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [setRequests, setTickets]);

  // Helper to check active state
  const isActive = (path) => {
    if (path === "/admin/dashboard") {
      return location.pathname === "/admin/dashboard" || location.pathname === "/admin/dashboard/";
    }
    return location.pathname === path;
  };

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("accessToken");
    toast.success("Logged out successfully");
    navigate("/", { replace: true });
    adminLogout().catch(() => {}); // Fire and forget - logout locally first
  };

  useEffect(() => {
    if (location.pathname === "/admin/dashboard/requests") {
      const readIds = JSON.parse(localStorage.getItem("adminReadNotifications") || "[]");
      const requestIds = requests.filter((r) => r.status === "pending").map((r) => r._id);
      const updatedReadIds = [...new Set([...readIds, ...requestIds])];
      localStorage.setItem("adminReadNotifications", JSON.stringify(updatedReadIds));
      setReadVersion((v) => v + 1);
    } else if (location.pathname === "/admin/dashboard/support") {
      const readIds = JSON.parse(localStorage.getItem("adminReadNotifications") || "[]");
      const ticketIds = tickets.filter((t) => t.status === "OPEN").map((t) => t._id);
      const updatedReadIds = [...new Set([...readIds, ...ticketIds])];
      localStorage.setItem("adminReadNotifications", JSON.stringify(updatedReadIds));
      setReadVersion((v) => v + 1);
    }
  }, [location.pathname, requests, tickets]);

  // Handle click outside for notifications
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = (id) => {
    const readIds = JSON.parse(localStorage.getItem("adminReadNotifications") || "[]");
    if (!readIds.includes(id)) {
      readIds.push(id);
      localStorage.setItem("adminReadNotifications", JSON.stringify(readIds));
      setReadVersion((v) => v + 1);
    }
  };

  const markAllAsRead = () => {
    const readIds = JSON.parse(localStorage.getItem("adminReadNotifications") || "[]");
    const newReadIds = notifications.map((n) => n.id);
    const updatedReadIds = [...new Set([...readIds, ...newReadIds])];
    localStorage.setItem("adminReadNotifications", JSON.stringify(updatedReadIds));
    setReadVersion((v) => v + 1);
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    if (notification.type === "ticket") {
      navigate("/admin/dashboard/support");
    } else {
      navigate("/admin/dashboard/requests");
    }
    setShowNotifications(false);
  };

  const handleBellClick = () => {
    if (showNotifications) {
      setShowNotifications(false);
    } else {
      setShowNotifications(true);
      if (notifications.length > 0) {
        markAllAsRead();
      } else {
        setUnreadCount(0);
      }
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            {/* Logo Section */}
            <Link to="/admin/dashboard" className="flex items-center gap-3 group relative z-50">
              <div className="relative w-9 h-9 flex items-center justify-center">
                <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300" />
                <img src={Logo} alt="RestroFlow" className="w-8 h-8 object-contain relative z-10" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-foreground tracking-tight">
                  RestroFlow
                </span>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest leading-none">
                  Admin
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {menuItems.map((item) => {
                const active = isActive(item.path);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 relative group
                      ${active
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}
                    `}
                  >
                    <Icon className={`w-4 h-4 transition-transform duration-300 ${active ? "scale-110" : "group-hover:scale-110"}`} />
                    {item.label}
                    {active && (
                      <span className="absolute inset-0 rounded-full ring-2 ring-primary/20 animate-pulse" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Section */}
            <div className="flex items-center gap-2 sm:gap-4">

              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={handleBellClick}
                  className="relative p-2.5 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all duration-300 group"
                >
                  <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-background animate-bounce" />
                  )}
                </button>

                {/* Notification Dropdown - fixed positioning for all devices */}
                {showNotifications && (
                  <>
                    {/* Backdrop for mobile - closes on tap outside */}
                    <div
                      className="fixed inset-0 z-[60] lg:hidden"
                      onClick={() => setShowNotifications(false)}
                      aria-hidden="true"
                    />
                    <div className="fixed left-4 right-4 top-[4.5rem] sm:left-auto sm:right-0 sm:top-auto sm:absolute sm:mt-4 sm:w-96 z-[70] max-w-[calc(100vw-2rem)] bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-3xl animate-in fade-in slide-in-from-top-2">
                      <div className="p-4 border-b border-border/50 bg-muted/30 flex items-center justify-between">
                        <h3 className="font-semibold text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <div className="max-h-[calc(100vh-12rem)] sm:max-h-[60vh] overflow-y-auto custom-scrollbar pb-safe">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
                          <Bell className="w-8 h-8 opacity-20" />
                          No new notifications
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`
                              p-4 border-b border-border/40 hover:bg-muted/30 cursor-pointer transition-colors
                              ${!notification.read ? "bg-primary/5" : ""}
                            `}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`
                                p-2 rounded-xl flex-shrink-0
                                ${notification.type === "ticket" ? "bg-blue-500/10 text-blue-500" : "bg-purple-500/10 text-purple-500"}
                              `}>
                                {notification.type === "ticket" ? (
                                  <MessageSquare className="w-4 h-4" />
                                ) : (
                                  <Building2 className="w-4 h-4" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium leading-none mb-1.5">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-[10px] text-muted-foreground/70 mt-2">
                                  {new Date(notification.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  </>
                )}
              </div>

              {/* Logout Button */}
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
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/50 lg:hidden pb-safe">
        <div className="flex justify-around items-center h-16">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <div className={`p-1 rounded-xl transition-all ${active ? "bg-primary/10" : "bg-transparent"}`}>
                  <Icon className={`w-5 h-5 ${active ? "scale-110" : ""}`} />
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  );
};

export default AdminHeader;
