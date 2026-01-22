import React, { useState, useEffect, useRef } from "react";
import { getAdminTickets, updateTicketStatus } from "../../utils/api";
import {
    Search, Filter, ExternalLink, MessageSquare,
    CheckCircle2, XCircle, Clock, AlertCircle, RefreshCw
} from "lucide-react";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";

const AdminSupportTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [selectedTicket, setSelectedTicket] = useState(null);
    const [adminResponse, setAdminResponse] = useState("");
    const [updating, setUpdating] = useState(false);
    const socketRef = useRef(null);

    useEffect(() => {
        fetchTickets();

        socketRef.current = io(import.meta.env.VITE_SOCKET_URL, {
            withCredentials: true,
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
    }, []);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = await getAdminTickets();
            if (res.data?.success) {
                setTickets(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch tickets", error);
            toast.error("Failed to load tickets");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (newStatus) => {
        if (!selectedTicket) return;
        setUpdating(true);
        try {
            const res = await updateTicketStatus(selectedTicket._id, {
                status: newStatus,
                adminResponse: adminResponse || undefined
            });

            if (res.data?.success) {
                toast.success(`Ticket ${newStatus.toLowerCase()} successfully`);
                setTickets(prev => prev.map(t => t._id === selectedTicket._id ? res.data.data : t));
                setSelectedTicket(null);
                setAdminResponse("");
            }
        } catch (error) {
            console.error("Update failed", error);
            toast.error("Failed to update ticket status");
        } finally {
            setUpdating(false);
        }
    };

    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch =
            ticket.ticketToken.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.restaurantId?.restaurantName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "ALL" || ticket.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case "OPEN": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
            case "IN_PROGRESS": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
            case "RESOLVED": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            case "CLOSED": return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Support Tickets</h1>
                    <p className="text-muted-foreground">Manage and resolve restaurant support requests</p>
                </div>
                <button
                    onClick={fetchTickets}
                    className="p-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                    title="Refresh"
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by Token, Subject, or Restaurant..."
                        className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex bg-card border border-border rounded-lg p-1">
                    {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${statusFilter === status
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                }`}
                        >
                            {status.replace("_", " ")}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                            <tr>
                                <th className="px-6 py-4">Token</th>
                                <th className="px-6 py-4">Restaurant</th>
                                <th className="px-6 py-4">Subject</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Priority</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-muted-foreground">
                                        Loading tickets...
                                    </td>
                                </tr>
                            ) : filteredTickets.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-muted-foreground">
                                        No tickets found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredTickets.map((ticket) => (
                                    <tr key={ticket._id} className="hover:bg-muted/10 transition-colors group">
                                        <td className="px-6 py-4 font-mono font-medium text-foreground">
                                            {ticket.ticketToken}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-foreground">{ticket.restaurantId?.restaurantName || "Unknown"}</div>
                                            <div className="text-xs text-muted-foreground">{ticket.restaurantId?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-foreground max-w-[200px] truncate" title={ticket.subject}>
                                            {ticket.subject}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(ticket.status)}`}>
                                                {ticket.status.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`font-medium ${ticket.priority === 'CRITICAL' ? 'text-red-500' :
                                                    ticket.priority === 'HIGH' ? 'text-orange-500' :
                                                        'text-blue-500'
                                                }`}>
                                                {ticket.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {new Date(ticket.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => {
                                                    setSelectedTicket(ticket);
                                                    setAdminResponse(ticket.adminResponse || "");
                                                }}
                                                className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-md font-medium transition-colors"
                                            >
                                                Manage
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
                            
            {selectedTicket && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                            <div>
                                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-primary" />
                                    Manage Ticket {selectedTicket.ticketToken}
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    From {selectedTicket.restaurantId?.restaurantName}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedTicket(null)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            <div className="space-y-2 bg-muted/10 p-4 rounded-lg border border-border">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subject</label>
                                <p className="text-foreground font-medium text-lg">{selectedTicket.subject}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Message</label>
                                <div className="p-4 bg-muted/10 border border-border rounded-lg text-foreground whitespace-pre-wrap">
                                    {selectedTicket.message}
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-border">
                                <h3 className="font-semibold text-foreground">Admin Response & Action</h3>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Reply to Restaurant</label>
                                    <textarea
                                        rows={4}
                                        className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground resize-none"
                                        placeholder="Type your response here..."
                                        value={adminResponse}
                                        onChange={(e) => setAdminResponse(e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={() => handleUpdateStatus("IN_PROGRESS")}
                                        disabled={updating}
                                        className="px-4 py-2 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 rounded-lg font-medium transition-colors disabled:opacity-50"
                                    >
                                        Mark In Progress
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus("RESOLVED")}
                                        disabled={updating}
                                        className="px-4 py-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg font-medium transition-colors disabled:opacity-50"
                                    >
                                        Resolve & Send
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus("CLOSED")}
                                        disabled={updating}
                                        className="px-4 py-2 bg-gray-500/10 text-gray-500 hover:bg-gray-500/20 rounded-lg font-medium transition-colors disabled:opacity-50"
                                    >
                                        Close Ticket
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSupportTickets;
