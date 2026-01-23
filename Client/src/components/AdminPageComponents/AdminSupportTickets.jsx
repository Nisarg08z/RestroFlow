import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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

    useEffect(() => {
        if (selectedTicket) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [selectedTicket]);

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
            case "OPEN": return "bg-blue-500/10 text-blue-500";
            case "IN_PROGRESS": return "bg-yellow-500/10 text-yellow-500";
            case "RESOLVED": return "bg-green-500/10 text-green-500";
            case "CLOSED": return "bg-gray-500/10 text-gray-500";
            default: return "bg-gray-500/10 text-gray-500";
        }
    };

    const openCount = tickets.filter((t) => t.status === "OPEN").length;
    const inProgressCount = tickets.filter((t) => t.status === "IN_PROGRESS").length;
    const resolvedCount = tickets.filter((t) => t.status === "RESOLVED").length;
    const closedCount = tickets.filter((t) => t.status === "CLOSED").length;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-2xl p-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                            <MessageSquare className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{openCount}</p>
                            <p className="text-sm text-muted-foreground">Open Tickets</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card border border-border rounded-2xl p-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                            <Clock className="w-6 h-6 text-yellow-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{inProgressCount}</p>
                            <p className="text-sm text-muted-foreground">In Progress</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card border border-border rounded-2xl p-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{resolvedCount}</p>
                            <p className="text-sm text-muted-foreground">Resolved</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card border border-border rounded-2xl p-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-500/10 rounded-xl flex items-center justify-center">
                            <XCircle className="w-6 h-6 text-gray-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{closedCount}</p>
                            <p className="text-sm text-muted-foreground">Closed</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-4">
                <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                    <div className="relative flex-1 min-w-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by Token, Subject, or Restaurant..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2 md:justify-end">
                        {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                disabled={loading}
                                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${statusFilter === status
                                    ? "bg-primary text-primary-foreground"
                                    : "border border-border text-foreground hover:bg-muted"
                                    }`}
                            >
                                {status.replace("_", " ")}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-card border border-border rounded-2xl">
                <div className="px-4 py-4 md:px-6 md:py-6 border-b border-border">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg md:text-xl font-bold text-foreground">Support Tickets ({filteredTickets.length})</h2>
                        <button
                            onClick={fetchTickets}
                            disabled={loading}
                            className="p-1.5 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
                            title="Refresh"
                        >
                            <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
                <div className="px-4 pb-4 pt-4 md:p-6 space-y-4 overflow-x-auto">
                    {loading ? (
                        <div className="text-center py-12">
                            <RefreshCw className="w-12 h-12 text-primary mx-auto mb-3 animate-spin" />
                            <p className="text-muted-foreground">Loading tickets...</p>
                        </div>
                    ) : filteredTickets.length === 0 ? (
                        <div className="text-center py-12">
                            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground">No tickets found</p>
                        </div>
                    ) : (
                        filteredTickets.map((ticket) => (
                            <div
                                key={ticket._id}
                                className="p-4 md:p-5 bg-muted rounded-lg border border-border hover:border-primary/50 transition-colors"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    <div className="flex items-start gap-3 md:gap-4">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/10">
                                            <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                                        </div>
                                        <div className="space-y-1 flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-mono font-medium text-foreground text-xs sm:text-sm">
                                                    {ticket.ticketToken}
                                                </span>
                                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(ticket.status)}`}>
                                                    {ticket.status.replace("_", " ")}
                                                </span>
                                            </div>
                                            <h3 className="font-semibold text-foreground text-sm md:text-base">{ticket.restaurantId?.restaurantName || "Unknown"}</h3>
                                            <p className="text-xs text-muted-foreground break-all">{ticket.restaurantId?.email}</p>
                                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-2">
                                                <span className="font-medium text-foreground line-clamp-2 break-words">
                                                    {ticket.subject}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                                                <span className={`font-medium ${ticket.priority === 'CRITICAL' ? 'text-red-500' :
                                                    ticket.priority === 'HIGH' ? 'text-orange-500' :
                                                        'text-blue-500'
                                                    }`}>
                                                    {ticket.priority} Priority
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 lg:flex-shrink-0 flex-wrap justify-start lg:justify-end">
                                        <button
                                            onClick={() => {
                                                setSelectedTicket(ticket);
                                                setAdminResponse(ticket.adminResponse || "");
                                            }}
                                            className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                            Manage
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {selectedTicket && createPortal(
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setSelectedTicket(null)}
                >
                    <div
                        className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 md:p-6 border-b border-border flex justify-between items-start gap-3">
                            <div className="flex-1 min-w-0">
                                <h2 className="text-lg md:text-xl font-bold text-foreground flex items-center gap-2 flex-wrap">
                                    <MessageSquare className="w-5 h-5 text-primary flex-shrink-0" />
                                    <span className="break-all">Manage Ticket {selectedTicket.ticketToken}</span>
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1 break-all">
                                    From {selectedTicket.restaurantId?.restaurantName}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedTicket(null)}
                                className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 p-1 hover:bg-muted rounded-lg"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 md:p-6 overflow-y-auto flex-1 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Subject</p>
                                    <p className="text-sm font-medium text-foreground break-words">{selectedTicket.subject}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Priority</p>
                                    <p className={`text-sm font-medium ${selectedTicket.priority === 'CRITICAL' ? 'text-red-500' :
                                        selectedTicket.priority === 'HIGH' ? 'text-orange-500' :
                                            'text-blue-500'
                                        }`}>
                                        {selectedTicket.priority}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Message</p>
                                <p className="text-sm text-foreground bg-muted p-3 rounded-lg whitespace-pre-wrap break-words">{selectedTicket.message}</p>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-border">
                                <h3 className="font-semibold text-foreground text-sm md:text-base">Admin Response & Action</h3>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Reply to Restaurant</label>
                                    <textarea
                                        rows={6}
                                        className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                        placeholder="Type your response here..."
                                        value={adminResponse}
                                        onChange={(e) => setAdminResponse(e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={() => handleUpdateStatus("IN_PROGRESS")}
                                        disabled={updating}
                                        className="flex-1 border border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10 px-4 py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
                                    >
                                        <Clock className="w-4 h-4" />
                                        <span>Mark In Progress</span>
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus("RESOLVED")}
                                        disabled={updating}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Resolve & Send</span>
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus("CLOSED")}
                                        disabled={updating}
                                        className="flex-1 border border-gray-500/50 text-gray-500 hover:bg-gray-500/10 px-4 py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        <span>Close Ticket</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default AdminSupportTickets;
