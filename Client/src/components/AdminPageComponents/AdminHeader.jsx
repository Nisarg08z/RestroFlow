import React, { useState, useEffect, useRef } from "react";
import { Menu, Bell, Building2, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { getAllRestaurantRequests } from "../../utils/api";
import toast from "react-hot-toast";

const sectionTitles = {
  "/admin/dashboard": "Dashboard",
  "/admin/dashboard/requests": "Restaurant Requests",
  "/admin/dashboard/status": "Restaurant Status",
  "/admin/dashboard/subscriptions": "Subscription Management",
  "/admin/dashboard/support": "Support Tickets",
};

const AdminHeader = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentTitle = sectionTitles[location.pathname] || "Dashboard";
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    fetchNotifications();

    socketRef.current = io(import.meta.env.VITE_SOCKET_URL, {
      withCredentials: true,
    });

    socketRef.current.on("newRestaurantRequest", (newRequest) => {
      const notification = {
        id: newRequest._id,
        type: "request",
        title: "New Restaurant Request",
        message: `${newRequest.restaurantName} submitted a request`,
        restaurantName: newRequest.restaurantName,
        ownerName: newRequest.ownerName,
        email: newRequest.email,
        createdAt: newRequest.createdAt,
        read: false,
      };
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      toast.success(`New request from ${newRequest.restaurantName}`);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await getAllRestaurantRequests({
        status: "pending",
      });
      const pendingRequests = response.data.data || [];
      const notificationList = pendingRequests.slice(0, 10).map((req) => ({
        id: req._id,
        type: "request",
        title: "Restaurant Request",
        message: `${req.restaurantName} submitted a request`,
        restaurantName: req.restaurantName,
        ownerName: req.ownerName,
        email: req.email,
        createdAt: req.createdAt,
        read: false,
      }));
      setNotifications(notificationList);
      setUnreadCount(notificationList.length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    navigate("/admin/dashboard/requests");
    setShowNotifications(false);
  };

  const unreadNotifications = notifications.filter((n) => !n.read);

  return (
    <header className="sticky top-0 z-30 bg-[oklch(0.17_0.005_260)]/95 backdrop-blur-sm border-b border-[oklch(0.28_0.005_260)] px-4 md:px-6 lg:px-8 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-[oklch(0.65_0_0)] hover:text-[oklch(0.98_0_0)] transition"
          >
            <Menu className="w-6 h-6" />
          </button>

          <h1 className="text-xl md:text-2xl font-bold text-[oklch(0.98_0_0)]">
            {currentTitle}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-[oklch(0.22_0.005_260)] transition"
            >
              <Bell className="w-5 h-5 text-[oklch(0.98_0_0)]" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-[oklch(0.7_0.18_45)] rounded-full flex items-center justify-center text-xs font-bold text-[oklch(0.13_0.005_260)]">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-lg shadow-xl max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-[oklch(0.28_0.005_260)] flex items-center justify-between">
                  <h3 className="font-semibold text-[oklch(0.98_0_0)]">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span className="text-xs text-[oklch(0.65_0_0)]">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="divide-y divide-[oklch(0.28_0.005_260)]">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-[oklch(0.65_0_0)]">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-4 hover:bg-[oklch(0.22_0.005_260)] cursor-pointer transition ${!notification.read ? "bg-[oklch(0.22_0.005_260)]/50" : ""
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-[oklch(0.7_0.18_45)]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-5 h-5 text-[oklch(0.7_0.18_45)]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[oklch(0.98_0_0)]">
                              {notification.title}
                            </p>
                            <p className="text-xs text-[oklch(0.65_0_0)] mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-[oklch(0.65_0_0)] mt-1">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-[oklch(0.7_0.18_45)] rounded-full flex-shrink-0 mt-2" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="p-2 border-t border-[oklch(0.28_0.005_260)]">
                    <button
                      onClick={() => navigate("/admin/dashboard/requests")}
                      className="w-full text-sm text-[oklch(0.7_0.18_45)] hover:text-[oklch(0.7_0.18_45)]/80 font-medium"
                    >
                      View All Requests
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="w-9 h-9 bg-[oklch(0.7_0.18_45)] rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-[oklch(0.13_0.005_260)]">
              AD
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
