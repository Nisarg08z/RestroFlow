import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { getAdminTickets, updateTicketStatus } from "../../utils/api";
import {
    Search, Filter, ExternalLink, MessageSquare,
    CheckCircle2, XCircle, Clock, AlertCircle, RefreshCw, Send, X, AlertTriangle, Archive
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
            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} bg-card border border-border shadow-lg rounded-xl p-4 flex items-start gap-4 max-w-sm`}>
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0">
                        <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-bold text-foreground">New Support Ticket</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            {newTicket.restaurantId?.restaurantName || "Restaurant"} needs help.
                        </p>
                    </div>
                </div>
            ), { position: "top-right", duration: 4000 });
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
            case "OPEN": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
            case "IN_PROGRESS": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
            case "RESOLVED": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
            case "CLOSED": return "bg-slate-500/10 text-slate-600 border-slate-500/20";
            default: return "bg-slate-500/10 text-slate-600 border-slate-500/20";
        }
    };

    const openCount = tickets.filter((t) => t.status === "OPEN").length;
    const inProgressCount = tickets.filter((t) => t.status === "IN_PROGRESS").length;
    const resolvedCount = tickets.filter((t) => t.status === "RESOLVED").length;
    const closedCount = tickets.filter((t) => t.status === "CLOSED").length;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="relative overflow-hidden group rounded-3xl p-6 bg-gradient-to-br from-blue-500/10 to-indigo-600/5 border border-blue-500/20 shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <MessageSquare className="w-20 h-20 text-blue-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 mb-4 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <MessageSquare className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-sm font-medium text-blue-600/80 uppercase tracking-widest">Open Tickets</p>
                        <h3 className="text-4xl font-bold text-foreground mt-1">{openCount}</h3>
                        <p className="text-sm text-muted-foreground mt-2">Require attention</p>
                    </div>
                </div>

                <div className="relative overflow-hidden group rounded-3xl p-6 bg-gradient-to-br from-amber-500/10 to-orange-600/5 border border-amber-500/20 shadow-lg hover:shadow-amber-500/10 transition-all duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Clock className="w-20 h-20 text-amber-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 mb-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                            <Clock className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-sm font-medium text-amber-600/80 uppercase tracking-widest">In Progress</p>
                        <h3 className="text-4xl font-bold text-foreground mt-1">{inProgressCount}</h3>
                        <p className="text-sm text-muted-foreground mt-2">Being handled</p>
                    </div>
                </div>

                <div className="relative overflow-hidden group rounded-3xl p-6 bg-gradient-to-br from-emerald-500/10 to-teal-600/5 border border-emerald-500/20 shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CheckCircle2 className="w-20 h-20 text-emerald-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 mb-4 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-sm font-medium text-emerald-600/80 uppercase tracking-widest">Resolved</p>
                        <h3 className="text-4xl font-bold text-foreground mt-1">{resolvedCount}</h3>
                        <p className="text-sm text-muted-foreground mt-2">Successfully closed</p>
                    </div>
                </div>

                <div className="relative overflow-hidden group rounded-3xl p-6 bg-gradient-to-br from-slate-500/10 to-gray-600/5 border border-slate-500/20 shadow-lg hover:shadow-slate-500/10 transition-all duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Archive className="w-20 h-20 text-slate-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 mb-4 rounded-2xl bg-gradient-to-br from-slate-400 to-gray-500 flex items-center justify-center shadow-lg shadow-slate-500/30">
                            <Archive className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-sm font-medium text-slate-600/80 uppercase tracking-widest">Closed</p>
                        <h3 className="text-4xl font-bold text-foreground mt-1">{closedCount}</h3>
                        <p className="text-sm text-muted-foreground mt-2">Past history</p>
                    </div>
                </div>
            </div>

            {/* Control Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-2 bg-muted/30 rounded-2xl backdrop-blur-sm border border-border/50">
                <div className="relative w-full md:w-96 group">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search tickets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-card/60 border border-border/50 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all shadow-sm"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    <button
                        onClick={fetchTickets}
                        disabled={loading}
                        className="p-3 rounded-xl bg-card border border-border/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all shadow-sm active:scale-95 disabled:opacity-50"
                        title="Refresh Data"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>

                    <div className="flex items-center gap-2 p-1 bg-card/50 rounded-xl border border-border/50 shadow-sm">
                        {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-300 whitespace-nowrap ${statusFilter === status
                                    ? "text-primary-foreground bg-primary shadow-md"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }`}
                            >
                                {status.toLowerCase().replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tickets List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <RefreshCw className="w-10 h-10 text-primary animate-spin mb-4" />
                        <p className="text-muted-foreground">Loading tickets...</p>
                    </div>
                ) : filteredTickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-card rounded-3xl border border-dashed border-border/50">
                        <MessageSquare className="w-12 h-12 text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground font-medium">No tickets found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredTickets.map((ticket) => (
                            <div
                                key={ticket._id}
                                className="group relative bg-card border border-border/50 rounded-3xl p-5 hover:shadow-xl hover:border-primary/20 transition-all duration-300"
                            >
                                <div className="absolute top-5 right-5">
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${getStatusBadge(ticket.status)}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${ticket.status === 'OPEN' ? 'bg-blue-600' :
                                                ticket.status === 'IN_PROGRESS' ? 'bg-amber-600' :
                                                    ticket.status === 'RESOLVED' ? 'bg-emerald-600' :
                                                        'bg-slate-600'
                                            }`} />
                                        {ticket.status.replace("_", " ")}
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row gap-5">
                                    <div className="flex-shrink-0">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm ${ticket.status === 'OPEN' ? 'bg-blue-500/10 text-blue-600' :
                                                ticket.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-600' :
                                                    ticket.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-600' :
                                                        'bg-slate-500/10 text-slate-600'
                                            }`}>
                                            #{ticket.ticketToken.slice(-2)}
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0 pr-16">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-mono text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                                #{ticket.ticketToken}
                                            </span>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {new Date(ticket.createdAt).toLocaleDateString()}
                                            </span>
                                            {ticket.priority === 'CRITICAL' && (
                                                <span className="text-xs font-bold text-rose-600 flex items-center gap-0.5 bg-rose-500/10 px-1.5 py-0.5 rounded ml-2">
                                                    <AlertTriangle className="w-3 h-3" /> Critical
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                                            {ticket.subject}
                                        </h3>

                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                            <span className="font-medium text-foreground">{ticket.restaurantId?.restaurantName || "Unknown Restaurant"}</span>
                                            <span>•</span>
                                            <span className="truncate">{ticket.restaurantId?.email}</span>
                                        </div>

                                        <button
                                            onClick={() => {
                                                setSelectedTicket(ticket);
                                                setAdminResponse(ticket.adminResponse || "");
                                            }}
                                            className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-all hover:bg-primary/10 px-3 py-1.5 rounded-lg -ml-3"
                                        >
                                            View Details & Reply <ExternalLink className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Ticket Management Modal */}
            {selectedTicket && createPortal(
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
                    onClick={() => setSelectedTicket(null)}
                >
                    <div
                        className="bg-background border border-border/50 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-border/50 bg-background/95 backdrop-blur flex justify-between items-start gap-4 sticky top-0 z-10">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                        Ticket #{selectedTicket.ticketToken}
                                    </h2>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(selectedTicket.status)}`}>
                                        {selectedTicket.status.replace("_", " ")}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Submitted by <span className="font-semibold text-foreground">{selectedTicket.restaurantId?.restaurantName}</span> on {new Date(selectedTicket.createdAt).toLocaleString()}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedTicket(null)}
                                className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Subject</label>
                                    <div className="p-4 bg-muted/30 rounded-2xl border border-border/50 text-foreground font-medium text-lg leading-snug">
                                        {selectedTicket.subject}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Priority Level</label>
                                    <div className={`p-4 rounded-2xl border flex items-center gap-2 font-bold ${selectedTicket.priority === 'CRITICAL' ? 'bg-rose-500/10 border-rose-500/20 text-rose-600' :
                                            selectedTicket.priority === 'HIGH' ? 'bg-orange-500/10 border-orange-500/20 text-orange-600' :
                                                'bg-blue-500/10 border-blue-500/20 text-blue-600'
                                        }`}>
                                        <AlertCircle className="w-5 h-5" />
                                        {selectedTicket.priority}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 mb-8">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Message Content</label>
                                <div className="p-6 bg-muted/30 rounded-3xl border border-border/50 text-foreground whitespace-pre-wrap leading-relaxed">
                                    {selectedTicket.message}
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-border"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-background px-3 text-sm text-muted-foreground font-medium">Admin Actions</span>
                                </div>
                            </div>

                            <div className="mt-8 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-foreground">Response to Restaurant</label>
                                    <textarea
                                        rows={6}
                                        className="w-full px-5 py-4 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm resize-none transition-all"
                                        placeholder="Type your official response here..."
                                        value={adminResponse}
                                        onChange={(e) => setAdminResponse(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-border/50 bg-muted/20 flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => handleUpdateStatus("IN_PROGRESS")}
                                disabled={updating}
                                className="flex-1 py-3 px-4 rounded-xl border border-amber-500/30 text-amber-600 hover:bg-amber-500/10 font-bold transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <Clock className="w-4 h-4" />
                                Mark In Progress
                            </button>
                            <div className="flex-1 flex gap-3">
                                <button
                                    onClick={() => handleUpdateStatus("CLOSED")}
                                    disabled={updating}
                                    className="flex-1 py-3 px-4 rounded-xl border border-border text-muted-foreground hover:bg-muted font-bold transition disabled:opacity-50"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus("RESOLVED")}
                                    disabled={updating}
                                    className="flex-[2] py-3 px-4 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold shadow-lg shadow-emerald-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {updating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    Resolve & Send
                                </button>
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
