import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, LogOut, UserCircle, Settings, ChevronDown, LifeBuoy, Bell, MessageSquare } from "lucide-react";
import { restaurantLogout, getRestaurantTickets } from "../../utils/api";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";

const ManagerHeader = ({ restaurant }) => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const menuRef = useRef(null);
    const notificationRef = useRef(null);
    const socketRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetchNotifications();

        socketRef.current = io(import.meta.env.VITE_SOCKET_URL, {
            withCredentials: true,
        });

        if (restaurant?._id || restaurant?.id) {
            const restaurantId = (restaurant._id || restaurant.id).toString();
            socketRef.current.emit('joinRestaurant', restaurantId);
        }

        socketRef.current.on('ticketUpdate', (data) => {
            const notificationId = (data.ticketId || data._id || data.id || Date.now()).toString();

            const readNotifications = JSON.parse(
                localStorage.getItem("readTicketNotifications") || "[]"
            );
            const isRead = readNotifications.includes(notificationId);

            if (data.adminResponse || (data.status && data.status !== 'OPEN' && data.status !== 'IN_PROGRESS')) {
                const notification = {
                    id: notificationId,
                    type: "ticket",
                    title: "Ticket Update",
                    message: `Your ticket ${data.ticketToken} has been ${data.status?.toLowerCase().replace('_', ' ')}`,
                    ticketToken: data.ticketToken,
                    status: data.status,
                    adminResponse: data.adminResponse,
                    createdAt: new Date().toISOString(),
                    read: isRead,
                };

                setNotifications((prev) => {
                    if (prev.some(n => n.id === notificationId)) return prev;
                    return [notification, ...prev];
                });

                if (!isRead) {
                    setUnreadCount((prev) => prev + 1);
                }
                toast.success(`Ticket ${data.ticketToken} updated`);
            }
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [restaurant?._id]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const unreadCount = notifications.filter(n => !n.read).length;
        setUnreadCount(unreadCount);
    }, [notifications]);

    useEffect(() => {
        if (!showNotifications) {
            setNotifications((prev) => prev.filter((n) => !n.read));
        }
    }, [showNotifications]);

    const fetchNotifications = async () => {
        try {
            const response = await getRestaurantTickets();
            const tickets = response.data?.data || [];

            const readNotifications = JSON.parse(
                localStorage.getItem("readTicketNotifications") || "[]"
            );

            const ticketNotifications = tickets
                .filter(ticket => {
                    const notificationId = ticket._id.toString();
                    if (readNotifications.includes(notificationId)) return false;

                    return ticket.adminResponse || (ticket.status !== 'OPEN' && ticket.status !== 'IN_PROGRESS');
                })
                .slice(0, 10)
                .map((ticket) => ({
                    id: ticket._id.toString(),
                    type: "ticket",
                    title: "Ticket Update",
                    message: `Your ticket ${ticket.ticketToken} has been ${ticket.status?.toLowerCase().replace('_', ' ')}`,
                    ticketToken: ticket.ticketToken,
                    status: ticket.status,
                    adminResponse: ticket.adminResponse,
                    createdAt: ticket.updatedAt || ticket.createdAt,
                    read: false,
                }));

            setNotifications(ticketNotifications);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
            setNotifications([]);
            setUnreadCount(0);
        }
    };

    const markAsRead = (id) => {
        const readNotifications = JSON.parse(
            localStorage.getItem("readTicketNotifications") || "[]"
        );
        if (!readNotifications.includes(id)) {
            readNotifications.push(id);
            localStorage.setItem("readTicketNotifications", JSON.stringify(readNotifications));
        }

        setNotifications((prev) => prev.map((notif) =>
            notif.id === id ? { ...notif, read: true } : notif
        ));
        setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    const markAllAsRead = () => {
        const readNotifications = JSON.parse(
            localStorage.getItem("readTicketNotifications") || "[]"
        );
        const currentNotificationIds = notifications.map(n => n.id);
        const updatedReadNotifications = [...new Set([...readNotifications, ...currentNotificationIds])];
        localStorage.setItem("readTicketNotifications", JSON.stringify(updatedReadNotifications));

        setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    useEffect(() => {
        if (location.pathname === "/restaurant/support") {
            markAllAsRead();
        }
    }, [location.pathname]);

    const handleNotificationClick = (notification) => {
        markAsRead(notification.id);
        navigate("/restaurant/support");
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

    const handleLogout = async () => {
        try {
            await restaurantLogout();
            localStorage.removeItem("accessToken");
            localStorage.removeItem("role");
            localStorage.removeItem("showWelcomeAnimation");
            toast.success("Logged out successfully");
            navigate("/login");
        } catch (error) {
            console.error("Logout error:", error);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("role");
            localStorage.removeItem("showWelcomeAnimation");
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
        toast.info("Settings page coming soon");
    };

    const restaurantName = restaurant?.restaurantName || restaurant?.email || "Restaurant";

    return (
        <header className="sticky top-0 z-50 w-full bg-card border-b border-border shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-foreground">
                            {restaurantName}
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-6">
                        <button
                            onClick={() => navigate("/restaurant/welcome")}
                            className={`text-sm font-medium transition-colors ${
                                location.pathname === "/restaurant/welcome"
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Locations
                        </button>
                        <button
                            onClick={() => navigate("/restaurant/menu")}
                            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                                location.pathname === "/restaurant/menu"
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Menu
                        </button>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={handleBellClick}
                                className="relative p-2 rounded-lg hover:bg-muted transition-colors"
                            >
                                <Bell className="w-5 h-5 text-foreground" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground">
                                        {unreadCount > 9 ? "9+" : unreadCount}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 top-full mt-2 w-[92vw] sm:w-80 md:w-96 bg-card border border-border rounded-lg shadow-xl max-h-[80vh] overflow-y-auto z-50">
                                    <div className="p-4 border-b border-border flex items-center justify-between">
                                        <h3 className="font-semibold text-foreground">
                                            Notifications
                                        </h3>
                                        {unreadCount > 0 && (
                                            <span className="text-xs text-muted-foreground">
                                                {unreadCount} new
                                            </span>
                                        )}
                                    </div>
                                    <div className="divide-y divide-border">
                                        {notifications.length === 0 ? (
                                            <div className="p-4 text-center text-muted-foreground">
                                                No notifications
                                            </div>
                                        ) : (
                                            notifications.map((notification) => (
                                                <div
                                                    key={notification.id}
                                                    onClick={() => handleNotificationClick(notification)}
                                                    className={`p-4 hover:bg-muted cursor-pointer transition ${!notification.read ? "bg-muted/50" : ""
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <MessageSquare className="w-5 h-5 text-primary" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-foreground line-clamp-1">
                                                                {notification.title}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 break-words">
                                                                {notification.message}
                                                            </p>
                                                            {notification.adminResponse && (
                                                                <p className="text-xs text-primary mt-1 line-clamp-2 break-words">
                                                                    Admin: {notification.adminResponse}
                                                                </p>
                                                            )}
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                {new Date(notification.createdAt).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        {!notification.read && (
                                                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    {notifications.length > 0 && (
                                        <div className="p-2 border-t border-border">
                                            <button
                                                onClick={() => {
                                                    navigate("/restaurant/support");
                                                    setShowNotifications(false);
                                                }}
                                                className="w-full text-sm text-primary hover:text-primary/80 font-medium"
                                            >
                                                View All Tickets
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors group"
                            >
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                    <User className="w-5 h-5 text-primary" />
                                </div>
                                <ChevronDown
                                    className={`w-4 h-4 text-muted-foreground transition-transform ${showUserMenu ? "rotate-180" : ""
                                        }`}
                                />
                            </button>

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
            </div>
        </header>
    );
};

export default ManagerHeader;
