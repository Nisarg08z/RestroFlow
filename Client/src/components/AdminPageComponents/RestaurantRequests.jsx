import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { io } from "socket.io-client";
import {
  Search,
  Building2,
  Mail,
  Phone,
  Calendar,
  Check,
  X,
  Eye,
  MessageSquare,
  Loader2,
  Send,
} from "lucide-react";
import {
  getAllRestaurantRequests,
  updateRequestStatus,
  sendRestaurantRequestReply,
} from "../../utils/api";
import toast from "react-hot-toast";
import { useAdminData } from "../../context/AdminDataContext";

const RestaurantRequests = () => {
  const { requests, setRequests, loading: contextLoading } = useAdminData();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [filter, setFilter] = useState("all");
  const [processingRequestId, setProcessingRequestId] = useState(null);
  const socketRef = useRef(null);
  const PROCESSING_KEY = "restroflow_request_processing";

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "";
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      apiUrl.replace(/\/api\/v1\/?$/, "");

    socketRef.current = io(socketUrl, {
      withCredentials: true,
    });

    // newRestaurantRequest is handled by AdminHeader (always mounted) to avoid duplicate adds
    socketRef.current.on("requestStatusUpdated", (updatedRequest) => {
      setRequests((prev) =>
        prev.map((req) =>
          req._id === updatedRequest._id ? updatedRequest : req
        )
      );
    });

    socketRef.current.on("requestDeleted", ({ id }) => {
      setRequests((prev) => prev.filter((req) => req._id !== id));
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [setRequests]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PROCESSING_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (!parsed?.id) {
        localStorage.removeItem(PROCESSING_KEY);
        return;
      }
      const maxAgeMs = 2 * 60 * 1000;
      if (parsed.startedAt && Date.now() - parsed.startedAt > maxAgeMs) {
        localStorage.removeItem(PROCESSING_KEY);
        return;
      }
      setProcessingRequestId(parsed.id);
    } catch {
      localStorage.removeItem(PROCESSING_KEY);
    }
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const timeoutId = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const response = await getAllRestaurantRequests({
          search: searchQuery.trim(),
        });
        setSearchResults(response.data.data || []);
      } catch (error) {
        toast.error("Failed to search requests");
      } finally {
        setSearchLoading(false);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const displayRequests = searchQuery.trim() ? (searchResults ?? requests) : requests;
  const filteredRequests = displayRequests.filter(
    (req) => filter === "all" || req.status === filter
  );
  const isLoading = contextLoading || (searchQuery.trim() ? searchLoading : false);

  const handleApprove = async (id) => {
    setProcessingRequestId(id);
    localStorage.setItem(
      PROCESSING_KEY,
      JSON.stringify({ id, action: "approved", startedAt: Date.now() })
    );
    try {
      const response = await updateRequestStatus(id, { status: "approved" });
      setRequests((prev) =>
        prev.map((req) => (req._id === id ? response.data.data : req))
      );
      setShowDetails(false);

      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} relative w-full max-w-sm overflow-hidden rounded-2xl border border-border/50 bg-background/80 p-4 shadow-2xl backdrop-blur-xl supports-[backdrop-filter]:bg-background/60`}>
          <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-emerald-500 to-green-600"></div>
          <div className="flex items-start gap-4">
            <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <Check className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-foreground">Request Approved!</h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Welcome email sent to the restaurant owner.
              </p>
            </div>
          </div>
        </div>
      ), { duration: 4000 });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve request");
    } finally {
      setProcessingRequestId(null);
      localStorage.removeItem(PROCESSING_KEY);
    }
  };

  useEffect(() => {
    if (showDetails || showReply) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showDetails, showReply]);

  const handleReject = async (id) => {
    setProcessingRequestId(id);
    localStorage.setItem(
      PROCESSING_KEY,
      JSON.stringify({ id, action: "rejected", startedAt: Date.now() })
    );
    try {
      const response = await updateRequestStatus(id, { status: "rejected" });
      setRequests((prev) =>
        prev.map((req) => (req._id === id ? response.data.data : req))
      );
      setShowDetails(false);
      toast.success("Request rejected");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject request");
    } finally {
      setProcessingRequestId(null);
      localStorage.removeItem(PROCESSING_KEY);
    }
  };

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative overflow-hidden group rounded-3xl p-6 bg-gradient-to-br from-amber-500/10 to-orange-600/5 border border-amber-500/20 shadow-lg hover:shadow-amber-500/10 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Building2 className="w-24 h-24 text-amber-500" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 mb-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm font-medium text-amber-600/80 uppercase tracking-widest">Pending</p>
            <h3 className="text-4xl font-bold text-foreground mt-1">{pendingCount}</h3>
          </div>
        </div>

        <div className="relative overflow-hidden group rounded-3xl p-6 bg-gradient-to-br from-emerald-500/10 to-green-600/5 border border-emerald-500/20 shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Check className="w-24 h-24 text-emerald-500" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 mb-4 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Check className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm font-medium text-emerald-600/80 uppercase tracking-widest">Approved</p>
            <h3 className="text-4xl font-bold text-foreground mt-1">{requests.filter((r) => r.status === "approved").length}</h3>
          </div>
        </div>

        <div className="relative overflow-hidden group rounded-3xl p-6 bg-gradient-to-br from-rose-500/10 to-red-600/5 border border-rose-500/20 shadow-lg hover:shadow-rose-500/10 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <X className="w-24 h-24 text-rose-500" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 mb-4 rounded-2xl bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
              <X className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm font-medium text-rose-600/80 uppercase tracking-widest">Rejected</p>
            <h3 className="text-4xl font-bold text-foreground mt-1">{requests.filter((r) => r.status === "rejected").length}</h3>
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
            placeholder="Search restaurants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-card/50 border border-border/50 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all shadow-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2 p-2 bg-card/50 rounded-xl border border-border/50 shadow-sm">
          {["all", "pending", "approved", "rejected", "completed"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium capitalize transition-all duration-300 border whitespace-nowrap ${filter === status
                ? "text-primary-foreground bg-primary border-primary shadow-md"
                : "text-muted-foreground border-border/50 hover:bg-muted hover:text-foreground hover:border-muted-foreground/30"
                }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <h2 className="text-lg font-semibold text-foreground">All Requests</h2>
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
            {filteredRequests.length}
          </span>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="mt-4 text-muted-foreground font-medium animate-pulse">Loading requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-card/30 rounded-3xl border border-border/50 border-dashed">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-foreground">No requests found</p>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredRequests.map((request) => (
              <div
                key={request._id}
                className={`group relative overflow-hidden bg-card/80 backdrop-blur-sm border rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${processingRequestId === request._id
                  ? "border-blue-500/50 bg-blue-500/5 ring-1 ring-blue-500/20"
                  : "border-border/50 hover:border-primary/30"
                  }`}
              >
                <div className="p-5 md:p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                  {/* Status Indicator Bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${request.status === 'pending' ? 'bg-amber-500' :
                    request.status === 'approved' ? 'bg-emerald-500' :
                      request.status === 'rejected' ? 'bg-rose-500' :
                        'bg-slate-500'
                    }`} />

                  <div className="flex-shrink-0">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${processingRequestId === request._id
                      ? "bg-blue-500/10"
                      : "bg-primary/10"
                      }`}>
                      {processingRequestId === request._id ? (
                        <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
                      ) : (
                        <Building2 className="w-7 h-7 text-primary" />
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold text-foreground truncate group-hover:text-primary transition-colors">
                        {request.restaurantName}
                      </h3>
                      {processingRequestId === request._id ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 border border-blue-200">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Processing
                        </span>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize border ${request.status === "pending" ? "bg-amber-500/10 text-amber-600 border-amber-200/50" :
                          request.status === "approved" ? "bg-emerald-500/10 text-emerald-600 border-emerald-200/50" :
                            request.status === "rejected" ? "bg-rose-500/10 text-rose-600 border-rose-200/50" :
                              "bg-slate-500/10 text-slate-600 border-slate-200/50"
                          }`}>
                          {request.status}
                        </span>
                      )}
                    </div>

                    <p className="text-base font-medium text-muted-foreground">{request.ownerName}</p>

                    <div className="flex flex-wrap gap-4 text-xs font-medium text-muted-foreground/80 mt-2">
                      <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50">
                        <Mail className="w-3.5 h-3.5" /> {request.email}
                      </span>
                      <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50">
                        <Phone className="w-3.5 h-3.5" /> {request.phone}
                      </span>
                      <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50">
                        <Calendar className="w-3.5 h-3.5" /> {new Date(request.createdAt).toLocaleDateString(undefined, {
                          weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                    <button
                      onClick={() => { setSelectedRequest(request); setShowDetails(true); }}
                      disabled={processingRequestId === request._id}
                      className="flex-1 md:flex-none px-4 py-2.5 rounded-xl border border-border/50 bg-background hover:bg-muted text-sm font-medium transition-all shadow-sm hover:shadow active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>

                    {request.status === "pending" && processingRequestId !== request._id && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(request._id)}
                          className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-100 transition-all shadow-sm hover:shadow-emerald-500/25 active:scale-95"
                          title="Approve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleReject(request._id)}
                          className="p-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white border border-rose-100 transition-all shadow-sm hover:shadow-rose-500/25 active:scale-95"
                          title="Reject"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetails && selectedRequest && createPortal(
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300"
          onClick={() => setShowDetails(false)}
        >
          <div
            className="bg-background border border-border/50 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-6 py-4 border-b border-border/50 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">Request Details</h2>
                <p className="text-sm text-muted-foreground">ID: {selectedRequest._id}</p>
              </div>
              <button onClick={() => setShowDetails(false)} className="p-2 rounded-full hover:bg-muted transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Restaurant</label>
                  <p className="text-lg font-medium text-foreground mt-1">{selectedRequest.restaurantName}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Owner</label>
                  <p className="text-lg font-medium text-foreground mt-1">{selectedRequest.ownerName}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</label>
                  <p className="text-base font-medium text-foreground mt-1 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" /> {selectedRequest.email}
                  </p>
                  <p className="text-base font-medium text-foreground mt-1 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" /> {selectedRequest.phone}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
                  <div className="mt-2">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold capitalize ${selectedRequest.status === "pending" ? "bg-amber-100 text-amber-700" :
                      selectedRequest.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                        "bg-rose-100 text-rose-700"
                      }`}>
                      {selectedRequest.status}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Message</label>
                <div className="mt-2 p-4 bg-muted/50 rounded-2xl border border-border/50 text-foreground text-sm leading-relaxed">
                  {selectedRequest.message || "No message provided."}
                </div>
              </div>

              <div className="pt-6 border-t border-border/50 flex flex-col gap-4">
                {selectedRequest.status === "pending" && (
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleApprove(selectedRequest._id)}
                      disabled={processingRequestId !== null}
                      className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                    >
                      <Check className="w-5 h-5" />
                      Approve Request
                    </button>
                    <button
                      onClick={() => handleReject(selectedRequest._id)}
                      disabled={processingRequestId !== null}
                      className="flex items-center justify-center gap-2 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 py-3.5 rounded-xl font-semibold transition-all active:scale-95"
                    >
                      <X className="w-5 h-5" />
                      Reject Request
                    </button>
                  </div>
                )}

                <button
                  className="w-full flex items-center justify-center gap-2 border border-border text-foreground hover:bg-muted py-3.5 rounded-xl font-medium transition-all"
                  onClick={() => { setShowReply(true); setShowDetails(false); }}
                >
                  <MessageSquare className="w-4 h-4" />
                  Send Custom Reply
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Reply Modal */}
      {showReply && selectedRequest && createPortal(
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300"
          onClick={() => setShowReply(false)}
        >
          <div
            className="bg-background border border-border/50 rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-border/50">
              <h3 className="text-xl font-bold text-foreground">Reply to {selectedRequest.ownerName}</h3>
              <p className="text-sm text-muted-foreground mt-1">Via email: {selectedRequest.email}</p>
            </div>
            <div className="p-6 space-y-4">
              <textarea
                placeholder="Write your message here..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none resize-none transition-all"
                autoFocus
              />
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowReply(false)}
                  className="flex-1 py-3 rounded-xl border border-border text-foreground hover:bg-muted font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={isSendingReply || !replyMessage.trim()}
                  onClick={async () => {
                    if (!replyMessage.trim()) return toast.error("Please enter a message");
                    try {
                      setIsSendingReply(true);
                      await sendRestaurantRequestReply(selectedRequest._id, { message: replyMessage.trim() });
                      toast.custom((t) => (
                        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} relative w-full max-w-sm overflow-hidden rounded-2xl border border-border/50 bg-background/80 p-4 shadow-2xl backdrop-blur-xl supports-[backdrop-filter]:bg-background/60`}>
                          <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-blue-500 to-indigo-600"></div>
                          <div className="flex items-start gap-4">
                            <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                              <Send className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-bold text-foreground">Reply Sent Successfully</h4>
                              <p className="mt-1 text-xs text-muted-foreground">
                                Your message has been emailed to the owner.
                              </p>
                            </div>
                          </div>
                        </div>
                      ), { duration: 4000 });
                      setShowReply(false);
                      setReplyMessage("");
                    } catch (e) {
                      toast.error("Failed to send reply");
                    } finally {
                      setIsSendingReply(false);
                    }
                  }}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSendingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Send Reply
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

export default RestaurantRequests;
