import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  MoreVertical,
  Eye,
  Trash2,
  Power,
  Loader2,
  X,
  Mail,
  MapPin,
  DollarSign,
  Calendar,
} from "lucide-react";
import {
  getRestaurantById,
  toggleRestaurantBlock,
  deleteRestaurant,
} from "../../utils/api";
import toast from "react-hot-toast";
import { useAdminData } from "../../context/AdminDataContext";

const RestaurantStatus = () => {
  const { restaurants, loading, refreshRestaurants } = useAdminData();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDropdown, setShowDropdown] = useState(null);
  const [dropdownCoords, setDropdownCoords] = useState({});

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [restaurantDetails, setRestaurantDetails] = useState(null);

  useEffect(() => {
    if (showDetailsModal || showDeleteModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showDetailsModal, showDeleteModal]);

  const getRestaurantStatus = (restaurant) => {
    if (restaurant.isBlocked) return "suspended";
    if (restaurant.isLoggedIn === true) return "active";
    return "inactive";
  };

  const handleViewDetails = async (restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowDetailsModal(true);
    setDetailsLoading(true);

    try {
      const response = await getRestaurantById(restaurant._id || restaurant.id);
      if (response.data?.success) {
        setRestaurantDetails(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching restaurant details:", err);
      toast.error(err.response?.data?.message || "Failed to fetch restaurant details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleToggleBlock = async (restaurant) => {
    try {
      setActionLoading(true);
      setShowDropdown(null);

      const response = await toggleRestaurantBlock(restaurant._id || restaurant.id);
      if (response.data?.success) {
        const isBlocked = response.data.data.isBlocked;
        toast.success(
          isBlocked
            ? `${restaurant.restaurantName} has been suspended`
            : `${restaurant.restaurantName} has been activated`
        );
        refreshRestaurants();
      }
    } catch (err) {
      console.error("Error toggling restaurant block:", err);
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRestaurant) return;

    try {
      setActionLoading(true);
      const response = await deleteRestaurant(selectedRestaurant._id || selectedRestaurant.id);
      if (response.data?.success) {
        toast.success(`${selectedRestaurant.restaurantName} deleted successfully`);
        setShowDeleteModal(false);
        setSelectedRestaurant(null);
        refreshRestaurants();
      }
    } catch (err) {
      console.error("Error deleting restaurant:", err);
      toast.error(err.response?.data?.message || "Failed to delete restaurant");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleDropdown = (restaurantId, event) => {
    event.stopPropagation();

    if (showDropdown === restaurantId) {
      setShowDropdown(null);
      return;
    }

    const buttonRect = event.currentTarget.getBoundingClientRect();
    const dropdownHeight = 160;
    const dropdownWidth = 160;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    let top = buttonRect.bottom + 4;
    let left = buttonRect.right - dropdownWidth;

    // Adjust if going off screen
    if (top + dropdownHeight > viewportHeight) {
      top = buttonRect.top - dropdownHeight - 4;
    }
    if (left < 10) left = 10;

    setDropdownCoords({
      top: top,
      left: left
    });

    setShowDropdown(restaurantId);
  };

  const filteredRestaurants = restaurants.filter((rest) => {
    const matchesSearch =
      rest.restaurantName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rest.ownerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rest.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const status = getRestaurantStatus(rest);
    const matchesStatus = statusFilter === "all" || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const activeCount = restaurants.filter((r) => getRestaurantStatus(r) === "active").length;
  const inactiveCount = restaurants.filter((r) => getRestaurantStatus(r) === "inactive").length;
  const suspendedCount = restaurants.filter((r) => getRestaurantStatus(r) === "suspended").length;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTotalTables = (restaurant) => {
    return restaurant.locations?.reduce((sum, loc) => sum + (loc.totalTables || 0), 0) || 0;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative overflow-hidden group rounded-3xl p-6 bg-gradient-to-br from-emerald-500/10 to-green-600/5 border border-emerald-500/20 shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CheckCircle2 className="w-24 h-24 text-emerald-500" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 mb-4 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm font-medium text-emerald-600/80 uppercase tracking-widest">Active</p>
            <h3 className="text-4xl font-bold text-foreground mt-1">{activeCount}</h3>
            <p className="text-sm text-muted-foreground mt-2">Currently online</p>
          </div>
        </div>

        <div className="relative overflow-hidden group rounded-3xl p-6 bg-gradient-to-br from-slate-500/10 to-gray-600/5 border border-slate-500/20 shadow-lg hover:shadow-slate-500/10 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock className="w-24 h-24 text-slate-500" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 mb-4 rounded-2xl bg-gradient-to-br from-slate-400 to-gray-500 flex items-center justify-center shadow-lg shadow-slate-500/30">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm font-medium text-slate-600/80 uppercase tracking-widest">Inactive</p>
            <h3 className="text-4xl font-bold text-foreground mt-1">{inactiveCount}</h3>
            <p className="text-sm text-muted-foreground mt-2">Offline or idle</p>
          </div>
        </div>

        <div className="relative overflow-hidden group rounded-3xl p-6 bg-gradient-to-br from-rose-500/10 to-red-600/5 border border-rose-500/20 shadow-lg hover:shadow-rose-500/10 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <XCircle className="w-24 h-24 text-rose-500" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 mb-4 rounded-2xl bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
              <XCircle className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm font-medium text-rose-600/80 uppercase tracking-widest">Suspended</p>
            <h3 className="text-4xl font-bold text-foreground mt-1">{suspendedCount}</h3>
            <p className="text-sm text-muted-foreground mt-2">Blocked access</p>
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

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex flex-wrap gap-2 p-2 bg-card/50 rounded-xl border border-border/50 shadow-sm">
            {["all", "active", "inactive", "suspended"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium capitalize transition-all duration-300 border whitespace-nowrap ${statusFilter === status
                  ? "text-primary-foreground bg-primary border-primary shadow-md"
                  : "text-muted-foreground border-border/50 hover:bg-muted hover:text-foreground hover:border-muted-foreground/30"
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Restaurants List */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <h2 className="text-lg font-semibold text-foreground">Restaurants Listing</h2>
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
            {filteredRestaurants.length}
          </span>
        </div>

        <div className="hidden md:block bg-card/90 backdrop-blur-sm border border-border/50 rounded-3xl overflow-hidden shadow-xl">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b border-border/50">
                <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Restaurant</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tables</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Joined</th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                    Loading restaurants...
                  </td>
                </tr>
              ) : filteredRestaurants.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center text-muted-foreground">
                    <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Building2 className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    No restaurants found matching your criteria
                  </td>
                </tr>
              ) : filteredRestaurants.map((restaurant) => {
                const status = getRestaurantStatus(restaurant);
                const totalTables = getTotalTables(restaurant);
                return (
                  <tr key={restaurant._id} className="group hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${status === 'active' ? 'bg-emerald-500/10 text-emerald-600' :
                            status === 'suspended' ? 'bg-rose-500/10 text-rose-600' :
                              'bg-slate-500/10 text-slate-600'
                          }`}>
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground text-base">{restaurant.restaurantName}</p>
                          <p className="text-sm text-muted-foreground">{restaurant.ownerName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${status === 'active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                          status === 'suspended' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
                            'bg-slate-500/10 text-slate-600 border-slate-500/20'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-emerald-500' :
                            status === 'suspended' ? 'bg-rose-500' :
                              'bg-slate-500'
                          }`} />
                        <span className="capitalize">{status}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-foreground">{totalTables}</span>
                      <span className="text-muted-foreground ml-1">tables</span>
                    </td>
                    <td className="py-4 px-6 text-sm">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1 text-muted-foreground"><Mail className="w-3.5 h-3.5" /> {restaurant.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-muted-foreground font-medium">
                      {restaurant.createdAt ? new Date(restaurant.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={(e) => toggleDropdown(restaurant._id || restaurant.id, e)}
                          className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile List Style */}
        <div className="block md:hidden space-y-4">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
              Loading...
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground bg-card rounded-2xl border border-border border-dashed">
              No restaurants found
            </div>
          ) : filteredRestaurants.map((restaurant) => {
            const status = getRestaurantStatus(restaurant);
            return (
              <div key={restaurant._id} className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${status === 'active' ? 'bg-emerald-500' :
                    status === 'suspended' ? 'bg-rose-500' :
                      'bg-slate-500'
                  }`} />

                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${status === 'active' ? 'bg-emerald-500/10 text-emerald-600' :
                        status === 'suspended' ? 'bg-rose-500/10 text-rose-600' :
                          'bg-slate-500/10 text-slate-600'
                      }`}>
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{restaurant.restaurantName}</h3>
                      <p className="text-xs text-muted-foreground">{restaurant.ownerName}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => toggleDropdown(restaurant._id || restaurant.id, e)}
                    className="p-2 -mr-2 text-muted-foreground hover:text-foreground"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-3 text-sm border-t border-border/50 pt-3 mt-3">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${status === 'active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                      status === 'suspended' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
                        'bg-slate-500/10 text-slate-600 border-slate-500/20'
                    }`}>
                    {status}
                  </div>
                  <span className="text-muted-foreground text-xs flex items-center gap-1 ml-auto">
                    <Calendar className="w-3.5 h-3.5" /> {restaurant.createdAt ? new Date(restaurant.createdAt).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Dropdown Menu */}
      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(null)}></div>
          <div
            className="fixed z-50 w-44 bg-popover/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            style={{
              top: dropdownCoords.top,
              left: dropdownCoords.left
            }}
          >
            <div className="p-1 space-y-0.5">
              <button
                onClick={() => {
                  handleViewDetails(restaurants.find(r => (r._id || r.id) === showDropdown));
                  setShowDropdown(null);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4 text-primary" />
                View Details
              </button>

              {(() => {
                const restaurant = restaurants.find(r => (r._id || r.id) === showDropdown);
                if (!restaurant) return null;
                const status = getRestaurantStatus(restaurant);
                return (
                  <button
                    onClick={() => {
                      handleToggleBlock(restaurant);
                      setShowDropdown(null);
                    }}
                    disabled={actionLoading}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors hover:bg-muted ${status === 'suspended' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                  >
                    <Power className="w-4 h-4" />
                    {status === 'suspended' ? 'Activate' : 'Suspend'}
                  </button>
                );
              })()}

              <div className="my-1 border-t border-border/50"></div>
              <button
                onClick={() => {
                  setSelectedRestaurant(restaurants.find(r => (r._id || r.id) === showDropdown));
                  setShowDeleteModal(true);
                  setShowDropdown(null);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRestaurant && createPortal(
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="bg-background border border-border/50 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-6 py-4 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{selectedRestaurant.restaurantName}</h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    ID: {selectedRestaurant._id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-6 h-6 text-muted-foreground" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8">
              {detailsLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <p className="mt-4 text-muted-foreground">Loading details...</p>
                </div>
              ) : restaurantDetails ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-muted/30 p-5 rounded-2xl border border-border/50">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-primary" />
                        Basic Info
                      </h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Owner</p>
                            <p className="font-medium mt-0.5">{restaurantDetails.ownerName}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Joined</p>
                            <p className="font-medium mt-0.5">{formatDate(restaurantDetails.createdAt)}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Email</p>
                          <p className="font-medium mt-0.5 flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5" />
                            {restaurantDetails.email}
                          </p>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Phone</p>
                            <p className="font-medium mt-0.5">{restaurantDetails.phone || "N/A"}</p>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">GST</p>
                            <p className="font-medium mt-0.5">{restaurantDetails.gstNumber || "N/A"}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {restaurantDetails.subscription && (
                      <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 p-5 rounded-2xl border border-indigo-500/10">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                          <DollarSign className="w-5 h-5" />
                          Subscription
                        </h3>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-muted-foreground">Price/Month</span>
                            <span className="text-lg font-bold">₹{restaurantDetails.subscription.pricePerMonth}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-muted-foreground">Status</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${restaurantDetails.subscription.isActive
                                ? "bg-green-500/10 text-green-600"
                                : "bg-gray-500/10 text-gray-600"
                              }`}>
                              {restaurantDetails.subscription.isActive ? "ACTIVE" : "INACTIVE"}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-background/50 p-2 rounded-lg">
                              <p className="text-xs text-muted-foreground">Start Date</p>
                              <p className="font-medium">{formatDate(restaurantDetails.subscription.startDate)}</p>
                            </div>
                            <div className="bg-background/50 p-2 rounded-lg">
                              <p className="text-xs text-muted-foreground">End Date</p>
                              <p className="font-medium">{formatDate(restaurantDetails.subscription.endDate)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="bg-muted/30 p-5 rounded-2xl border border-border/50 h-full">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-primary" />
                          Locations
                        </h3>
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg">
                          {getTotalTables(restaurantDetails)} Tables Total
                        </span>
                      </div>

                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {restaurantDetails.locations?.length > 0 ? (
                          restaurantDetails.locations.map((loc, idx) => (
                            <div key={idx} className="bg-card p-4 rounded-xl border border-border shadow-sm">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold">{loc.locationName}</h4>
                                <span className="text-xs bg-muted px-2 py-1 rounded-md font-medium">
                                  {loc.totalTables} tables
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground flex items-start gap-1.5">
                                <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                {loc.address}, {loc.city}, {loc.state} - {loc.zipCode}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-10 text-muted-foreground">
                            No locations found
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-rose-500">
                  Failed to load details.
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedRestaurant && createPortal(
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Delete Restaurant?</h3>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete <span className="font-semibold text-foreground">{selectedRestaurant.restaurantName}</span>?
                <br />This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 rounded-xl border border-border font-medium hover:bg-muted transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 shadow-lg shadow-rose-500/20 transition flex items-center justify-center gap-2"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete
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

export default RestaurantStatus;
