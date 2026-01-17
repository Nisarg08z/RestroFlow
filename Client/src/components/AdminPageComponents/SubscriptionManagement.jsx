import React, { useState, useEffect } from "react";
import {
  Search,
  CreditCard,
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
  getSubscriptionById,
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
    expiredCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSub, setSelectedSub] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editEndDate, setEditEndDate] = useState("");
  const [editTotalTables, setEditTotalTables] = useState(0);
  const [editMonthsToAdd, setEditMonthsToAdd] = useState(0);
  const [editAutoRenew, setEditAutoRenew] = useState(false);
  const [sendPaymentEmail, setSendPaymentEmail] = useState(true);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [calculatedExtensionPrice, setCalculatedExtensionPrice] = useState(0);
  const [error, setError] = useState(null);
  const [emailNotification, setEmailNotification] = useState(null);
  const [locationDetails, setLocationDetails] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);


  useEffect(() => {
    fetchData();
  }, []);


  useEffect(() => {
    if (emailNotification) {
      const timer = setTimeout(() => {
        setEmailNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [emailNotification]);

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
    if (status === "cancelled") return "bg-muted text-muted-foreground";
    return "bg-muted text-muted-foreground";
  };

  const canRenew = (restaurantId) => {
    const lastRenewalKey = `lastRenewal_${restaurantId}`;
    const lastRenewalTime = localStorage.getItem(lastRenewalKey);

    if (!lastRenewalTime) return true;

    const lastRenewal = new Date(lastRenewalTime);
    const now = new Date();
    const diffInMs = now - lastRenewal;
    const diffInHours = diffInMs / (1000 * 60 * 60);

    return diffInHours >= 24;
  };

  const getRemainingCooldownHours = (restaurantId) => {
    const lastRenewalKey = `lastRenewal_${restaurantId}`;
    const lastRenewalTime = localStorage.getItem(lastRenewalKey);

    if (!lastRenewalTime) return 0;

    const lastRenewal = new Date(lastRenewalTime);
    const now = new Date();
    const diffInMs = now - lastRenewal;
    const diffInHours = diffInMs / (1000 * 60 * 60);

    return Math.max(0, 24 - diffInHours);
  };


  const handleEditClick = async (sub) => {
    setSelectedSub(sub);
    setEditEndDate(sub.endDate || "");
    setEditTotalTables(sub.totalTables || 0);
    setEditMonthsToAdd(0);
    setEditAutoRenew(sub.autoRenew || false);
    setSendPaymentEmail(true);
    setCalculatedPrice(calculatePrice(sub.totalTables || 0));
    setCalculatedExtensionPrice(0);
    setError(null);
    setLoadingLocations(true);

    try {
      const response = await getSubscriptionById(sub.restaurantId);
      if (response.data?.success && response.data.data.locationDetails) {
        setLocationDetails(response.data.data.locationDetails.map(loc => ({
          ...loc,
          editTables: loc.totalTables || 0,
        })));
      } else {
        setLocationDetails([{
          _id: 'default',
          locationName: 'Main Location',
          totalTables: sub.totalTables || 0,
          editTables: sub.totalTables || 0,
        }]);
      }
    } catch (err) {
      console.error("Error fetching location details:", err);
      setLocationDetails([{
        _id: 'default',
        locationName: 'Main Location',
        totalTables: sub.totalTables || 0,
        editTables: sub.totalTables || 0,
      }]);
    } finally {
      setLoadingLocations(false);
      setShowEdit(true);
    }
  };

  const handleTablesChange = (tables) => {
    const numTables = parseInt(tables) || 0;
    setEditTotalTables(numTables);
    setCalculatedPrice(calculatePrice(numTables));
  };

  const handleMonthsChange = (months) => {
    const numMonths = parseInt(months) || 0;
    setEditMonthsToAdd(numMonths);
    if (numMonths > 0 && selectedSub) {
      const totalTablesFromLocations = locationDetails.reduce((sum, loc) => sum + (loc.editTables || 0), 0);
      const extensionPrice = calculatePrice(totalTablesFromLocations || selectedSub.totalTables || 0) * numMonths;
      setCalculatedExtensionPrice(extensionPrice);
    } else {
      setCalculatedExtensionPrice(0);
    }
  };

  const handleLocationTablesChange = (locationId, tables) => {
    const numTables = parseInt(tables) || 0;
    setLocationDetails((prev) => {
      const updated = prev.map((loc) =>
        loc._id === locationId ? { ...loc, editTables: numTables } : loc
      );

      const newTotal = updated.reduce((sum, loc) => sum + (loc.editTables || 0), 0);
      setCalculatedPrice(calculatePrice(newTotal));

      if (editMonthsToAdd > 0) {
        setCalculatedExtensionPrice(calculatePrice(newTotal) * editMonthsToAdd);
      }

      return updated;
    });
  };

  const handleSaveChanges = async () => {
    if (!selectedSub) return;

    try {
      setUpdating(true);
      setError(null);

      const updateData = {};

      if (locationDetails.length > 0) {
        const hasLocationChanges = locationDetails.some(
          (loc) => loc.editTables !== loc.totalTables
        );

        if (hasLocationChanges) {
          updateData.locationUpdates = locationDetails.map((loc) => ({
            locationId: loc._id,
            totalTables: loc.editTables || 0,
          }));
        }
      } else if (editTotalTables !== selectedSub.totalTables) {
        updateData.totalTables = editTotalTables;
      }

      if (editMonthsToAdd > 0) {
        updateData.monthsToAdd = editMonthsToAdd;
      }

      if (editEndDate && editEndDate !== selectedSub.endDate && !updateData.monthsToAdd) {
        updateData.endDate = editEndDate;
      }

      if (editAutoRenew !== selectedSub.autoRenew) {
        updateData.autoRenew = editAutoRenew;
      }

      updateData.sendPaymentEmail = sendPaymentEmail;

      const response = await updateSubscription(selectedSub.restaurantId, updateData);

      if (response.data?.success) {
        if (response.data.data.invoice) {
          if (sendPaymentEmail && response.data.data.invoice) {
            setEmailNotification({
              restaurantName: selectedSub.restaurantName,
              amount: response.data.data.invoice.amount,
            });
          }

          if (locationDetails.some(loc => loc.editTables > loc.totalTables) || editTotalTables > selectedSub.totalTables) {
            setError(null);
          }

          if (response.data.data.subscription) {
            setSubscriptions((prev) =>
              prev.map((sub) =>
                sub.id === selectedSub.id
                  ? { ...sub, ...response.data.data.subscription }
                  : sub
              )
            );
          }
        } else {
          setSubscriptions((prev) =>
            prev.map((sub) =>
              sub.id === selectedSub.id
                ? { ...sub, ...response.data.data.subscription }
                : sub
            )
          );
          setShowEdit(false);
        }
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

    if (!canRenew(sub.restaurantId)) {
      const remainingHours = getRemainingCooldownHours(sub.restaurantId);
      const remainingHoursRounded = Math.ceil(remainingHours);
      setError(`Please wait ${remainingHoursRounded} hour(s) before renewing again.`);
      return;
    }

    try {
      setUpdating(true);
      setError(null);

      const response = await renewSubscription(sub.restaurantId, { months: 1 });

      if (response.data?.success) {
        const lastRenewalKey = `lastRenewal_${sub.restaurantId}`;
        localStorage.setItem(lastRenewalKey, new Date().toISOString());

        if (response.data.data.invoice) {
          setEmailNotification({
            restaurantName: sub.restaurantName,
            amount: response.data.data.invoice.amount,
          });
        } else {
          setSubscriptions((prev) =>
            prev.map((s) =>
              s.id === sub.id ? { ...s, ...response.data.data } : s
            )
          );
        }
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
    <div className="space-y-4 md:space-y-6 p-3 sm:p-4 md:p-0">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 sm:p-4">
          <p className="text-red-500 text-xs sm:text-sm break-words">{error}</p>
        </div>
      )}

      {emailNotification && (
        <div className="fixed top-4 right-4 z-50 bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 sm:p-4 shadow-lg max-w-xs sm:max-w-sm transition-all duration-300 ease-out">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
              <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-blue-500 font-semibold text-xs sm:text-sm mb-1">Email Sent</p>
              <p className="text-blue-400 text-xs break-words">
                Payment link sent to <span className="font-medium">{emailNotification.restaurantName}</span>
              </p>
              <p className="text-blue-500 font-bold text-xs sm:text-sm mt-1">
                Amount: ₹{emailNotification.amount}
              </p>
            </div>
            <button
              onClick={() => setEmailNotification(null)}
              className="flex-shrink-0 text-blue-400 hover:text-blue-500 transition-colors p-0.5"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-card border border-border rounded-xl p-3 md:p-4">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xl md:text-2xl font-bold text-foreground">₹{stats.totalMRR || 0}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Monthly Revenue</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 md:p-4">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xl md:text-2xl font-bold text-foreground">
                {stats.activeSubscriptions || 0}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">Active Subscriptions</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 md:p-4">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xl md:text-2xl font-bold text-foreground">
                {stats.expiringSoon || 0}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">Expiring Soon</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 md:p-4">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-red-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xl md:text-2xl font-bold text-foreground">
                {stats.expiredCount || 0}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">Expired</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 md:p-6">
        <div className="mb-3 md:mb-4">
          <h3 className="text-base md:text-lg font-semibold text-foreground flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <span>All Features Included</span>
            <span className="text-primary text-xs md:text-sm font-normal">
              ₹{PRICE_PER_TABLE} per table/month
            </span>
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            Every subscription includes all features. Pricing is based on the number of tables.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
          {allFeatures.map((feature, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
              <span className="text-xs md:text-sm text-muted-foreground">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-3 md:p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            placeholder="Search subscriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 py-2 bg-muted border border-border rounded-lg text-foreground text-sm md:text-base"
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-3 md:p-4 border-b border-border">
          <h3 className="text-base md:text-lg font-semibold text-foreground">All Subscriptions</h3>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden divide-y divide-border">
          {filteredSubs.length === 0 ? (
            <div className="py-8 text-center px-4">
              <p className="text-muted-foreground text-sm">
                {searchQuery
                  ? "No subscriptions found matching your search."
                  : "No subscriptions found."}
              </p>
            </div>
          ) : (
            filteredSubs.map((sub) => (
              <div
                key={sub.id}
                className="p-4 space-y-3 hover:bg-muted/30"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground text-sm truncate">{sub.restaurantName}</p>
                      <p className="text-xs text-muted-foreground truncate">{sub.id}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full capitalize flex-shrink-0 ${statusColor(sub.status)}`}>
                    {sub.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Tables</p>
                    <p className="font-medium text-foreground">
                      {sub.totalTables || 0} {sub.locations > 1 && `(${sub.locations} locs)`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Price</p>
                    <p className="font-medium text-foreground">₹{sub.price}/mo</p>
                    <p className="text-xs text-muted-foreground">₹{sub.pricePerTable || PRICE_PER_TABLE}/table</p>
                  </div>
                </div>

                {sub.endDate && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>Ends: {new Date(sub.endDate).toLocaleDateString()}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => handleEditClick(sub)}
                    className="flex-1 px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-muted text-foreground flex items-center justify-center gap-1.5"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  {(sub.status === "expired" || sub.status === "expiring") && (
                    <button
                      onClick={() => handleRenew(sub)}
                      disabled={updating || !canRenew(sub.restaurantId)}
                      className="flex-1 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed relative"
                      title={!canRenew(sub.restaurantId) ? `Please wait ${Math.ceil(getRemainingCooldownHours(sub.restaurantId))} hour(s) before renewing again.` : ""}
                    >
                      {updating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3.5 h-3.5" />
                      )}
                      Renew
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto -mx-4 md:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-muted-foreground">
                    Restaurant
                  </th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-muted-foreground">
                    Tables
                  </th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-muted-foreground">
                    Price
                  </th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-muted-foreground hidden md:table-cell">
                    End Date
                  </th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-muted-foreground hidden lg:table-cell">
                    Auto Renew
                  </th>
                  <th className="text-right py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSubs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 md:py-12 text-center px-4">
                      <p className="text-muted-foreground text-sm md:text-base">
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
                      className="border-b border-border/50 hover:bg-muted/30"
                    >
                      <td className="py-3 md:py-4 px-2 md:px-4">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground text-sm md:text-base truncate">{sub.restaurantName}</p>
                            <p className="text-xs text-muted-foreground truncate">{sub.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 md:py-4 px-2 md:px-4 text-foreground">
                        <div className="flex flex-col">
                          <span className="font-medium text-sm md:text-base">{sub.totalTables || 0} tables</span>
                          {sub.locations > 1 && (
                            <span className="text-xs text-muted-foreground">
                              {sub.locations} locations
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 md:py-4 px-2 md:px-4 text-foreground font-medium">
                        <div className="flex flex-col">
                          <span className="text-sm md:text-base">₹{sub.price}/mo</span>
                          <span className="text-xs text-muted-foreground font-normal">
                            ₹{sub.pricePerTable || PRICE_PER_TABLE}/table
                          </span>
                        </div>
                      </td>
                      <td className="py-3 md:py-4 px-2 md:px-4">
                        <span className={`px-2 py-1 text-xs rounded-full capitalize ${statusColor(sub.status)}`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3 md:py-4 px-2 md:px-4 text-muted-foreground text-xs md:text-sm hidden md:table-cell">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {sub.endDate
                            ? new Date(sub.endDate).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </td>
                      <td className="py-3 md:py-4 px-2 md:px-4 hidden lg:table-cell">
                        {sub.autoRenew ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-500/10 text-green-500">
                            Yes
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">
                            No
                          </span>
                        )}
                      </td>
                      <td className="py-3 md:py-4 px-2 md:px-4 text-right">
                        <div className="flex items-center justify-end gap-1 md:gap-2 flex-wrap">
                          <button
                            onClick={() => handleEditClick(sub)}
                            className="px-2 md:px-3 py-1 text-xs md:text-sm border border-border rounded-lg hover:bg-muted text-foreground flex items-center gap-1"
                          >
                            <Edit className="w-3 h-3 md:w-4 md:h-4" />
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                          {(sub.status === "expired" || sub.status === "expiring") && (
                            <button
                              onClick={() => handleRenew(sub)}
                              disabled={updating || !canRenew(sub.restaurantId)}
                              className="px-2 md:px-3 py-1 text-xs md:text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed relative"
                              title={!canRenew(sub.restaurantId) ? `Please wait ${Math.ceil(getRemainingCooldownHours(sub.restaurantId))} hour(s) before renewing again.` : ""}
                            >
                              {updating ? (
                                <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                              ) : (
                                <RefreshCw className="w-3 h-3 md:w-4 md:h-4" />
                              )}
                              <span className="hidden sm:inline">Renew</span>
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
      </div>

      {showEdit && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-4" onClick={() => {
          setShowEdit(false);
          setError(null);
        }}>
          <div
            className="bg-card border border-border rounded-xl p-4 sm:p-5 md:p-6 w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 sm:mb-5">
              <div className="flex justify-between items-start gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">Edit Subscription</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
                    {selectedSub?.restaurantName}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowEdit(false);
                    setError(null);
                  }}
                  className="flex-shrink-0 p-1 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
            </div>
            {selectedSub && (
              <div className="space-y-3 sm:space-y-4">
                {loadingLocations ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : locationDetails.length > 0 ? (
                  <div className="space-y-3">
                    <label className="text-xs sm:text-sm font-medium text-foreground">
                      Tables by Location
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {locationDetails.map((loc, index) => {
                        const isIncreased = loc.editTables > loc.totalTables;

                        return (
                          <div key={loc._id || index} className="p-3 sm:p-4 bg-muted rounded-lg border border-border flex flex-col">
                            <div className="mb-3">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                                    {loc.locationName || `Location ${index + 1}`}
                                  </p>
                                  {loc.address && (
                                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                                      {loc.city && loc.state ? `${loc.city}, ${loc.state}` : loc.address}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-muted-foreground">
                                  Current: <span className="font-medium text-foreground">{loc.totalTables || 0}</span>
                                </span>
                                {isIncreased && (
                                  <span className="text-xs text-yellow-500 font-medium">
                                    +{loc.editTables - loc.totalTables}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="mt-auto">
                              <input
                                type="number"
                                min="0"
                                max="1000"
                                value={loc.editTables || 0}
                                onChange={(e) => handleLocationTablesChange(loc._id, e.target.value)}
                                className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="0"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="pt-3 border-t border-border bg-muted rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">Total Tables: </span>
                          <span className="text-base font-semibold text-foreground">
                            {locationDetails.reduce((sum, loc) => sum + (loc.editTables || 0), 0)}
                          </span>
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">Price: </span>
                          <span className="text-base font-semibold text-primary">₹{calculatedPrice}</span>
                          <span className="text-muted-foreground">/mo</span>
                        </p>
                      </div>
                      {locationDetails.reduce((sum, loc) => sum + (loc.editTables || 0), 0) > selectedSub.totalTables && (
                        <p className="text-xs text-yellow-500 mt-2 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Prorated invoice will be created for extra tables
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-foreground">
                      Total Tables
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={editTotalTables}
                      onChange={(e) => handleTablesChange(e.target.value)}
                      className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground text-sm sm:text-base"
                    />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Price: ₹{calculatedPrice}/mo (₹{PRICE_PER_TABLE} per table)
                      {editTotalTables > selectedSub.totalTables && (
                        <span className="block mt-1 text-yellow-500">
                          Prorated invoice will be created for extra tables
                        </span>
                      )}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-foreground">
                      Add Months (Extension)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="12"
                      value={editMonthsToAdd}
                      onChange={(e) => handleMonthsChange(e.target.value)}
                      className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="0"
                    />
                    {editMonthsToAdd > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Price: <span className="font-medium text-primary">₹{calculatedExtensionPrice}</span>
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-foreground">
                      End Date {editMonthsToAdd > 0 && <span className="text-muted-foreground font-normal text-xs">(auto)</span>}
                    </label>
                    <input
                      type="date"
                      value={editEndDate}
                      onChange={(e) => setEditEndDate(e.target.value)}
                      disabled={editMonthsToAdd > 0}
                      className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
                {editMonthsToAdd > 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2 sm:p-3">
                    <p className="text-xs text-yellow-500 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      Payment invoice will be sent to restaurant for {editMonthsToAdd} month(s) extension
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2 p-3 bg-muted rounded-lg border border-border">
                    <label className="text-xs sm:text-sm font-medium text-foreground flex items-center justify-between mb-2">
                      <span>Auto Renew</span>
                      <button
                        type="button"
                        onClick={() => setEditAutoRenew(!editAutoRenew)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card ${editAutoRenew ? "bg-primary" : "bg-border"
                          }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editAutoRenew ? "translate-x-6" : "translate-x-1"
                            }`}
                        />
                      </button>
                    </label>
                    <p className="text-xs text-muted-foreground">
                      {editAutoRenew
                        ? "Renewal reminders will be sent automatically"
                        : "No automatic renewal reminders"}
                    </p>
                  </div>
                  {(editTotalTables > selectedSub.totalTables || editMonthsToAdd > 0 || locationDetails.some(loc => loc.editTables > loc.totalTables)) && (
                    <div className="space-y-2 p-3 bg-muted rounded-lg border border-border">
                      <label className="text-xs sm:text-sm font-medium text-foreground flex items-center justify-between mb-2">
                        <span>Send Payment Email</span>
                        <button
                          type="button"
                          onClick={() => setSendPaymentEmail(!sendPaymentEmail)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card ${sendPaymentEmail ? "bg-primary" : "bg-border"
                            }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${sendPaymentEmail ? "translate-x-6" : "translate-x-1"
                              }`}
                          />
                        </button>
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {sendPaymentEmail
                          ? "Payment link will be sent via email"
                          : "No email sent (for family/special cases)"}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
                  <button
                    className="flex-1 bg-primary text-primary-foreground py-2.5 sm:py-2 rounded-lg hover:bg-primary/90 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                    onClick={handleSaveChanges}
                    disabled={updating}
                  >
                    {updating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="hidden sm:inline">Saving...</span>
                        <span className="sm:hidden">Saving</span>
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                  <button
                    className="px-4 py-2.5 sm:py-2 border border-border rounded-lg text-foreground hover:bg-muted disabled:opacity-50 text-sm sm:text-base"
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
