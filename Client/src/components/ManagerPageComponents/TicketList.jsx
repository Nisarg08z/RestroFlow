import React, { useEffect, useState, useRef } from "react";
import { getRestaurantTickets } from "../../utils/api";
import { Ticket, Clock, Copy } from "lucide-react";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";

const TicketList = ({ refreshTrigger, restaurant }) => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const socketRef = useRef(null);

    useEffect(() => {
        fetchTickets();

        socketRef.current = io(import.meta.env.VITE_SOCKET_URL, {
            withCredentials: true,
        });

        if (restaurant?._id || restaurant?.id) {
            const restaurantId = (restaurant._id || restaurant.id).toString();
            socketRef.current.emit('joinRestaurant', restaurantId);
        }

        socketRef.current.on('ticketUpdate', (data) => {
            setTickets((prev) =>
                prev.map((ticket) =>
                    ticket._id === data.ticketId
                        ? {
                            ...ticket,
                            status: data.status,
                            adminResponse: data.adminResponse,
                        }
                        : ticket
                )
            );
            toast.success(`Ticket ${data.ticketToken} has been updated`);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [refreshTrigger, restaurant?._id]);

    const fetchTickets = async () => {
        try {
            const res = await getRestaurantTickets();
            if (res.data?.success) {
                setTickets(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch tickets", error);
        } finally {
            setLoading(false);
        }
    };

    const copyToken = (token) => {
        navigator.clipboard.writeText(token);
        toast.success("Token copied to clipboard!");
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "OPEN": return "text-blue-500 bg-blue-500/10";
            case "IN_PROGRESS": return "text-yellow-500 bg-yellow-500/10";
            case "RESOLVED": return "text-green-500 bg-green-500/10";
            case "CLOSED": return "text-gray-500 bg-gray-500/10";
            default: return "text-gray-500";
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "LOW": return "text-gray-500";
            case "MEDIUM": return "text-blue-500";
            case "HIGH": return "text-orange-500";
            case "CRITICAL": return "text-red-500";
            default: return "text-gray-500";
        }
    };

    if (loading) {
        return (
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 sm:p-6 md:p-8 text-center text-muted-foreground text-sm sm:text-base">
                    Loading tickets...
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 md:p-6 border-b border-border bg-muted/30">
                <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2 text-foreground">
                    <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                    My Tokens & Tickets
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    History of your support requests and their tokens.
                </p>
            </div>

            <div className="divide-y divide-border">
                {tickets.length > 0 ? (
                    tickets.map((ticket) => (
                        <div key={ticket._id} className="p-4 sm:p-5 md:p-6 hover:bg-muted/10 transition-colors">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 sm:gap-4">
                                <div className="space-y-2 sm:space-y-3 flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-2">
                                        <span
                                            className="text-primary font-mono font-medium text-xs sm:text-sm bg-primary/10 px-2 py-1 sm:py-0.5 rounded cursor-pointer hover:bg-primary/20 transition-colors flex items-center gap-1 shrink-0"
                                            onClick={() => copyToken(ticket.ticketToken)}
                                            title="Click to copy Token"
                                        >
                                            {ticket.ticketToken}
                                            <Copy className="w-3 h-3" />
                                        </span>
                                        <h3 className="font-semibold text-foreground text-base sm:text-lg break-words min-w-0">{ticket.subject}</h3>
                                    </div>
                                    <p className="text-muted-foreground text-xs sm:text-sm max-w-2xl break-words whitespace-pre-wrap">
                                        {ticket.message}
                                    </p>
                                    {ticket.adminResponse && (
                                        <div className="mt-2 p-3 bg-primary/5 border-l-2 border-primary rounded-r-lg max-w-2xl">
                                            <p className="text-xs font-semibold text-primary mb-1">Admin Response:</p>
                                            <p className="text-xs sm:text-sm text-foreground break-words whitespace-pre-wrap max-h-40 overflow-y-auto custom-scrollbar">
                                                {ticket.adminResponse}
                                            </p>
                                        </div>
                                    )}
                                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-muted-foreground pt-1">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(ticket.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className={`font-medium ${getPriorityColor(ticket.priority)}`}>
                                            {ticket.priority} Priority
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(ticket.status)} border-transparent whitespace-nowrap`}>
                                        {ticket.status.replace("_", " ")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-8 sm:p-12 text-center text-muted-foreground">
                        <Ticket className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-muted-foreground/50" />
                        <p className="text-base sm:text-lg font-medium">No tickets found</p>
                        <p className="text-xs sm:text-sm mt-1">Send a message to create your first ticket token.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TicketList;
