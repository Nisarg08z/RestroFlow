import React, { useState, useEffect } from "react";
import {
  Search,
  CreditCard,
  TrendingUp,
  AlertCircle,
  Calendar,
  DollarSign,
  Building2,
  Edit,
  RefreshCw,
  X,
  Loader2,
} from "lucide-react";
import {
  getAllSubscriptions,
  updateSubscription,
  renewSubscription,
  getSubscriptionStats,
} from "../../utils/api";

const PRICE_PER_TABLE = 50;

const allFeatures = [
  "Unlimited tables",
  "QR ordering",
  "Multi-location support",
  "Chef dashboard",
  "Advanced analytics & reports",
  "Real-time order management",
  "Customer management",
  "Menu management",
  "Table management",
  "24/7 priority support",
  "Custom integrations",
  "Mobile app access",
];

const calculatePrice = (tables) => {
  return tables * PRICE_PER_TABLE;
};

const SubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState({
    totalMRR: 0,
    activeSubscriptions: 0,
    expiringSoon: 0,
    growthRate: "+12%",
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSub, setSelectedSub] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editEndDate, setEditEndDate] = useState("");
  const [editTotalTables, setEditTotalTables] = useState(0);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [error, setError] = useState(null);

  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [subscriptionsRes, statsRes] = await Promise.all([
        getAllSubscriptions(),
        getSubscriptionStats(),
      ]);

      if (subscriptionsRes.data?.success) {
        setSubscriptions(subscriptionsRes.data.data || []);
      }

      if (statsRes.data?.success) {
        setStats(statsRes.data.data || stats);
      }
    } catch (err) {
      console.error("Error fetching subscriptions:", err);
      setError(err.response?.data?.message || "Failed to fetch subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const filteredSubs = subscriptions.filter((sub) =>
    sub.restaurantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusColor = (status) => {
    if (status === "active") return "bg-green-500/10 text-green-500";
    if (status === "expiring") return "bg-yellow-500/10 text-yellow-500";
    if (status === "expired") return "bg-red-500/10 text-red-500";
    if (status === "cancelled") return "bg-[oklch(0.22_0.005_260)] text-[oklch(0.65_0_0)]";
    return "bg-[oklch(0.22_0.005_260)] text-[oklch(0.65_0_0)]";
  };


  const handleEditClick = (sub) => {
    setSelectedSub(sub);
    setEditEndDate(sub.endDate || "");
    setEditTotalTables(sub.totalTables || 0);
    setCalculatedPrice(calculatePrice(sub.totalTables || 0));
    setShowEdit(true);
  };

  const handleTablesChange = (tables) => {
    const numTables = parseInt(tables) || 0;
    setEditTotalTables(numTables);
    setCalculatedPrice(calculatePrice(numTables));
  };

  const handleSaveChanges = async () => {
    if (!selectedSub) return;

    try {
      setUpdating(true);
      setError(null);

      const updateData = {};
      
      if (editTotalTables !== selectedSub.totalTables) {
        updateData.totalTables = editTotalTables;
      }
      
      if (editEndDate && editEndDate !== selectedSub.endDate) {
        updateData.endDate = editEndDate;
      }

      const response = await updateSubscription(selectedSub.restaurantId, updateData);

      if (response.data?.success) {
        setSubscriptions((prev) =>
          prev.map((sub) =>
            sub.id === selectedSub.id
              ? { ...sub, ...response.data.data }
              : sub
          )
        );
        setShowEdit(false);
        fetchData();
      }
    } catch (err) {
      console.error("Error updating subscription:", err);
      setError(err.response?.data?.message || "Failed to update subscription");
    } finally {
      setUpdating(false);
    }
  };

  const handleRenew = async (sub) => {
    if (!sub) return;

    try {
      setUpdating(true);
      setError(null);

      const response = await renewSubscription(sub.restaurantId, { months: 1 });

      if (response.data?.success) {
        setSubscriptions((prev) =>
          prev.map((s) =>
            s.id === sub.id ? { ...s, ...response.data.data } : s
          )
        );
        fetchData();
      }
    } catch (err) {
      console.error("Error renewing subscription:", err);
      setError(err.response?.data?.message || "Failed to renew subscription");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[oklch(0.7_0.18_45)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-xl p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[oklch(0.98_0_0)]">${stats.totalMRR || 0}</p>
              <p className="text-sm text-[oklch(0.65_0_0)]">Monthly Revenue</p>
            </div>
          </div>
        </div>
        <div className="bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-xl p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[oklch(0.7_0.18_45)]/10 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-[oklch(0.7_0.18_45)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[oklch(0.98_0_0)]">
                {stats.activeSubscriptions || 0}
              </p>
              <p className="text-sm text-[oklch(0.65_0_0)]">Active Subscriptions</p>
            </div>
          </div>
        </div>
        <div className="bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-xl p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[oklch(0.98_0_0)]">
                {stats.expiringSoon || 0}
              </p>
              <p className="text-sm text-[oklch(0.65_0_0)]">Expiring Soon</p>
            </div>
          </div>
        </div>
        <div className="bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-xl p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[oklch(0.98_0_0)]">{stats.growthRate || "+12%"}</p>
              <p className="text-sm text-[oklch(0.65_0_0)]">Growth Rate</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-xl p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-[oklch(0.98_0_0)] flex items-center justify-between mb-2">
            All Features Included
            <span className="text-[oklch(0.7_0.18_45)] text-sm font-normal">
              ${PRICE_PER_TABLE} per table/month
            </span>
          </h3>
          <p className="text-sm text-[oklch(0.65_0_0)]">
            Every subscription includes all features. Pricing is based on the number of tables.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {allFeatures.map((feature, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[oklch(0.7_0.18_45)] rounded-full flex-shrink-0" />
              <span className="text-sm text-[oklch(0.65_0_0)]">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[oklch(0.65_0_0)]" />
          <input
            placeholder="Search subscriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 py-2 bg-[oklch(0.22_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-lg text-[oklch(0.98_0_0)]"
          />
        </div>
      </div>

      <div className="bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-xl">
        <div className="p-4 border-b border-[oklch(0.28_0.005_260)]">
          <h3 className="text-lg font-semibold text-[oklch(0.98_0_0)]">All Subscriptions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[oklch(0.28_0.005_260)]">
                <th className="text-left py-3 px-4 text-sm font-medium text-[oklch(0.65_0_0)]">
                  Restaurant
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[oklch(0.65_0_0)]">
                  Tables
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[oklch(0.65_0_0)]">
                  Price
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[oklch(0.65_0_0)]">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[oklch(0.65_0_0)]">
                  End Date
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[oklch(0.65_0_0)]">
                  Auto Renew
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-[oklch(0.65_0_0)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <p className="text-[oklch(0.65_0_0)]">
                      {searchQuery
                        ? "No subscriptions found matching your search."
                        : "No subscriptions found."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSubs.map((sub) => (
                <tr
                  key={sub.id}
                  className="border-b border-[oklch(0.28_0.005_260)]/50 hover:bg-[oklch(0.22_0.005_260)]/30"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[oklch(0.7_0.18_45)]/10 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-[oklch(0.7_0.18_45)]" />
                      </div>
                      <div>
                        <p className="font-medium text-[oklch(0.98_0_0)]">{sub.restaurantName}</p>
                        <p className="text-xs text-[oklch(0.65_0_0)]">{sub.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-[oklch(0.98_0_0)]">
                    <div className="flex flex-col">
                      <span className="font-medium">{sub.totalTables || 0} tables</span>
                      {sub.locations > 1 && (
                        <span className="text-xs text-[oklch(0.65_0_0)]">
                          {sub.locations} locations
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-[oklch(0.98_0_0)] font-medium">
                    <div className="flex flex-col">
                      <span>${sub.price}/mo</span>
                      <span className="text-xs text-[oklch(0.65_0_0)] font-normal">
                        ${sub.pricePerTable || PRICE_PER_TABLE}/table
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${statusColor(sub.status)}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-[oklch(0.65_0_0)] text-sm">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {sub.endDate
                        ? new Date(sub.endDate).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {sub.autoRenew ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-500/10 text-green-500">
                        Yes
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-[oklch(0.22_0.005_260)] text-[oklch(0.65_0_0)]">
                        No
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditClick(sub)}
                        className="px-3 py-1 text-sm border border-[oklch(0.28_0.005_260)] rounded-lg hover:bg-[oklch(0.22_0.005_260)] text-[oklch(0.98_0_0)] flex items-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      {(sub.status === "expired" || sub.status === "expiring") && (
                        <button
                          onClick={() => handleRenew(sub)}
                          disabled={updating}
                          className="px-3 py-1 text-sm bg-[oklch(0.7_0.18_45)] text-black rounded-lg hover:bg-[oklch(0.7_0.18_45)]/90 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                          Renew
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showEdit && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowEdit(false)}>
          <div
            className="bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-[oklch(0.98_0_0)]">Edit Subscription</h3>
                <X
                  className="w-5 h-5 cursor-pointer text-[oklch(0.65_0_0)] hover:text-[oklch(0.98_0_0)]"
                  onClick={() => setShowEdit(false)}
                />
              </div>
              <p className="text-sm text-[oklch(0.65_0_0)]">
                Update subscription details for {selectedSub?.restaurantName}
              </p>
            </div>
            {selectedSub && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[oklch(0.98_0_0)]">
                    Total Tables
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={editTotalTables}
                    onChange={(e) => handleTablesChange(e.target.value)}
                    className="w-full px-3 py-2 bg-[oklch(0.22_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-lg text-[oklch(0.98_0_0)]"
                  />
                  <p className="text-xs text-[oklch(0.65_0_0)]">
                    Price: ${calculatedPrice}/mo (${PRICE_PER_TABLE} per table)
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[oklch(0.98_0_0)]">End Date</label>
                  <input
                    type="date"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[oklch(0.22_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-lg text-[oklch(0.98_0_0)]"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    className="flex-1 bg-[oklch(0.7_0.18_45)] text-black py-2 rounded-lg hover:bg-[oklch(0.7_0.18_45)]/90 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    onClick={handleSaveChanges}
                    disabled={updating}
                  >
                    {updating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                  <button
                    className="px-4 py-2 border border-[oklch(0.28_0.005_260)] rounded-lg text-[oklch(0.98_0_0)] hover:bg-[oklch(0.22_0.005_260)] disabled:opacity-50"
                    onClick={() => {
                      setShowEdit(false);
                      setError(null);
                    }}
                    disabled={updating}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagement;
