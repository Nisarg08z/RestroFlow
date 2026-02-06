import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Inbox,
  CreditCard,
  HeadphonesIcon,
  ArrowRight,
  Loader2,
  Clock,
  ExternalLink
} from "lucide-react";
import { useAdminData } from "../../context/AdminDataContext";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { restaurants, requests, tickets, loading } = useAdminData();

  const { stats, recentRequests, recentTickets } = useMemo(() => {
    const totalRestaurants = restaurants.length;
    const pendingRequests = requests.filter((r) => r.status === "pending").length;
    const activeSubscriptions = restaurants.filter(
      (r) => r.subscription?.isActive === true
    ).length;
    const openTickets = tickets.filter(
      (t) => t.status === "OPEN" || t.status === "IN_PROGRESS"
    ).length;

    const recent = [...requests]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
    const recentTicketsList = [...tickets]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    return {
      stats: {
        totalRestaurants,
        pendingRequests,
        activeSubscriptions,
        openTickets,
      },
      recentRequests: recent,
      recentTickets: recentTicketsList,
    };
  }, [restaurants, requests, tickets]);

  const formatTimeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return past.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">

      {/* Welcome Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground mt-2">
            Snapshot of platform performance and activities
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border border-border/50">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          System Operational
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Restaurants */}
        <div className="relative overflow-hidden group rounded-3xl p-6 bg-gradient-to-br from-primary/10 to-purple-600/5 border border-primary/20 shadow-lg hover:shadow-primary/10 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Building2 className="w-24 h-24 text-primary" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 mb-4 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/30">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm font-medium text-primary/80 uppercase tracking-widest">Total Restaurants</p>
            <h3 className="text-4xl font-bold text-foreground mt-1">{stats.totalRestaurants}</h3>
            <p className="text-sm text-muted-foreground mt-2">Registered partners</p>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="relative overflow-hidden group rounded-3xl p-6 bg-gradient-to-br from-amber-500/10 to-orange-600/5 border border-amber-500/20 shadow-lg hover:shadow-amber-500/10 transition-all duration-300 cursor-pointer" onClick={() => navigate("/admin/dashboard/requests")}>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Inbox className="w-24 h-24 text-amber-500" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 mb-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Inbox className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm font-medium text-amber-600/80 uppercase tracking-widest">Pending Requests</p>
            <h3 className="text-4xl font-bold text-foreground mt-1">{stats.pendingRequests}</h3>
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Awaiting approval <ArrowRight className="w-3 h-3" />
            </p>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="relative overflow-hidden group rounded-3xl p-6 bg-gradient-to-br from-emerald-500/10 to-teal-600/5 border border-emerald-500/20 shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CreditCard className="w-24 h-24 text-emerald-500" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 mb-4 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm font-medium text-emerald-600/80 uppercase tracking-widest">Active Plans</p>
            <h3 className="text-4xl font-bold text-foreground mt-1">{stats.activeSubscriptions}</h3>
            <p className="text-sm text-muted-foreground mt-2">Recurring revenue</p>
          </div>
        </div>

        {/* Open Tickets */}
        <div className="relative overflow-hidden group rounded-3xl p-6 bg-gradient-to-br from-blue-500/10 to-indigo-600/5 border border-blue-500/20 shadow-lg hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer" onClick={() => navigate("/admin/dashboard/support")}>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <HeadphonesIcon className="w-24 h-24 text-blue-500" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 mb-4 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <HeadphonesIcon className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm font-medium text-blue-600/80 uppercase tracking-widest">Open Tickets</p>
            <h3 className="text-4xl font-bold text-foreground mt-1">{stats.openTickets}</h3>
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Needs attention <ArrowRight className="w-3 h-3" />
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Recent Requests */}
        <div className="bg-card border border-border/50 rounded-3xl shadow-sm overflow-hidden flex flex-col h-full backdrop-blur-sm">
          <div className="p-6 border-b border-border/50 flex justify-between items-center bg-muted/20">
            <div>
              <h3 className="text-lg font-bold text-foreground">Recent Requests</h3>
              <p className="text-xs text-muted-foreground">Latest sign-ups awaiting action</p>
            </div>
            <button
              onClick={() => navigate("/admin/dashboard/requests")}
              className="p-2 rounded-xl bg-background border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition shadow-sm"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 p-2">
            {recentRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <Inbox className="w-10 h-10 mb-2 opacity-20" />
                <p className="text-sm">No recent requests</p>
              </div>
            ) : (
              <div className="space-y-1">
                {recentRequests.map((req) => (
                  <div key={req._id} className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/4 flex items-center justify-center text-orange-600 shadow-sm">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground truncate">{req.restaurantName}</h4>
                      <p className="text-xs text-muted-foreground truncate">{req.email}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border ${req.status === 'pending' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                          req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                            'bg-rose-500/10 text-rose-600 border-rose-500/20'
                        }`}>
                        {req.status}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatTimeAgo(req.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Tickets */}
        <div className="bg-card border border-border/50 rounded-3xl shadow-sm overflow-hidden flex flex-col h-full backdrop-blur-sm">
          <div className="p-6 border-b border-border/50 flex justify-between items-center bg-muted/20">
            <div>
              <h3 className="text-lg font-bold text-foreground">Recent Tickets</h3>
              <p className="text-xs text-muted-foreground">Latest support inquiries</p>
            </div>
            <button
              onClick={() => navigate("/admin/dashboard/support")}
              className="p-2 rounded-xl bg-background border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition shadow-sm"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 p-2">
            {recentTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <HeadphonesIcon className="w-10 h-10 mb-2 opacity-20" />
                <p className="text-sm">No recent tickets</p>
              </div>
            ) : (
              <div className="space-y-1">
                {recentTickets.map((ticket) => (
                  <div key={ticket._id} className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/20 dark:to-blue-900/4 flex items-center justify-center text-indigo-600 shadow-sm">
                      <HeadphonesIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground truncate flex items-center gap-2">
                        {ticket.subject}
                        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-normal">#{ticket.ticketToken}</span>
                      </h4>
                      <p className="text-xs text-muted-foreground truncate">{ticket.restaurantId?.restaurantName || "Unknown"}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border ${ticket.status === 'OPEN' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                          ticket.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                            'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        }`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatTimeAgo(ticket.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
