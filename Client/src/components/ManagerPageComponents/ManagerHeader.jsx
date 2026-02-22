import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
    LogOut,
    LifeBuoy,
    Bell,
    MessageSquare,
    MapPin,
    Utensils,
    UserCircle,
    X
} from "lucide-react";
import { restaurantLogout, getRestaurantTickets } from "../../utils/api";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
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
            <header
                className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm"
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-20 items-center justify-between">

                        {/* Logo Section */}
                        <Link to="/restaurant/welcome" className="flex items-center gap-3 group relative z-50">
                            <motion.div
                                whileHover={{ scale: 1.05, rotate: -5 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative w-10 h-10 flex items-center justify-center"
                            >
                                <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300" />
                                <img src={Logo} alt="RestroFlow" className="w-9 h-9 object-contain relative z-10" />
                            </motion.div>
                            <div className="flex flex-col">
                                <span className="text-xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
                                    RestroFlow
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center gap-2 p-1.5 bg-muted/40 border border-border/50 rounded-2xl">
                            {menuItems.map((item) => {
                                const active = isActive(item.path);
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.id}
                                        to={item.path}
                                        className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors group z-10"
                                    >
                                        {active && (
                                            <motion.div
                                                layoutId="managerHeaderTabActive"
                                                className="absolute inset-0 bg-background rounded-xl shadow-sm border border-border/50"
                                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                            />
                                        )}
                                        <div className={`relative z-10 flex items-center gap-2 ${active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>
                                            <Icon className={`w-4 h-4 transition-transform duration-300 ${active ? "scale-110" : "group-hover:scale-110"}`} />
                                            {item.label}
                                        </div>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Right Action Section */}
                        <div className="flex items-center gap-3 sm:gap-5">

                            {/* Notifications */}
                            <div className="relative" ref={notificationRef}>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleBellClick}
                                    className={`relative p-3 rounded-2xl transition-colors duration-300 group ${showNotifications ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'}`}
                                >
                                    <Bell className={`w-5 h-5 transition-transform duration-300 ${showNotifications ? '' : 'group-hover:rotate-12'}`} />
                                    {unreadCount > 0 && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-background shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                                        />
                                    )}
                                </motion.button>

                                <AnimatePresence>
                                    {showNotifications && (
                                        <>
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="fixed inset-0 z-[60] lg:hidden bg-transparent"
                                                onClick={() => setShowNotifications(false)}
                                                aria-hidden="true"
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                                className="fixed left-4 right-4 top-[5.5rem] sm:left-auto sm:right-0 sm:top-auto sm:absolute sm:mt-4 sm:w-[400px] z-[70] max-w-[calc(100vw-2rem)] bg-card border border-border/50 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden"
                                            >
                                                <div className="p-5 border-b border-border/50 bg-muted/20 flex items-center justify-between relative">
                                                    <div className="flex flex-col">
                                                        <h3 className="font-bold text-foreground text-base">Notifications</h3>
                                                        <p className="text-xs text-muted-foreground font-medium">Keep track of your active tickets</p>
                                                    </div>
                                                    {unreadCount > 0 && (
                                                        <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-bold border border-primary/20 shadow-sm">
                                                            {unreadCount} new
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="max-h-[calc(100vh-14rem)] sm:max-h-[60vh] overflow-y-auto custom-scrollbar">
                                                    {notifications.length === 0 ? (
                                                        <div className="p-10 text-center text-muted-foreground flex flex-col items-center gap-3">
                                                            <div className="w-16 h-16 rounded-3xl bg-primary/5 flex items-center justify-center border border-primary/10">
                                                                <Bell className="w-8 h-8 opacity-40 text-primary" />
                                                            </div>
                                                            <span className="font-medium text-sm">No new notifications</span>
                                                        </div>
                                                    ) : (
                                                        notifications.map((notification, idx) => (
                                                            <motion.div
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: idx * 0.05 }}
                                                                key={notification.id}
                                                                onClick={() => handleNotificationClick(notification)}
                                                                className={`
                                                                    p-4 border-b border-border/40 hover:bg-muted/30 cursor-pointer transition-colors relative
                                                                    ${!notification.read ? "bg-primary/5" : ""}
                                                                `}
                                                            >
                                                                {!notification.read && (
                                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                                                                )}
                                                                <div className="flex items-start gap-3">
                                                                    <div className="p-2.5 rounded-2xl flex-shrink-0 bg-primary/10 text-primary border border-primary/20 shadow-inner">
                                                                        <MessageSquare className="w-5 h-5" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0 pt-0.5">
                                                                        <p className="text-[15px] font-bold text-foreground leading-none mb-1.5 flex justify-between items-center">
                                                                            {notification.title}
                                                                            {!notification.read && (
                                                                                <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                                                                            )}
                                                                        </p>
                                                                        <p className="text-sm font-medium text-muted-foreground leading-snug line-clamp-2">
                                                                            {notification.message}
                                                                        </p>
                                                                        {notification.adminResponse && (
                                                                            <div className="mt-2 bg-background p-2.5 rounded-xl border border-border/60 text-xs font-semibold text-primary/90 line-clamp-2">
                                                                                <span className="text-foreground/60 mr-1">Admin:</span>{notification.adminResponse}
                                                                            </div>
                                                                        )}
                                                                        <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/60 mt-3">
                                                                            {new Date(notification.createdAt).toLocaleString()}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        ))
                                                    )}
                                                </div>
                                                {notifications.length > 0 && (
                                                    <div className="p-3 border-t border-border/50 bg-background/50">
                                                        <motion.button
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => {
                                                                navigate("/restaurant/support");
                                                                setShowNotifications(false);
                                                            }}
                                                            className="w-full py-3 text-sm font-black text-foreground hover:bg-primary hover:text-white rounded-xl transition-all shadow-sm border border-border/60 hover:border-transparent hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                                                        >
                                                            View All Tickets
                                                        </motion.button>
                                                    </div>
                                                )}
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Logout Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-3 lg:px-5 py-2.5 rounded-2xl bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white transition-all duration-300 text-sm font-bold group border border-red-500/20 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:border-transparent"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5 lg:w-4 lg:h-4 group-hover:-translate-x-0.5 transition-transform" />
                                <span className="hidden lg:inline">Sign Out</span>
                            </motion.button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-2xl border-t border-border/50 lg:hidden pb-safe safe-area-bottom shadow-[0_-10px_40px_rgba(0,0,0,0.1)] supports-[backdrop-filter]:bg-background/60">
                <div className="flex justify-around items-center h-[4.5rem] px-2">
                    {menuItems.map((item) => {
                        const active = isActive(item.path);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.id}
                                to={item.path}
                                className={`relative flex flex-col items-center justify-center w-full h-full space-y-1.5 transition-colors ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                {active && (
                                    <div className="absolute -top-[1px] w-8 h-[3px] bg-primary rounded-full shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
                                )}
                                <motion.div
                                    whileTap={{ scale: 0.9 }}
                                    className={`p-1.5 rounded-xl transition-all duration-300 ${active ? "bg-primary/15" : "bg-transparent"}`}
                                >
                                    <Icon className={`w-5 h-5 ${active ? "scale-110" : ""}`} />
                                </motion.div>
                                <span className="text-[10px] font-bold tracking-wide">{item.label}</span>
                            </Link>
                        )
                    })}
                </div>
            </nav>
        </>
    );
};

export default ManagerHeader;
