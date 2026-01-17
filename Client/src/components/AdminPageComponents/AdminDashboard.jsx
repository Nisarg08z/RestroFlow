import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Inbox,
  CreditCard,
  HeadphonesIcon,
  TrendingUp,
  Users,
  ArrowRight,
  Loader2,
  Calendar,
} from "lucide-react";
import { getAllRestaurants, getAllRestaurantRequests } from "../../utils/api";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    pendingRequests: 0,
    activeSubscriptions: 0,
    openTickets: 0,
  });
  const [recentRequests, setRecentRequests] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [restaurantsRes, requestsRes] = await Promise.all([
        getAllRestaurants().catch(() => ({ data: { data: [] } })),
        getAllRestaurantRequests().catch(() => ({ data: { data: [] } })),
      ]);

      const restaurants = restaurantsRes.data?.data || [];
      const requests = requestsRes.data?.data || [];

      const totalRestaurants = restaurants.length;
      const pendingRequests = requests.filter((r) => r.status === "pending").length;

      const activeSubscriptions = restaurants.filter(
        (r) => r.subscription?.isActive === true
      ).length;

      setStats({
        totalRestaurants,
        pendingRequests,
        activeSubscriptions,
        openTickets: 0,
      });

      const recent = requests
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentRequests(recent);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return past.toLocaleDateString();
  };

  const statsCards = [
    {
      label: "Total Restaurants",
      value: stats.totalRestaurants,
      change: "",
      icon: Building2,
      color: "text-primary",
    },
    {
      label: "Pending Requests",
      value: stats.pendingRequests,
      change: "",
      icon: Inbox,
      color: "text-yellow-500",
    },
    {
      label: "Active Subscriptions",
      value: stats.activeSubscriptions,
      change: "",
      icon: CreditCard,
      color: "text-blue-500",
      comingSoon: true,
    },
    {
      label: "Open Tickets",
      value: stats.openTickets,
      change: "Coming Soon",
      icon: HeadphonesIcon,
      color: "text-purple-500",
      comingSoon: true,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              {stat.change && (
                <span
                  className={`text-xs font-medium ${stat.comingSoon
                      ? "text-muted-foreground"
                      : stat.change.startsWith("+")
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                >
                  {stat.change}
                </span>
              )}
            </div>

            <p className="text-3xl font-bold text-foreground mb-1">
              {stat.value}
            </p>
            <p className="text-sm text-muted-foreground">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl">
          <div className="flex items-center justify-between p-6 pb-2">
            <h2 className="text-lg font-semibold text-foreground">
              Recent Requests
            </h2>
            <button
              onClick={() => navigate("/admin/dashboard/requests")}
              className="text-primary flex items-center gap-1 text-sm hover:underline"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {recentRequests.length === 0 ? (
              <div className="text-center py-8">
                <Inbox className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No recent requests</p>
              </div>
            ) : (
              recentRequests.map((req) => (
                <div
                  key={req._id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {req.restaurantName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {req.email}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 ml-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${req.status === "pending"
                          ? "bg-yellow-500/10 text-yellow-500"
                          : req.status === "approved"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-red-500/10 text-red-500"
                        }`}
                    >
                      {req.status}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatTimeAgo(req.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl">
          <div className="flex items-center justify-between p-6 pb-2">
            <h2 className="text-lg font-semibold text-foreground">
              Recent Tickets
            </h2>
            <button
              onClick={() => navigate("/admin/dashboard/support")}
              className="text-primary flex items-center gap-1 text-sm hover:underline"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6">
            <div className="h-full flex items-center justify-center bg-muted rounded-lg border border-border py-12">
              <div className="text-center">
                <HeadphonesIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-foreground font-medium mb-1">Coming Soon</p>
                <p className="text-sm text-muted-foreground">
                  Support tickets feature will be available soon
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            Restaurant Growth
          </h2>
        </div>

        <div className="h-64 flex items-center justify-center bg-muted rounded-lg border border-border">
          <div className="text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Restaurant growth chart</p>
            <p className="text-sm text-muted-foreground">
              Connect analytics to view data
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
