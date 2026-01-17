import React, { useEffect, useState } from "react";
import { getRestaurantTickets } from "../../utils/api";
import { Ticket, Clock, Copy } from "lucide-react";
import { toast } from "react-hot-toast";

const TicketList = ({ refreshTrigger }) => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTickets();
    }, [refreshTrigger]);

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
        return <div className="text-center py-8 text-muted-foreground">Loading tickets...</div>;
    }

    return (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border bg-muted/30">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-foreground">
                    <Ticket className="w-5 h-5 text-primary" />
                    My Tokens & Tickets
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    History of your support requests and their tokens.
                </p>
            </div>

            <div className="divide-y divide-border">
                {tickets.length > 0 ? (
                    tickets.map((ticket) => (
                        <div key={ticket._id} className="p-6 hover:bg-muted/10 transition-colors">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <span
                                            className="text-primary font-mono font-medium text-sm bg-primary/10 px-2 py-0.5 rounded cursor-pointer hover:bg-primary/20 transition-colors flex items-center gap-1"
                                            onClick={() => copyToken(ticket.ticketToken)}
                                            title="Click to copy Token"
                                        >
                                            {ticket.ticketToken}
                                            <Copy className="w-3 h-3" />
                                        </span>
                                        <h3 className="font-semibold text-foreground text-lg">{ticket.subject}</h3>
                                    </div>
                                    <p className="text-muted-foreground text-sm line-clamp-2 md:line-clamp-1 max-w-2xl">
                                        {ticket.message}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(ticket.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className={`font-medium ${getPriorityColor(ticket.priority)}`}>
                                            {ticket.priority} Priority
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(ticket.status)} border-transparent`}>
                                        {ticket.status.replace("_", " ")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-12 text-center text-muted-foreground">
                        <Ticket className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                        <p className="text-lg font-medium">No tickets found</p>
                        <p className="text-sm">Send a message to create your first ticket token.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TicketList;
