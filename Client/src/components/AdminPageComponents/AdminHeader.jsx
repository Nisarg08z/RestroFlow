import React, { useState, useEffect, useRef } from "react";
import { Menu, Bell, Building2, MessageSquare } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { getAllRestaurantRequests, getAdminTickets } from "../../utils/api";
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

    socketRef.current.on("newTicket", (newTicket) => {
      const notification = {
        id: newTicket._id,
        type: "ticket",
        title: "New Support Ticket",
        message: `${newTicket.restaurantId?.restaurantName || "Restaurant"} submitted a ticket: ${newTicket.subject}`,
        ticketToken: newTicket.ticketToken,
        restaurantName: newTicket.restaurantId?.restaurantName,
        createdAt: newTicket.createdAt,
        read: false,
      };
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      toast.success(`New ticket from ${newTicket.restaurantId?.restaurantName || "Restaurant"}`);
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

  useEffect(() => {
    if (location.pathname === "/admin/dashboard/requests") {
      markAllAsRead();
    }
    if (location.pathname === "/admin/dashboard/support") {
      markAllAsRead();
    }
  }, [location.pathname]);

  const fetchNotifications = async () => {
    try {
      const [requestsRes, ticketsRes] = await Promise.all([
        getAllRestaurantRequests({ status: "pending" }).catch(() => ({ data: { data: [] } })),
        getAdminTickets().catch(() => ({ data: { data: [] } })),
      ]);

      const pendingRequests = requestsRes.data?.data || [];
      const allTickets = ticketsRes.data?.data || [];

      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const newTickets = allTickets.filter(
        ticket => ticket.status === "OPEN" && new Date(ticket.createdAt) > oneDayAgo
      );

      const readIds = JSON.parse(localStorage.getItem("adminReadNotifications") || "[]");

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

      const allNotifications = [...ticketNotifications, ...requestNotifications]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);

      setNotifications(allNotifications);

      const unreadCount = allNotifications.filter(n => !n.read).length;
      setUnreadCount(unreadCount);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    if (!showNotifications) {
      setNotifications((prev) => prev.filter((n) => !n.read));
    }
  }, [showNotifications]);

  const markAsRead = (id) => {
    const readIds = JSON.parse(localStorage.getItem("adminReadNotifications") || "[]");
    if (!readIds.includes(id)) {
      readIds.push(id);
      localStorage.setItem("adminReadNotifications", JSON.stringify(readIds));
    }

    setNotifications((prev) => prev.map((notif) =>
      notif.id === id ? { ...notif, read: true } : notif
    ));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    const readIds = JSON.parse(localStorage.getItem("adminReadNotifications") || "[]");
    const newReadIds = notifications.map(n => n.id);
    const updatedReadIds = [...new Set([...readIds, ...newReadIds])];
    localStorage.setItem("adminReadNotifications", JSON.stringify(updatedReadIds));

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
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

  const unreadNotifications = notifications.filter((n) => !n.read);

  return (
    <header className="sticky top-0 z-30 bg-sidebar/95 backdrop-blur-sm border-b border-sidebar-border px-4 md:px-6 lg:px-8 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-sidebar-foreground/70 hover:text-sidebar-foreground transition"
          >
            <Menu className="w-6 h-6" />
          </button>

          <h1 className="text-xl md:text-2xl font-bold text-sidebar-foreground">
            {currentTitle}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative" ref={notificationRef}>
            <button
              onClick={handleBellClick}
              className="relative p-2 rounded-lg hover:bg-sidebar-accent transition"
            >
              <Bell className="w-5 h-5 text-sidebar-foreground" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-sidebar-primary rounded-full flex items-center justify-center text-xs font-bold text-sidebar-primary-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute -right-[3.5rem] sm:right-0 top-full mt-2 w-[92vw] sm:w-80 md:w-96 bg-sidebar border border-sidebar-border rounded-lg shadow-xl max-h-[80vh] overflow-y-auto z-50">
                <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
                  <h3 className="font-semibold text-sidebar-foreground">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="divide-y divide-sidebar-border">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-4 hover:bg-sidebar-accent cursor-pointer transition ${!notification.read ? "bg-sidebar-accent/50" : ""
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-sidebar-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            {notification.type === "ticket" ? (
                              <MessageSquare className="w-5 h-5 text-sidebar-primary" />
                            ) : (
                              <Building2 className="w-5 h-5 text-sidebar-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-sidebar-foreground">
                              {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-sidebar-primary rounded-full flex-shrink-0 mt-2" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="p-2 border-t border-sidebar-border flex gap-2">
                    <button
                      onClick={() => {
                        navigate("/admin/dashboard/requests");
                        setShowNotifications(false);
                      }}
                      className="flex-1 text-sm text-sidebar-primary hover:text-sidebar-primary/80 font-medium"
                    >
                      View Requests
                    </button>
                    <button
                      onClick={() => {
                        navigate("/admin/dashboard/support");
                        setShowNotifications(false);
                      }}
                      className="flex-1 text-sm text-sidebar-primary hover:text-sidebar-primary/80 font-medium"
                    >
                      View Tickets
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
