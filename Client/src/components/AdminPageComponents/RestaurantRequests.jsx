import React, { useState, useEffect, useRef } from "react";
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
  deleteRestaurantRequest,
  sendRestaurantRequestReply,
} from "../../utils/api";
import toast from "react-hot-toast";

const RestaurantRequests = () => {
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [processingRequestId, setProcessingRequestId] = useState(null);
  const socketRef = useRef(null);
  const PROCESSING_KEY = "restroflow_request_processing";

  useEffect(() => {
    fetchRequests();

    const apiUrl = import.meta.env.VITE_API_URL || "";
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      apiUrl.replace(/\/api\/v1\/?$/, "");

    socketRef.current = io(socketUrl, {
      withCredentials: true,
    });

    socketRef.current.on("newRestaurantRequest", (newRequest) => {
      setRequests((prev) => [newRequest, ...prev]);
      toast.success(`New request from ${newRequest.restaurantName}`);
    });

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
  }, []);

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

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const response = await getAllRestaurantRequests({
        status: filter !== "all" ? filter : undefined,
        search: searchQuery || undefined,
      });
      setRequests(response.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch requests");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchRequests();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const filteredRequests = requests;

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
      toast.success("Request approved and email sent successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve request");
    } finally {
      setProcessingRequestId(null);
      localStorage.removeItem(PROCESSING_KEY);
    }
  };

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


  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request?")) {
      return;
    }
    try {
      await deleteRestaurantRequest(id);
      setRequests((prev) => prev.filter((req) => req._id !== id));
      toast.success("Request deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete request");
    }
  };

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-2xl p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[oklch(0.98_0_0)]">{pendingCount}</p>
              <p className="text-sm text-[oklch(0.65_0_0)]">Pending Requests</p>
            </div>
          </div>
        </div>
        <div className="bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-2xl p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
              <Check className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[oklch(0.98_0_0)]">
                {requests.filter((r) => r.status === "approved").length}
              </p>
              <p className="text-sm text-[oklch(0.65_0_0)]">Approved</p>
            </div>
          </div>
        </div>
        <div className="bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-2xl p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
              <X className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[oklch(0.98_0_0)]">
                {requests.filter((r) => r.status === "rejected").length}
              </p>
              <p className="text-sm text-[oklch(0.65_0_0)]">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-2xl p-4">
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[oklch(0.65_0_0)]" />
            <input
              placeholder="Search restaurants or emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-[oklch(0.22_0.005_260)] border border-[oklch(0.28_0.005_260)] text-[oklch(0.98_0_0)] placeholder:text-[oklch(0.65_0_0)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.7_0.18_45)]"
            />
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            {["all", "pending", "approved", "rejected"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${filter === status
                  ? "bg-[oklch(0.7_0.18_45)] text-[oklch(0.13_0.005_260)]"
                  : "border border-[oklch(0.28_0.005_260)] text-[oklch(0.98_0_0)] hover:bg-[oklch(0.22_0.005_260)]"
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-2xl">
        <div className="px-4 py-4 md:px-6 md:py-6 border-b border-[oklch(0.28_0.005_260)]">
          <h2 className="text-lg md:text-xl font-bold text-[oklch(0.98_0_0)]">Contact Form Submissions</h2>
        </div>
        <div className="px-4 pb-4 pt-4 md:p-6 space-y-4 overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 text-[oklch(0.7_0.18_45)] mx-auto mb-3 animate-spin" />
              <p className="text-[oklch(0.65_0_0)]">Loading requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-[oklch(0.65_0_0)] mx-auto mb-3" />
              <p className="text-[oklch(0.65_0_0)]">No requests found</p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div
                key={request._id}
                className={`p-4 md:p-5 bg-[oklch(0.22_0.005_260)] rounded-lg border transition-colors ${
                  processingRequestId === request._id
                    ? "border-blue-500/50 bg-blue-500/5"
                    : "border-[oklch(0.28_0.005_260)] hover:border-[oklch(0.7_0.18_45)]/50"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      processingRequestId === request._id
                        ? "bg-blue-500/10"
                        : "bg-[oklch(0.7_0.18_45)]/10"
                    }`}>
                      {processingRequestId === request._id ? (
                        <Loader2 className="w-5 h-5 md:w-6 md:h-6 text-blue-500 animate-spin" />
                      ) : (
                        <Building2 className="w-5 h-5 md:w-6 md:h-6 text-[oklch(0.7_0.18_45)]" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-[oklch(0.98_0_0)]">{request.restaurantName}</h3>
                        {processingRequestId === request._id ? (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-500/10 text-blue-500 flex items-center gap-1">
                            <Send className="w-3 h-3" />
                            Processing...
                          </span>
                        ) : (
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${request.status === "pending"
                              ? "bg-yellow-500/10 text-yellow-500"
                              : request.status === "approved"
                                ? "bg-green-500/10 text-green-500"
                                : "bg-red-500/10 text-red-500"
                              }`}
                          >
                            {request.status}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[oklch(0.65_0_0)]">{request.ownerName}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-[oklch(0.65_0_0)]">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {request.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {request.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 lg:flex-shrink-0 flex-wrap justify-start lg:justify-end">
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowDetails(true);
                      }}
                      disabled={processingRequestId === request._id}
                      className="px-4 py-2 rounded-lg border border-[oklch(0.28_0.005_260)] text-[oklch(0.98_0_0)] hover:bg-[oklch(0.22_0.005_260)] transition flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    {request.status === "pending" && (
                      <>
                        {processingRequestId === request._id ? (
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/50">
                            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                            <span className="text-xs text-blue-500 font-medium whitespace-nowrap">
                              Sending Email...
                            </span>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => handleApprove(request._id)}
                              disabled={processingRequestId !== null}
                              className="p-2 rounded-lg border border-green-500/50 text-green-500 hover:text-green-400 hover:bg-green-500/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(request._id)}
                              disabled={processingRequestId !== null}
                              className="p-2 rounded-lg border border-red-500/50 text-red-500 hover:text-red-400 hover:bg-red-500/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showDetails && selectedRequest && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start md:items-center justify-center z-50 p-3 md:p-4 overflow-y-auto"
          onClick={() => setShowDetails(false)}
        >
          <div
            className="mt-10 md:mt-0 bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-2xl max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 md:p-6 border-b border-[oklch(0.28_0.005_260)]">
              <h2 className="text-lg md:text-xl font-bold text-[oklch(0.98_0_0)]">Request Details</h2>
              <p className="text-sm text-[oklch(0.65_0_0)] mt-1">Review the restaurant request details</p>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-[oklch(0.65_0_0)]">Restaurant Name</p>
                  <p className="text-sm font-medium text-[oklch(0.98_0_0)]">{selectedRequest.restaurantName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-[oklch(0.65_0_0)]">Owner Name</p>
                  <p className="text-sm font-medium text-[oklch(0.98_0_0)]">{selectedRequest.ownerName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-[oklch(0.65_0_0)]">Email</p>
                  <p className="text-sm font-medium text-[oklch(0.98_0_0)]">{selectedRequest.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-[oklch(0.65_0_0)]">Phone</p>
                  <p className="text-sm font-medium text-[oklch(0.98_0_0)]">{selectedRequest.phone}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[oklch(0.65_0_0)]">Message</p>
                <p className="text-sm text-[oklch(0.98_0_0)] bg-[oklch(0.22_0.005_260)] p-3 rounded-lg">{selectedRequest.message}</p>
              </div>

              {selectedRequest.status === "pending" && (
                <div className="pt-4">
                  {processingRequestId === selectedRequest._id ? (
                    <div className="flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-blue-500/10 border border-blue-500/50">
                      <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                      <span className="text-blue-500 font-medium text-sm md:text-base text-center">
                        Sending email to {selectedRequest.email}...
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                        onClick={() => handleApprove(selectedRequest._id)}
                        disabled={processingRequestId !== null}
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve & Add to System</span>
                      </button>
                      <button
                        className="flex-1 border border-red-500/50 text-red-500 hover:bg-red-500/10 px-4 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                        onClick={() => handleReject(selectedRequest._id)}
                        disabled={processingRequestId !== null}
                      >
                        <X className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button
                className="w-full border border-[oklch(0.28_0.005_260)] text-[oklch(0.98_0_0)] hover:bg-[oklch(0.22_0.005_260)] px-4 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 text-sm md:text-base mt-2"
                onClick={() => {
                  setShowReply(true);
                  setShowDetails(false);
                }}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Send Reply Email</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showReply && selectedRequest && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start md:items-center justify-center z-50 p-3 md:p-4 overflow-y-auto"
          onClick={() => setShowReply(false)}
        >
          <div
            className="mt-10 md:mt-0 bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-2xl max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 md:p-6 border-b border-[oklch(0.28_0.005_260)]">
              <h2 className="text-lg md:text-xl font-bold text-[oklch(0.98_0_0)]">Reply to {selectedRequest.restaurantName}</h2>
              <p className="text-sm text-[oklch(0.65_0_0)] mt-1">Send an email response to {selectedRequest.email}</p>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              <textarea
                placeholder="Type your reply message..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 rounded-lg bg-[oklch(0.22_0.005_260)] border border-[oklch(0.28_0.005_260)] text-[oklch(0.98_0_0)] placeholder:text-[oklch(0.65_0_0)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.7_0.18_45)] resize-none"
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  className="flex-1 bg-[oklch(0.7_0.18_45)] text-[oklch(0.13_0.005_260)] px-4 py-3 rounded-lg font-medium hover:bg-[oklch(0.7_0.18_45)]/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
                  disabled={isSendingReply || !replyMessage.trim()}
                  onClick={async () => {
                    if (!replyMessage.trim()) {
                      toast.error("Please type a reply message first");
                      return;
                    }

                    try {
                      setIsSendingReply(true);
                      await sendRestaurantRequestReply(selectedRequest._id, {
                        message: replyMessage.trim(),
                      });
                      toast.success(`Reply email sent to ${selectedRequest.email}`);
                      setShowReply(false);
                      setReplyMessage("");
                    } catch (error) {
                      console.error(error);
                      toast.error(
                        error.response?.data?.message ||
                          "Failed to send reply email"
                      );
                    } finally {
                      setIsSendingReply(false);
                    }
                  }}
                >
                  {isSendingReply && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  <span>{isSendingReply ? "Sending..." : "Send Reply"}</span>
                </button>
                <button
                  className="px-4 py-3 rounded-lg border border-[oklch(0.28_0.005_260)] text-[oklch(0.98_0_0)] hover:bg-[oklch(0.22_0.005_260)] transition text-sm md:text-base"
                  onClick={() => {
                    if (!isSendingReply) {
                      setShowReply(false);
                    }
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantRequests;
