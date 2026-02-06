import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
    LogOut,
    LifeBuoy,
    Bell,
    MessageSquare,
    MapPin,
    Utensils,
    UserCircle
} from "lucide-react";
import { restaurantLogout, getRestaurantTickets } from "../../utils/api";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";
import Logo from "../../assets/logo.png";

const menuItems = [
    { id: "locations", label: "Locations", icon: MapPin, path: "/restaurant/welcome" },
    { id: "menu", label: "Menu", icon: Utensils, path: "/restaurant/menu" },
    { id: "support", label: "Support", icon: LifeBuoy, path: "/restaurant/support" },
    { id: "profile", label: "Profile", icon: UserCircle, path: "/restaurant/profile" },
];

const ManagerHeader = ({ restaurant }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
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

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">

                        {/* Logo Section */}
                        <Link to="/restaurant/welcome" className="flex items-center gap-3 group relative z-50">
                            <div className="relative w-9 h-9 flex items-center justify-center">
                                <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300" />
                                <img src={Logo} alt="RestroFlow" className="w-8 h-8 object-contain relative z-10" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-bold text-foreground tracking-tight">
                                    RestroFlow
                                </span>
                                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest leading-none">
                                    Manager
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

                                {showNotifications && (
                                    <>
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
                                                                <div className="p-2 rounded-xl flex-shrink-0 bg-primary/10 text-primary">
                                                                    <MessageSquare className="w-4 h-4" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium leading-none mb-1.5">
                                                                        {notification.title}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                                                        {notification.message}
                                                                    </p>
                                                                    {notification.adminResponse && (
                                                                        <p className="text-xs text-primary mt-1 line-clamp-2 break-words">
                                                                            Admin: {notification.adminResponse}
                                                                        </p>
                                                                    )}
                                                                    <p className="text-[10px] text-muted-foreground/70 mt-2">
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
                                                <div className="p-2 border-t border-border/50">
                                                    <button
                                                        onClick={() => {
                                                            navigate("/restaurant/support");
                                                            setShowNotifications(false);
                                                        }}
                                                        className="w-full py-2 text-xs font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                                    >
                                                        View All Tickets
                                                    </button>
                                                </div>
                                            )}
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
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/50 lg:hidden pb-safe safe-area-bottom">
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

export default ManagerHeader;
