import React, { useState, useEffect } from "react";
import {
  Search,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Power,
  Loader2,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import {
  getAllRestaurants,
  getRestaurantById,
  toggleRestaurantBlock,
  deleteRestaurant,
} from "../../utils/api";

const RestaurantStatus = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({});
  const [dropdownCoords, setDropdownCoords] = useState({});
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [restaurantDetails, setRestaurantDetails] = useState(null);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const getRestaurantStatus = (restaurant) => {
    if (restaurant.isBlocked) return "suspended";
    if (restaurant.status === "APPROVED" && restaurant.subscription?.isActive) {
      return "active";
    }
    if (restaurant.status === "APPROVED" && !restaurant.subscription?.isActive) {
      return "inactive";
    }
    return "inactive";
  };

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllRestaurants();
      if (response.data?.success) {
        setRestaurants(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching restaurants:", err);
      setError(err.response?.data?.message || "Failed to fetch restaurants");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowDetailsModal(true);
    setDetailsLoading(true);
    setError(null);

    try {
      const response = await getRestaurantById(restaurant._id || restaurant.id);
      if (response.data?.success) {
        setRestaurantDetails(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching restaurant details:", err);
      setError(err.response?.data?.message || "Failed to fetch restaurant details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleToggleBlock = async (restaurant) => {
    try {
      setActionLoading(true);
      setError(null);
      setShowDropdown(null);

      const response = await toggleRestaurantBlock(restaurant._id || restaurant.id);
      if (response.data?.success) {
        const isBlocked = response.data.data.isBlocked;
        setSuccessMessage(
          isBlocked
            ? `${restaurant.restaurantName} has been suspended successfully`
            : `${restaurant.restaurantName} has been activated successfully`
        );
        fetchRestaurants();
      }
    } catch (err) {
      console.error("Error toggling restaurant block:", err);
      setError(err.response?.data?.message || "Failed to update restaurant status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRestaurant) return;

    try {
      setActionLoading(true);
      setError(null);

      const response = await deleteRestaurant(selectedRestaurant._id || selectedRestaurant.id);
      if (response.data?.success) {
        setSuccessMessage(`${selectedRestaurant.restaurantName} has been deleted successfully`);
        setShowDeleteModal(false);
        setSelectedRestaurant(null);
        fetchRestaurants();
      }
    } catch (err) {
      console.error("Error deleting restaurant:", err);
      setError(err.response?.data?.message || "Failed to delete restaurant");
    } finally {
      setActionLoading(false);
    }
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "inactive":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "suspended":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-500";
      case "inactive":
        return "bg-yellow-500/10 text-yellow-500";
      case "suspended":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-[oklch(0.22_0.005_260)] text-[oklch(0.65_0_0)]";
    }
  };

  const getTotalTables = (restaurant) => {
    return restaurant.locations?.reduce((sum, loc) => sum + (loc.totalTables || 0), 0) || 0;
  };

  const toggleDropdown = (restaurantId, event) => {
    if (event) {
      event.stopPropagation();
    }
    
    if (showDropdown === restaurantId) {
      setShowDropdown(null);
      setDropdownPosition({});
      setDropdownCoords({});
      return;
    }

    if (event && event.currentTarget) {
      const buttonRect = event.currentTarget.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;
      const dropdownHeight = 180;
      const dropdownWidth = 160;
      
      const isNearBottom = buttonRect.bottom > viewportHeight * 0.7;
      const shouldOpenUpward = (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) || isNearBottom;
      
      let left = buttonRect.right - dropdownWidth;
      if (left < 10) {
        left = buttonRect.left;
      }
      if (left + dropdownWidth > viewportWidth - 10) {
        left = viewportWidth - dropdownWidth - 10;
      }
      
      let top = shouldOpenUpward 
        ? buttonRect.top - dropdownHeight - 4
        : buttonRect.bottom + 4;
      
      if (top < 10) {
        top = buttonRect.bottom + 4;
      }
      if (top + dropdownHeight > viewportHeight - 10) {
        top = buttonRect.top - dropdownHeight - 4;
      }
      
      setDropdownPosition({
        ...dropdownPosition,
        [restaurantId]: shouldOpenUpward ? 'up' : 'down'
      });
      
      setDropdownCoords({
        ...dropdownCoords,
        [restaurantId]: {
          top: `${top}px`,
          left: `${left}px`,
          right: 'auto'
        }
      });
    } else {
      setDropdownPosition({
        ...dropdownPosition,
        [restaurantId]: 'down'
      });
    }
    
    setShowDropdown(restaurantId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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

      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 sm:p-4">
          <p className="text-green-500 text-xs sm:text-sm break-words">{successMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-xl p-3 md:p-4 hover:border-green-500/30 transition-colors">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xl md:text-2xl font-bold text-[oklch(0.98_0_0)]">{activeCount}</p>
              <p className="text-xs md:text-sm text-[oklch(0.65_0_0)]">Active Restaurants</p>
            </div>
          </div>
        </div>
        <div className="bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-xl p-3 md:p-4 hover:border-yellow-500/30 transition-colors">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xl md:text-2xl font-bold text-[oklch(0.98_0_0)]">{inactiveCount}</p>
              <p className="text-xs md:text-sm text-[oklch(0.65_0_0)]">Inactive Restaurants</p>
            </div>
          </div>
        </div>
        <div className="bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-xl p-3 md:p-4 hover:border-red-500/30 transition-colors">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-red-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <XCircle className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xl md:text-2xl font-bold text-[oklch(0.98_0_0)]">{suspendedCount}</p>
              <p className="text-xs md:text-sm text-[oklch(0.65_0_0)]">Suspended Restaurants</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-xl p-3 md:p-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[oklch(0.65_0_0)]" />
            <input
              type="text"
              placeholder="Search restaurants by name, owner, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 py-2 bg-[oklch(0.22_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-lg text-[oklch(0.98_0_0)] text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[oklch(0.7_0.18_45)] focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", "active", "inactive", "suspended"].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setShowDropdown(null);
                }}
                disabled={actionLoading}
                className={`px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg font-medium transition-colors capitalize disabled:opacity-50 disabled:cursor-not-allowed ${
                  statusFilter === status
                    ? "bg-[oklch(0.7_0.18_45)] text-black"
                    : "bg-[oklch(0.22_0.005_260)] border border-[oklch(0.28_0.005_260)] text-[oklch(0.98_0_0)] hover:bg-[oklch(0.28_0.005_260)]"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-xl overflow-hidden">
        <div className="p-3 md:p-4 border-b border-[oklch(0.28_0.005_260)]">
          <div className="flex items-center justify-between">
            <h3 className="text-base md:text-lg font-semibold text-[oklch(0.98_0_0)]">
              All Restaurants ({filteredRestaurants.length})
            </h3>
            <button
              onClick={fetchRestaurants}
              disabled={loading}
              className="p-1.5 hover:bg-[oklch(0.22_0.005_260)] rounded-lg transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-[oklch(0.65_0_0)] ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="block md:hidden divide-y divide-[oklch(0.28_0.005_260)]">
          {filteredRestaurants.length === 0 ? (
            <div className="py-8 text-center px-4">
              <p className="text-[oklch(0.65_0_0)] text-sm">
                {searchQuery || statusFilter !== "all"
                  ? "No restaurants found matching your filters."
                  : "No restaurants found."}
              </p>
            </div>
          ) : (
            filteredRestaurants.map((restaurant) => {
              const status = getRestaurantStatus(restaurant);
              const totalTables = getTotalTables(restaurant);
              return (
                <div
                  key={restaurant._id || restaurant.id}
                  className="p-4 space-y-3 hover:bg-[oklch(0.22_0.005_260)]/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-[oklch(0.7_0.18_45)]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-[oklch(0.7_0.18_45)]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-[oklch(0.98_0_0)] text-sm truncate">
                          {restaurant.restaurantName}
                        </p>
                        <p className="text-xs text-[oklch(0.65_0_0)] truncate">{restaurant.ownerName}</p>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={(e) => toggleDropdown(restaurant._id || restaurant.id, e)}
                        disabled={actionLoading}
                        className="p-1.5 hover:bg-[oklch(0.22_0.005_260)] rounded-lg transition-colors disabled:opacity-50"
                      >
                        <MoreVertical className="w-4 h-4 text-[oklch(0.65_0_0)]" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-[oklch(0.65_0_0)] mb-1">Status</p>
                      <div className="flex items-center gap-1.5">
                        {getStatusIcon(status)}
                        <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(status)}`}>
                          {status}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-[oklch(0.65_0_0)] mb-1">Tables</p>
                      <p className="font-medium text-[oklch(0.98_0_0)]">{totalTables}</p>
                    </div>
                  </div>

                  <div className="text-xs text-[oklch(0.65_0_0)]">
                    <p className="truncate flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {restaurant.email}
                    </p>
                    <p className="mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Joined: {restaurant.createdAt ? formatDate(restaurant.createdAt) : "N/A"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-[oklch(0.28_0.005_260)]">
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-[oklch(0.65_0_0)]">
                    Restaurant
                  </th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-[oklch(0.65_0_0)]">
                    Status
                  </th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-[oklch(0.65_0_0)]">
                    Tables
                  </th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-[oklch(0.65_0_0)] hidden lg:table-cell">
                    Email
                  </th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-[oklch(0.65_0_0)] hidden lg:table-cell">
                    Joined
                  </th>
                  <th className="text-right py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-[oklch(0.65_0_0)]">
                    Manage
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRestaurants.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 md:py-12 text-center px-4">
                      <p className="text-[oklch(0.65_0_0)] text-sm md:text-base">
                        {searchQuery || statusFilter !== "all"
                          ? "No restaurants found matching your filters."
                          : "No restaurants found."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredRestaurants.map((restaurant) => {
                    const status = getRestaurantStatus(restaurant);
                    const totalTables = getTotalTables(restaurant);
                    return (
                      <tr
                        key={restaurant._id || restaurant.id}
                        className="border-b border-[oklch(0.28_0.005_260)]/50 hover:bg-[oklch(0.22_0.005_260)]/30 transition-colors"
                      >
                        <td className="py-3 md:py-4 px-2 md:px-4">
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-[oklch(0.7_0.18_45)]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-4 h-4 md:w-5 md:h-5 text-[oklch(0.7_0.18_45)]" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-[oklch(0.98_0_0)] text-sm md:text-base truncate">
                                {restaurant.restaurantName}
                              </p>
                              <p className="text-xs text-[oklch(0.65_0_0)] truncate">{restaurant.ownerName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 md:py-4 px-2 md:px-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(status)}
                            <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(status)}`}>
                              {status}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 md:py-4 px-2 md:px-4 text-[oklch(0.98_0_0)] font-medium">
                          <span className="text-sm md:text-base">{totalTables}</span>
                        </td>
                        <td className="py-3 md:py-4 px-2 md:px-4 text-[oklch(0.65_0_0)] text-xs md:text-sm hidden lg:table-cell">
                          <span className="truncate block max-w-[200px]">{restaurant.email}</span>
                        </td>
                        <td className="py-3 md:py-4 px-2 md:px-4 text-[oklch(0.65_0_0)] text-xs md:text-sm hidden lg:table-cell">
                          {restaurant.createdAt ? formatDate(restaurant.createdAt) : "N/A"}
                        </td>
                        <td className="py-3 md:py-4 px-2 md:px-4 text-right">
                          <div className="relative inline-block">
                            <button
                              onClick={(e) => toggleDropdown(restaurant._id || restaurant.id, e)}
                              disabled={actionLoading}
                              className="p-1.5 hover:bg-[oklch(0.22_0.005_260)] rounded-lg transition-colors disabled:opacity-50"
                            >
                              <MoreVertical className="w-4 h-4 text-[oklch(0.65_0_0)]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showDetailsModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-4"
          onClick={() => {
            setShowDetailsModal(false);
            setRestaurantDetails(null);
            setError(null);
          }}
        >
          <div
            className="bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-xl p-4 sm:p-5 md:p-6 w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 sm:mb-5">
              <div className="flex justify-between items-start gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-[oklch(0.98_0_0)]">Restaurant Details</h3>
                  <p className="text-xs sm:text-sm text-[oklch(0.65_0_0)] mt-1 truncate">
                    {selectedRestaurant?.restaurantName}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setRestaurantDetails(null);
                    setError(null);
                  }}
                  className="flex-shrink-0 p-1 hover:bg-[oklch(0.22_0.005_260)] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[oklch(0.65_0_0)] hover:text-[oklch(0.98_0_0)]" />
                </button>
              </div>
            </div>

            {detailsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-[oklch(0.7_0.18_45)]" />
              </div>
            ) : restaurantDetails ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="bg-[oklch(0.22_0.005_260)] rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-[oklch(0.98_0_0)] mb-3">Basic Information</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-[oklch(0.65_0_0)] mb-1">Restaurant Name</p>
                        <p className="text-sm text-[oklch(0.98_0_0)] font-medium">{restaurantDetails.restaurantName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[oklch(0.65_0_0)] mb-1">Owner Name</p>
                        <p className="text-sm text-[oklch(0.98_0_0)] font-medium">{restaurantDetails.ownerName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[oklch(0.65_0_0)] mb-1 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          Email
                        </p>
                        <p className="text-sm text-[oklch(0.98_0_0)] font-medium break-all">{restaurantDetails.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[oklch(0.65_0_0)] mb-1 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          Phone
                        </p>
                        <p className="text-sm text-[oklch(0.98_0_0)] font-medium">{restaurantDetails.phone || "N/A"}</p>
                      </div>
                      {restaurantDetails.gstNumber && (
                        <div>
                          <p className="text-xs text-[oklch(0.65_0_0)] mb-1">GST Number</p>
                          <p className="text-sm text-[oklch(0.98_0_0)] font-medium">{restaurantDetails.gstNumber}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-[oklch(0.65_0_0)] mb-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Joined Date
                        </p>
                        <p className="text-sm text-[oklch(0.98_0_0)] font-medium">
                          {restaurantDetails.createdAt ? formatDate(restaurantDetails.createdAt) : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[oklch(0.22_0.005_260)] rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-[oklch(0.98_0_0)] mb-3">Status</h4>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(getRestaurantStatus(restaurantDetails))}
                      <span
                        className={`px-3 py-1.5 text-sm rounded-full capitalize ${getStatusColor(
                          getRestaurantStatus(restaurantDetails)
                        )}`}
                      >
                        {getRestaurantStatus(restaurantDetails)}
                      </span>
                      {restaurantDetails.isBlocked && (
                        <span className="text-xs text-red-500">(Blocked)</span>
                      )}
                    </div>
                  </div>

                  {restaurantDetails.subscription && (
                    <div className="bg-[oklch(0.22_0.005_260)] rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-[oklch(0.98_0_0)] mb-3 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Subscription Information
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-[oklch(0.65_0_0)] mb-1">Monthly Price</p>
                          <p className="text-sm text-[oklch(0.98_0_0)] font-medium">
                            ₹{restaurantDetails.subscription.pricePerMonth || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[oklch(0.65_0_0)] mb-1">Subscription Status</p>
                          <p className="text-sm text-[oklch(0.98_0_0)] font-medium">
                            {restaurantDetails.subscription.isActive ? "Active" : "Inactive"}
                          </p>
                        </div>
                        {restaurantDetails.subscription.startDate && (
                          <div>
                            <p className="text-xs text-[oklch(0.65_0_0)] mb-1">Start Date</p>
                            <p className="text-sm text-[oklch(0.98_0_0)] font-medium">
                              {formatDate(restaurantDetails.subscription.startDate)}
                            </p>
                          </div>
                        )}
                        {restaurantDetails.subscription.endDate && (
                          <div>
                            <p className="text-xs text-[oklch(0.65_0_0)] mb-1">End Date</p>
                            <p className="text-sm text-[oklch(0.98_0_0)] font-medium">
                              {formatDate(restaurantDetails.subscription.endDate)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {restaurantDetails.locations && restaurantDetails.locations.length > 0 && (
                    <div className="bg-[oklch(0.22_0.005_260)] rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-[oklch(0.98_0_0)] mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Locations ({restaurantDetails.locations.length})
                      </h4>
                      <div className="space-y-3">
                        {restaurantDetails.locations.map((loc, index) => (
                          <div
                            key={loc._id || index}
                            className="p-3 bg-[oklch(0.17_0.005_260)] rounded-lg border border-[oklch(0.28_0.005_260)]"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[oklch(0.98_0_0)]">
                                  {loc.locationName || `Location ${index + 1}`}
                                </p>
                                <p className="text-xs text-[oklch(0.65_0_0)] mt-1 break-words">
                                  {loc.address}, {loc.city}, {loc.state} {loc.zipCode}
                                </p>
                              </div>
                              <span className="text-sm font-medium text-[oklch(0.7_0.18_45)] ml-2 flex-shrink-0">
                                {loc.totalTables || 0} tables
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-[oklch(0.22_0.005_260)] rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-[oklch(0.98_0_0)]">Total Tables</p>
                      <p className="text-lg font-bold text-[oklch(0.7_0.18_45)]">
                        {getTotalTables(restaurantDetails)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-[oklch(0.65_0_0)] text-sm">Failed to load restaurant details</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showDeleteModal && selectedRestaurant && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-4"
          onClick={() => {
            setShowDeleteModal(false);
            setSelectedRestaurant(null);
          }}
        >
          <div
            className="bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-xl p-4 sm:p-5 md:p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-[oklch(0.98_0_0)]">Delete Restaurant</h3>
              </div>
              <p className="text-sm text-[oklch(0.65_0_0)]">
                Are you sure you want to delete <span className="font-medium text-[oklch(0.98_0_0)]">{selectedRestaurant.restaurantName}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="flex-1 bg-red-500 text-white py-2.5 sm:py-2 rounded-lg hover:bg-red-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base transition-colors"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">Deleting...</span>
                    <span className="sm:hidden">Deleting</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedRestaurant(null);
                }}
                disabled={actionLoading}
                className="px-4 py-2.5 sm:py-2 border border-[oklch(0.28_0.005_260)] rounded-lg text-[oklch(0.98_0_0)] hover:bg-[oklch(0.22_0.005_260)] disabled:opacity-50 text-sm sm:text-base transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showDropdown && dropdownCoords[showDropdown] && (
        <div
          className="fixed bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-lg shadow-xl z-50 min-w-[160px] backdrop-blur-sm"
          style={{
            top: dropdownCoords[showDropdown].top,
            left: dropdownCoords[showDropdown].left,
            right: dropdownCoords[showDropdown].right,
          }}
        >
          {(() => {
            const restaurant = restaurants.find(r => (r._id || r.id) === showDropdown);
            if (!restaurant) return null;
            const status = getRestaurantStatus(restaurant);
            return (
              <>
                <button
                  onClick={() => {
                    handleViewDetails(restaurant);
                    setShowDropdown(null);
                    setDropdownPosition({});
                    setDropdownCoords({});
                  }}
                  className="w-full px-3 py-2.5 text-left text-xs sm:text-sm text-[oklch(0.98_0_0)] hover:bg-[oklch(0.22_0.005_260)] flex items-center gap-2 transition-colors first:rounded-t-lg"
                >
                  <Eye className="w-4 h-4 flex-shrink-0" />
                  View Details
                </button>
                <button
                  onClick={() => {
                    setShowDropdown(null);
                    setDropdownPosition({});
                    setDropdownCoords({});
                    handleToggleBlock(restaurant);
                  }}
                  disabled={actionLoading}
                  className="w-full px-3 py-2.5 text-left text-xs sm:text-sm text-[oklch(0.98_0_0)] hover:bg-[oklch(0.22_0.005_260)] flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Power className="w-4 h-4 flex-shrink-0" />
                  {status === "active" || status === "inactive" ? "Suspend" : "Activate"}
                </button>
                <button
                  onClick={() => {
                    setSelectedRestaurant(restaurant);
                    setShowDeleteModal(true);
                    setShowDropdown(null);
                    setDropdownPosition({});
                    setDropdownCoords({});
                  }}
                  disabled={actionLoading}
                  className="w-full px-3 py-2.5 text-left text-xs sm:text-sm text-red-500 hover:bg-[oklch(0.22_0.005_260)] flex items-center gap-2 transition-colors disabled:opacity-50 last:rounded-b-lg border-t border-[oklch(0.28_0.005_260)]"
                >
                  <Trash2 className="w-4 h-4 flex-shrink-0" />
                  Delete
                </button>
              </>
            );
          })()}
        </div>
      )}

      {showDropdown && (
        <div 
          className="fixed inset-0 z-[40]" 
          onClick={() => {
            setShowDropdown(null);
            setDropdownPosition({});
            setDropdownCoords({});
          }} 
        />
      )}
    </div>
  );
};

export default RestaurantStatus;
