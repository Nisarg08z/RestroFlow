import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  Check,
  CheckCircle2,
  Filter,
  MapPin,
  TrendingUp,
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

  // Edit State
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

  useEffect(() => {
    if (showEdit) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showEdit]);

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
    if (status === "active") return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    if (status === "expiring") return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    if (status === "expired") return "bg-rose-500/10 text-rose-600 border-rose-500/20";
    return "bg-slate-500/10 text-slate-600 border-slate-500/20";
  };

  const statusBadge = (status) => {
    if (status === "active") return <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>;
    if (status === "expiring") return <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>;
    if (status === "expired") return <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>;
    return <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mr-1.5"></span>;
  }

  const formatStatusDisplay = (status) => {
    if (status === "active") return "Active";
    if (status === "expiring") return "Expiring Soon";
    if (status === "expired") return "Expired";
    return status;
  };

  const canRenew = (restaurantId) => {
    const lastRenewalKey = `lastRenewal_${restaurantId}`;
    const lastRenewalTime = localStorage.getItem(lastRenewalKey);
    if (!lastRenewalTime) return true;
    const lastRenewal = new Date(lastRenewalTime);
    const now = new Date();
    const diffInHours = (now - lastRenewal) / (1000 * 60 * 60);
    return diffInHours >= 24;
  };

  const getRemainingCooldownHours = (restaurantId) => {
    const lastRenewalKey = `lastRenewal_${restaurantId}`;
    const lastRenewalTime = localStorage.getItem(lastRenewalKey);
    if (!lastRenewalTime) return 0;
    const lastRenewal = new Date(lastRenewalTime);
    const now = new Date();
    const diffInHours = (now - lastRenewal) / (1000 * 60 * 60);
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

      if (editMonthsToAdd > 0) updateData.monthsToAdd = editMonthsToAdd;
      if (editEndDate && editEndDate !== selectedSub.endDate && !updateData.monthsToAdd) updateData.endDate = editEndDate;
      if (editAutoRenew !== selectedSub.autoRenew) updateData.autoRenew = editAutoRenew;

      updateData.sendPaymentEmail = sendPaymentEmail;

      const response = await updateSubscription(selectedSub.restaurantId, updateData);

      if (response.data?.success) {
        if (response.data.data.invoice && sendPaymentEmail) {
          setEmailNotification({
            restaurantName: selectedSub.restaurantName,
            amount: response.data.data.invoice.amount,
          });
        }

        if (response.data.data.subscription) {
          setSubscriptions((prev) =>
            prev.map((sub) => sub.id === selectedSub.id ? { ...sub, ...response.data.data.subscription } : sub)
          );
        } else {
          // Fallback if full object not returned
          setShowEdit(false);
          fetchData();
          return;
        }
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
    if (!canRenew(sub.restaurantId)) {
      const remainingHours = getRemainingCooldownHours(sub.restaurantId);
      setError(`Please wait ${Math.ceil(remainingHours)} hour(s) before renewing again.`);
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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">

      {/* Toast Notification */}
      {emailNotification && createPortal(
        <div className="fixed top-24 right-6 z-[120] bg-white dark:bg-slate-900 border border-border/50 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-right-10 overflow-hidden max-w-sm">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-foreground text-sm">Invoice Sent</h4>
              <p className="text-xs text-muted-foreground mt-1">Payment link sent to <br /><span className="font-medium text-foreground">{emailNotification.restaurantName}</span></p>
              <p className="text-blue-600 font-bold text-lg mt-2">₹{emailNotification.amount}</p>
            </div>
            <button onClick={() => setEmailNotification(null)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>,
        document.body
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 p-4 rounded-xl flex items-center gap-3 animate-in shake">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="relative overflow-hidden group rounded-3xl p-6 bg-gradient-to-br from-emerald-500/10 to-teal-600/5 border border-emerald-500/20 shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign className="w-20 h-20 text-emerald-500" />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-emerald-600/80 uppercase tracking-widest mb-1">Monthly Revenue</p>
            <h3 className="text-3xl font-bold text-foreground">₹{stats.totalMRR || 0}</h3>
            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600 font-medium bg-emerald-500/10 w-fit px-2 py-1 rounded-lg">
              <TrendingUp className="w-3 h-3" />
              <span>Current MRR</span>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden group rounded-3xl p-6 bg-gradient-to-br from-blue-500/10 to-indigo-600/5 border border-blue-500/20 shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CreditCard className="w-20 h-20 text-blue-500" />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-blue-600/80 uppercase tracking-widest mb-1">Active Plans</p>
            <h3 className="text-3xl font-bold text-foreground">{stats.activeSubscriptions || 0}</h3>
            <div className="mt-4 flex items-center gap-2 text-xs text-blue-600 font-medium bg-blue-500/10 w-fit px-2 py-1 rounded-lg">
              <CheckCircle2 className="w-3 h-3" />
              <span>Live Restaurants</span>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden group rounded-3xl p-6 bg-gradient-to-br from-amber-500/10 to-orange-600/5 border border-amber-500/20 shadow-lg hover:shadow-amber-500/10 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertCircle className="w-20 h-20 text-amber-500" />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-amber-600/80 uppercase tracking-widest mb-1">Expiring Soon</p>
            <h3 className="text-3xl font-bold text-foreground">{stats.expiringSoon || 0}</h3>
            <div className="mt-4 flex items-center gap-2 text-xs text-amber-600 font-medium bg-amber-500/10 w-fit px-2 py-1 rounded-lg">
              <Calendar className="w-3 h-3" />
              <span>Need Renewal</span>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden group rounded-3xl p-6 bg-gradient-to-br from-rose-500/10 to-red-600/5 border border-rose-500/20 shadow-lg hover:shadow-rose-500/10 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <X className="w-20 h-20 text-rose-500" />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-rose-600/80 uppercase tracking-widest mb-1">Expired</p>
            <h3 className="text-3xl font-bold text-foreground">{stats.expiredCount || 0}</h3>
            <div className="mt-4 flex items-center gap-2 text-xs text-rose-600 font-medium bg-rose-500/10 w-fit px-2 py-1 rounded-lg">
              <AlertCircle className="w-3 h-3" />
              <span>Inactive</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-transparent"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-foreground">Standard Plan Features</h3>
            <p className="text-sm text-muted-foreground mt-1">All subscriptions include premium access</p>
          </div>
          <div className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-lg shadow-primary/20">
            ₹{PRICE_PER_TABLE} <span className="text-primary-foreground/80 font-medium">/ table / month</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-3 gap-x-6">
          {allFeatures.map((feature, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-foreground/80">
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4 bg-muted/30 p-2 rounded-2xl border border-border/50 backdrop-blur-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            placeholder="Search subscriptions by restaurant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card/60 border border-border/30 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all outline-none"
          />
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b border-border/50">
                <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Restaurant</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Usage</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pricing</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Renewal</th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center text-muted-foreground">
                    <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    No subscriptions found
                  </td>
                </tr>
              ) : (
                filteredSubs.map(sub => (
                  <tr key={sub.id} className="group hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-foreground text-sm truncate max-w-[150px]">{sub.restaurantName}</p>
                          <p className="text-xs text-muted-foreground">ID: {sub.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                          {sub.totalTables || 0} <span className="font-normal text-muted-foreground">tables</span>
                        </span>
                        {sub.locations > 1 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted w-fit mt-1 text-muted-foreground">
                            {sub.locations} Locations
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground text-sm">₹{sub.price}/mo</span>
                        <span className="text-xs text-muted-foreground">₹{sub.pricePerTable || PRICE_PER_TABLE} / table</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColor(sub.status)}`}>
                        {statusBadge(sub.status)}
                        {formatStatusDisplay(sub.status)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col text-sm">
                        <span className="text-foreground font-medium">
                          {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : "N/A"}
                        </span>
                        {sub.autoRenew && (
                          <span className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5">
                            <RefreshCw className="w-3 h-3" /> Auto-on
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(sub)}
                          className="p-2 rounded-lg border border-border/50 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                          title="Edit Subscription"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {(sub.status === "expired" || sub.status === "expiring") && (
                          <button
                            onClick={() => handleRenew(sub)}
                            disabled={updating || !canRenew(sub.restaurantId)}
                            className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Renew Now"
                          >
                            {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
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

      {/* Edit Modal */}
      {showEdit && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300"
          onClick={() => { setShowEdit(false); setError(null); }}
        >
          <div className="bg-background border border-border rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-border/50 flex justify-between items-center sticky top-0 bg-background/95 backdrop-blur z-10">
              <div>
                <h2 className="text-xl font-bold text-foreground">Manage Subscription</h2>
                <p className="text-sm text-muted-foreground">{selectedSub?.restaurantName}</p>
              </div>
              <button onClick={() => setShowEdit(false)} className="p-2 rounded-full hover:bg-muted transition">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-8 flex-1">
              {loadingLocations ? (
                <div className="py-20 flex flex-col items-center">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  <p className="mt-4 text-muted-foreground">Loading specific data...</p>
                </div>
              ) : (
                <>
                  {/* Section 1: Tables & Locations */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Building2 className="w-4 h-4" /> Capacity & Locations
                    </h3>

                    {locationDetails.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {locationDetails.map((loc, idx) => {
                          const isChanged = loc.editTables !== loc.totalTables;
                          return (
                            <div key={idx} className={`p-4 rounded-2xl border transition-all ${isChanged ? 'border-primary/50 bg-primary/5' : 'border-border bg-card'}`}>
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <p className="font-semibold text-sm">{loc.locationName || `Location ${idx + 1}`}</p>
                                  <p className="text-xs text-muted-foreground truncate max-w-[150px]">{loc.address || "No address"}</p>
                                </div>
                                {isChanged && <span className="text-xs font-bold text-primary px-2 py-1 bg-primary/10 rounded-md">Modified</span>}
                              </div>
                              <div className="flex items-center gap-3">
                                <label className="text-xs font-medium text-muted-foreground">Tables:</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={loc.editTables || 0}
                                  onChange={(e) => handleLocationTablesChange(loc._id, e.target.value)}
                                  className="w-20 px-2 py-1.5 rounded-lg border border-border bg-background text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="bg-muted/30 p-4 rounded-2xl border border-border/50">
                        <label className="text-sm font-medium mb-2 block">Total Tables</label>
                        <input
                          type="number" min="0" value={editTotalTables} onChange={(e) => handleTablesChange(e.target.value)}
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                      </div>
                    )}

                    <div className="flex justify-between items-center text-sm font-medium pt-2 px-1">
                      <span>Total Tables across all locations:</span>
                      <span className="text-lg font-bold text-primary">
                        {locationDetails.length > 0
                          ? locationDetails.reduce((sum, loc) => sum + (loc.editTables || 0), 0)
                          : editTotalTables
                        }
                      </span>
                    </div>
                  </div>

                  <div className="h-px bg-border/50"></div>

                  {/* Section 2: Extension & Billing */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Extension & Renewal
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Extend Period</label>
                        <select
                          value={editMonthsToAdd}
                          onChange={(e) => handleMonthsChange(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                        >
                          <option value="0">No extension</option>
                          <option value="1">+1 Month</option>
                          <option value="3">+3 Months</option>
                          <option value="6">+6 Months</option>
                          <option value="12">+1 Year</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Subscription End</label>
                        <input
                          type="date"
                          disabled={editMonthsToAdd > 0}
                          value={editEndDate ? new Date(editEndDate).toISOString().split("T")[0] : ""}
                          onChange={(e) => setEditEndDate(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                      <label className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 cursor-pointer transition flex-1">
                        <input type="checkbox" checked={editAutoRenew} onChange={e => setEditAutoRenew(e.target.checked)} className="w-5 h-5 rounded text-primary focus:ring-primary" />
                        <span className="font-medium text-sm">Enable Auto-Renew</span>
                      </label>
                      <label className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 cursor-pointer transition flex-1">
                        <input type="checkbox" checked={sendPaymentEmail} onChange={e => setSendPaymentEmail(e.target.checked)} className="w-5 h-5 rounded text-primary focus:ring-primary" />
                        <span className="font-medium text-sm">Send Invoice Email</span>
                      </label>
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>New Monthly Base Price</span>
                        <span>₹{calculatedPrice}</span>
                      </div>
                      {calculatedExtensionPrice > 0 && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>Extension Cost ({editMonthsToAdd}mo)</span>
                          <span>+ ₹{calculatedExtensionPrice}</span>
                        </div>
                      )}
                      <div className="h-px bg-primary/10 my-2"></div>
                      <div className="flex justify-between font-bold text-lg text-foreground">
                        <span>Estimated Total</span>
                        <span className="text-primary">₹{calculatedPrice + calculatedExtensionPrice}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="p-6 border-t border-border/50 bg-muted/20 flex gap-3">
              <button onClick={() => setShowEdit(false)} className="flex-1 py-3 rounded-xl border border-border font-medium hover:bg-muted transition text-sm">
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={updating}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default SubscriptionManagement;
