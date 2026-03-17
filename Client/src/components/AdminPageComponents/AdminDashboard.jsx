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
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { useAdminData } from "../../context/AdminDataContext";
import { motion } from "framer-motion";
import { TypewriterText } from "../ManagerPageComponents";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { restaurants, requests, tickets, loading } = useAdminData();
  const motionEase = [0.22, 1, 0.36, 1];

  const fadeUp = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: motionEase } },
  };

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.06 } },
  };

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
    <div className="min-h-screen bg-background pb-20">
      {/* Hero / Header (Manager-style) */}
      <div className="relative bg-primary/5 pb-24 pt-10 px-4 md:px-8 overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-28 left-1/2 h-72 w-[46rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -bottom-24 right-[-10rem] h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto space-y-4 relative z-10">
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 sm:p-2.5 bg-primary/10 rounded-xl border border-primary/10">
                  <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary/80" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground flex items-center">
                  <TypewriterText text="Admin Overview" />
                </h1>
              </div>

              <p className="text-muted-foreground text-lg max-w-2xl ml-1">
                Platform snapshot: requests, subscriptions, and support activity.
              </p>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-background/50 backdrop-blur border border-border rounded-full text-sm font-medium text-muted-foreground shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              System Operational
            </div>
          </motion.div>

        </div>
      </div>

      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 -mt-16 space-y-8 animate-in fade-in duration-500"
        initial="hidden"
        animate="show"
        variants={stagger}
      >
        <style>{`
          @keyframes rf-gradient-pan {
            0% { background-position: 0% 50%; }
            100% { background-position: 100% 50%; }
          }
        `}</style>

      {/* Stats Cards */}
      <motion.div
        variants={fadeUp}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* Total Restaurants */}
        <motion.div
          whileHover={{ y: -6 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="relative overflow-hidden group rounded-3xl p-6 bg-card/70 backdrop-blur border border-border/60 shadow-sm hover:shadow-lg transition-all duration-300"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              backgroundImage:
                "linear-gradient(120deg, rgba(99,102,241,0.18), rgba(168,85,247,0.12), rgba(59,130,246,0.12))",
              backgroundSize: "200% 200%",
              animation: "rf-gradient-pan 4.5s ease-in-out infinite alternate",
            }}
          />
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Building2 className="w-24 h-24 text-primary" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 mb-4 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/25">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm font-medium text-primary/80 uppercase tracking-widest">Total Restaurants</p>
            <h3 className="text-4xl font-bold text-foreground mt-1">{stats.totalRestaurants}</h3>
            <p className="text-sm text-muted-foreground mt-2">Registered partners</p>
          </div>
        </motion.div>

        {/* Pending Requests */}
        <motion.div
          whileHover={{ y: -6 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="relative overflow-hidden group rounded-3xl p-6 bg-card/70 backdrop-blur border border-border/60 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
          onClick={() => navigate("/admin/dashboard/requests")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") navigate("/admin/dashboard/requests");
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              backgroundImage:
                "linear-gradient(120deg, rgba(245,158,11,0.16), rgba(249,115,22,0.12), rgba(234,179,8,0.10))",
              backgroundSize: "200% 200%",
              animation: "rf-gradient-pan 4.5s ease-in-out infinite alternate",
            }}
          />
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
        </motion.div>

        {/* Active Subscriptions */}
        <motion.div
          whileHover={{ y: -6 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="relative overflow-hidden group rounded-3xl p-6 bg-card/70 backdrop-blur border border-border/60 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
          onClick={() => navigate("/admin/dashboard/subscriptions")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") navigate("/admin/dashboard/subscriptions");
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              backgroundImage:
                "linear-gradient(120deg, rgba(16,185,129,0.14), rgba(20,184,166,0.10), rgba(34,197,94,0.10))",
              backgroundSize: "200% 200%",
              animation: "rf-gradient-pan 4.5s ease-in-out infinite alternate",
            }}
          />
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
        </motion.div>

        {/* Open Tickets */}
        <motion.div
          whileHover={{ y: -6 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="relative overflow-hidden group rounded-3xl p-6 bg-card/70 backdrop-blur border border-border/60 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
          onClick={() => navigate("/admin/dashboard/support")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") navigate("/admin/dashboard/support");
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              backgroundImage:
                "linear-gradient(120deg, rgba(59,130,246,0.14), rgba(99,102,241,0.12), rgba(37,99,235,0.10))",
              backgroundSize: "200% 200%",
              animation: "rf-gradient-pan 4.5s ease-in-out infinite alternate",
            }}
          />
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
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Recent Requests */}
        <motion.div
          variants={fadeUp}
          className="bg-card/80 backdrop-blur border border-border/50 rounded-3xl shadow-sm overflow-hidden flex flex-col h-full"
        >
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
              <div className="flex flex-col items-center justify-center h-52 text-muted-foreground">
                <div className="w-16 h-16 rounded-3xl bg-primary/5 flex items-center justify-center border border-primary/10">
                  <Inbox className="w-8 h-8 opacity-40 text-primary" />
                </div>
                <p className="text-sm font-medium mt-3">No recent requests</p>
                <p className="text-xs text-muted-foreground/80 mt-1">You’re all caught up.</p>
              </div>
            ) : (
              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-80px" }}
                className="space-y-1"
              >
                {recentRequests.map((req) => (
                  <motion.button
                    type="button"
                    key={req._id}
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: motionEase } },
                    }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => navigate("/admin/dashboard/requests")}
                    className="w-full text-left group flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/4 flex items-center justify-center text-orange-600 shadow-sm border border-border/40">
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
                  </motion.button>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Recent Tickets */}
        <motion.div
          variants={fadeUp}
          className="bg-card/80 backdrop-blur border border-border/50 rounded-3xl shadow-sm overflow-hidden flex flex-col h-full"
        >
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
              <div className="flex flex-col items-center justify-center h-52 text-muted-foreground">
                <div className="w-16 h-16 rounded-3xl bg-primary/5 flex items-center justify-center border border-primary/10">
                  <HeadphonesIcon className="w-8 h-8 opacity-40 text-primary" />
                </div>
                <p className="text-sm font-medium mt-3">No recent tickets</p>
                <p className="text-xs text-muted-foreground/80 mt-1">Nothing needs attention right now.</p>
              </div>
            ) : (
              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-80px" }}
                className="space-y-1"
              >
                {recentTickets.map((ticket) => (
                  <motion.button
                    type="button"
                    key={ticket._id}
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: motionEase } },
                    }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => navigate("/admin/dashboard/support")}
                    className="w-full text-left group flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/20 dark:to-blue-900/4 flex items-center justify-center text-indigo-600 shadow-sm border border-border/40">
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
                  </motion.button>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
