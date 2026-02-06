import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentRestaurant, updateRestaurantProfile, updateLocation } from "../../utils/api";
import { ManagerHeader, LoadingScreen } from "../../components/ManagerPageComponents";
import RestaurantSubscription from "../../components/ManagerPageComponents/RestaurantSubscription";
import {
    User, Mail, Phone, Building2, Calendar,
    CreditCard, CheckCircle2, FileText,
    Edit2, Save, X, MapPin, Loader2, Store, ArrowLeft
} from "lucide-react";
import { toast } from "react-hot-toast";

const ProfilePage = () => {
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingProfile, setEditingProfile] = useState(false);
    const [editingLocationId, setEditingLocationId] = useState(null);
    const [saving, setSaving] = useState(false);

    const [profileForm, setProfileForm] = useState({
        restaurantName: "",
        ownerName: "",
        phone: "",
        gstNumber: "",
    });

    const [locationForms, setLocationForms] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await getCurrentRestaurant();
            if (res.data?.success) {
                const data = res.data.data;
                setRestaurant(data);
                setProfileForm({
                    restaurantName: data.restaurantName || "",
                    ownerName: data.ownerName || "",
                    phone: data.phone || "",
                    gstNumber: data.gstNumber || "",
                });
            }
        } catch (error) {
            console.error("Failed to fetch restaurant data", error);
            if (error.response?.status !== 401) {
                toast.error("Failed to load profile data");
            }
            if (error.response?.status === 401) {
                const stillHasToken = localStorage.getItem("accessToken");
                if (!stillHasToken) {
                    setLoading(false);
                    return;
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const handleProfileEdit = () => {
        setEditingProfile(true);
    };

    const handleProfileCancel = () => {
        setProfileForm({
            restaurantName: restaurant.restaurantName || "",
            ownerName: restaurant.ownerName || "",
            phone: restaurant.phone || "",
            gstNumber: restaurant.gstNumber || "",
        });
        setEditingProfile(false);
    };

    const handleProfileSave = async () => {
        setSaving(true);
        try {
            const res = await updateRestaurantProfile(profileForm);
            if (res.data?.success) {
                setRestaurant(res.data.data);
                setEditingProfile(false);
                toast.success("Profile updated successfully");
            }
        } catch (error) {
            console.error("Failed to update profile", error);
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleLocationEdit = (location) => {
        setEditingLocationId(location._id || location.id);
        setLocationForms({
            ...locationForms,
            [location._id || location.id]: {
                locationName: location.locationName || "",
                address: location.address || "",
                city: location.city || "",
                state: location.state || "",
                zipCode: location.zipCode || "",
                country: location.country || "India",
                phone: location.phone || "",
            }
        });
    };

    const handleLocationCancel = (locationId) => {
        setEditingLocationId(null);
        const updatedForms = { ...locationForms };
        delete updatedForms[locationId];
        setLocationForms(updatedForms);
    };

    const handleLocationSave = async (locationId) => {
        setSaving(true);
        try {
            const formData = locationForms[locationId];
            const res = await updateLocation(locationId, formData);
            if (res.data?.success) {
                setRestaurant(res.data.data);
                setEditingLocationId(null);
                const updatedForms = { ...locationForms };
                delete updatedForms[locationId];
                setLocationForms(updatedForms);
                toast.success("Location updated successfully");
            }
        } catch (error) {
            console.error("Failed to update location", error);
            toast.error(error.response?.data?.message || "Failed to update location");
        } finally {
            setSaving(false);
        }
    };

    const handleLocationFormChange = (locationId, field, value) => {
        setLocationForms({
            ...locationForms,
            [locationId]: {
                ...locationForms[locationId],
                [field]: value
            }
        });
    };

    const handleProfileFormChange = (field, value) => {
        setProfileForm({
            ...profileForm,
            [field]: value
        });
    };

    if (loading) {
        return <LoadingScreen restaurant={restaurant} />;
    }

    if (!restaurant) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground">Failed to load profile.</p>
            </div>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            <ManagerHeader restaurant={restaurant} />

            <div className="relative bg-primary/5 pb-24 pt-10 px-4 md:px-8">
                <div className="max-w-7xl mx-auto space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="space-y-2">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-2 group"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                Back
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                    <Store className="w-7 h-7 text-primary-foreground" />
                                </div>
                                <h1 className="text-3xl font-bold text-foreground">Restaurant Profile</h1>
                            </div>

                            <p className="text-muted-foreground text-lg max-w-2xl pl-1">
                                Manage your restaurant details and location information.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-background/50 backdrop-blur border border-border rounded-full text-sm font-medium text-muted-foreground shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            System Active
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 -mt-16 space-y-8 pb-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-card border border-border rounded-xl shadow-lg shadow-black/5 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700">
                            <div className="p-6 border-b border-border bg-gradient-to-r from-muted/50 to-muted/10 flex items-center justify-between">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-primary" />
                                    Restaurant Details
                                </h2>
                                {!editingProfile && (
                                    <button
                                        onClick={handleProfileEdit}
                                        disabled={editingLocationId}
                                        className="group flex items-center justify-center p-2.5 text-sm bg-primary/10 text-primary rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary/10 disabled:hover:text-primary"
                                        title="Edit Details"
                                    >
                                        <Edit2 className={`w-4 h-4 transition-transform ${!editingLocationId ? "group-hover:-translate-y-0.5" : ""}`} />
                                    </button>
                                )}
                            </div>
                            <div className="p-6 md:p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Restaurant Name</label>
                                        {editingProfile ? (
                                            <input
                                                type="text"
                                                value={profileForm.restaurantName}
                                                onChange={(e) => handleProfileFormChange("restaurantName", e.target.value)}
                                                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-foreground transition-all"
                                                placeholder="Restaurant Name"
                                            />
                                        ) : (
                                            <div className="p-4 bg-muted/30 border border-border rounded-xl text-foreground font-medium flex items-center gap-3">
                                                <Building2 className="w-5 h-5 text-muted-foreground/70" />
                                                {restaurant.restaurantName}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Owner Name</label>
                                        {editingProfile ? (
                                            <input
                                                type="text"
                                                value={profileForm.ownerName}
                                                onChange={(e) => handleProfileFormChange("ownerName", e.target.value)}
                                                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-foreground transition-all"
                                                placeholder="Owner Name"
                                            />
                                        ) : (
                                            <div className="p-4 bg-muted/30 border border-border rounded-xl text-foreground font-medium flex items-center gap-3">
                                                <User className="w-5 h-5 text-muted-foreground/70" />
                                                {restaurant.ownerName}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</label>
                                        <div className="p-4 bg-muted/30 border border-border rounded-xl text-foreground font-medium flex items-center gap-3">
                                            <Mail className="w-5 h-5 text-muted-foreground/70" />
                                            {restaurant.email}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">
                                            Phone Number <span className="text-red-500">*</span>
                                        </label>
                                        {editingProfile ? (
                                            <input
                                                type="tel"
                                                value={profileForm.phone}
                                                onChange={(e) => handleProfileFormChange("phone", e.target.value)}
                                                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-foreground transition-all"
                                                placeholder="+1 234 567 8900"
                                            />
                                        ) : (
                                            <div className="p-4 bg-muted/30 border border-border rounded-xl text-foreground font-medium flex items-center gap-3">
                                                <Phone className="w-5 h-5 text-muted-foreground/70" />
                                                {restaurant.phone || "Not provided"}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">GST Number</label>
                                        {editingProfile ? (
                                            <input
                                                type="text"
                                                value={profileForm.gstNumber}
                                                onChange={(e) => handleProfileFormChange("gstNumber", e.target.value)}
                                                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-foreground transition-all"
                                                placeholder="GST Number"
                                            />
                                        ) : (
                                            <div className="p-4 bg-muted/30 border border-border rounded-xl text-foreground font-medium flex items-center gap-3">
                                                <FileText className="w-5 h-5 text-muted-foreground/70" />
                                                {restaurant.gstNumber || "Not Provided"}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date Joined</label>
                                        <div className="p-4 bg-muted/30 border border-border rounded-xl text-foreground font-medium flex items-center gap-3">
                                            <Calendar className="w-5 h-5 text-muted-foreground/70" />
                                            {formatDate(restaurant.createdAt)}
                                        </div>
                                    </div>
                                </div>

                                {editingProfile && (
                                    <div className="flex gap-4 pt-4 border-t border-border animate-in fade-in slide-in-from-top-2">
                                        <button
                                            onClick={handleProfileCancel}
                                            disabled={saving}
                                            className="px-6 py-2.5 border border-border rounded-xl text-foreground hover:bg-muted font-medium transition-colors disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleProfileSave}
                                            disabled={saving}
                                            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 font-medium transition-all shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {saving ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4" />
                                                    Save Changes
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-xl font-semibold flex items-center gap-2 text-foreground">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    All Locations
                                    <span className="text-lg text-muted-foreground font-normal">({restaurant.locations?.length || 0})</span>
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {restaurant.locations?.length > 0 ? (
                                    restaurant.locations.map((loc) => {
                                        const locationId = loc._id || loc.id;
                                        const isEditing = editingLocationId === locationId;
                                        const formData = locationForms[locationId] || {};

                                        return (
                                            <div key={locationId} className={`bg-card border border-border rounded-xl shadow-md transition-all duration-300 overflow-hidden ${isEditing ? 'ring-2 ring-primary/20 scale-[1.01]' : 'hover:shadow-lg hover:-translate-y-1'}`}>
                                                <div className="p-6 space-y-5">
                                                    <div className="flex items-center justify-between border-b border-border pb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                                <Store className="w-5 h-5 text-primary" />
                                                            </div>
                                                            <h3 className="text-xl font-bold text-foreground tracking-tight">
                                                                {loc.locationName}
                                                            </h3>
                                                        </div>
                                                        {!isEditing ? (
                                                            <button
                                                                onClick={() => handleLocationEdit(loc)}
                                                                disabled={saving || editingLocationId || editingProfile}
                                                                className="group flex items-center justify-center p-2.5 text-sm bg-primary/10 text-primary rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary/10 disabled:hover:text-primary"
                                                                title="Edit Details"
                                                            >
                                                                <Edit2 className={`w-4 h-4 transition-transform ${!(saving || editingLocationId || editingProfile) ? "group-hover:-translate-y-0.5" : ""}`} />
                                                            </button>
                                                        )

                                                            : null}
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                                        {isEditing ? (
                                                            <>
                                                                <div className="space-y-2">
                                                                    <label className="text-sm font-medium text-foreground">
                                                                        Location Name <span className="text-red-500">*</span>
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={formData.locationName || ""}
                                                                        onChange={(e) => handleLocationFormChange(locationId, "locationName", e.target.value)}
                                                                        className="w-full px-4 py-2 bg-muted/50 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground transition-all"
                                                                        placeholder="Location Name"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-sm font-medium text-foreground">
                                                                        Phone Number
                                                                    </label>
                                                                    <input
                                                                        type="tel"
                                                                        value={formData.phone || ""}
                                                                        onChange={(e) => handleLocationFormChange(locationId, "phone", e.target.value)}
                                                                        className="w-full px-4 py-2 bg-muted/50 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground transition-all"
                                                                        placeholder="Phone Number"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2 md:col-span-2">
                                                                    <label className="text-sm font-medium text-foreground">
                                                                        Address <span className="text-red-500">*</span>
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={formData.address || ""}
                                                                        onChange={(e) => handleLocationFormChange(locationId, "address", e.target.value)}
                                                                        className="w-full px-4 py-2 bg-muted/50 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground transition-all"
                                                                        placeholder="Address"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-sm font-medium text-foreground">
                                                                        City <span className="text-red-500">*</span>
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={formData.city || ""}
                                                                        onChange={(e) => handleLocationFormChange(locationId, "city", e.target.value)}
                                                                        className="w-full px-4 py-2 bg-muted/50 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground transition-all"
                                                                        placeholder="City"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-sm font-medium text-foreground">
                                                                        State <span className="text-red-500">*</span>
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={formData.state || ""}
                                                                        onChange={(e) => handleLocationFormChange(locationId, "state", e.target.value)}
                                                                        className="w-full px-4 py-2 bg-muted/50 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground transition-all"
                                                                        placeholder="State"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-sm font-medium text-foreground">
                                                                        Zip Code <span className="text-red-500">*</span>
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={formData.zipCode || ""}
                                                                        onChange={(e) => handleLocationFormChange(locationId, "zipCode", e.target.value)}
                                                                        className="w-full px-4 py-2 bg-muted/50 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground transition-all"
                                                                        placeholder="Zip Code"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-sm font-medium text-foreground">
                                                                        Country
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={formData.country || ""}
                                                                        onChange={(e) => handleLocationFormChange(locationId, "country", e.target.value)}
                                                                        className="w-full px-4 py-2 bg-muted/50 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground transition-all"
                                                                        placeholder="Country"
                                                                    />
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="md:col-span-2 space-y-1">
                                                                    <label className="text-xs font-semibold text-muted-foreground uppercase">Full Address</label>
                                                                    <p className="text-foreground text-lg leading-relaxed">
                                                                        {loc.address}, {loc.city}, {loc.state} {loc.zipCode}
                                                                    </p>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-xs font-semibold text-muted-foreground uppercase">Country</label>
                                                                    <p className="text-foreground font-medium">{loc.country || "N/A"}</p>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-xs font-semibold text-muted-foreground uppercase">Phone</label>
                                                                    <p className="text-foreground font-medium">{loc.phone || "N/A"}</p>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>

                                                    {isEditing && (
                                                        <div className="flex gap-4 pt-4 border-t border-border animate-in fade-in">
                                                            <button
                                                                onClick={() => handleLocationCancel(locationId)}
                                                                disabled={saving}
                                                                className="px-6 py-2 border border-border rounded-lg text-foreground hover:bg-muted font-medium transition-colors disabled:opacity-50"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={() => handleLocationSave(locationId)}
                                                                disabled={saving}
                                                                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                                                            >
                                                                {saving ? (
                                                                    <>
                                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                                        Saving...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Save className="w-4 h-4" />
                                                                        Save Changes
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="p-8 text-center text-muted-foreground bg-card border border-border rounded-xl shadow-sm">
                                        No locations added yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-card border border-border rounded-xl shadow-lg shadow-black/5 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-700">
                            <div className="p-6 border-b border-border bg-gradient-to-r from-muted/50 to-muted/10">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-primary" />
                                    Account Status
                                </h2>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="flex items-center justify-between p-4 bg-muted/20 border border-border rounded-xl">
                                    <span className="text-muted-foreground font-medium">Current Status</span>
                                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${restaurant.status === "APPROVED"
                                        ? "bg-green-100 text-green-700 shadow-green-100/50 dark:text-green-400"
                                        : "bg-yellow-100 text-yellow-700 shadow-yellow-100/50 dark:text-yellow-400"
                                        }`}>
                                        {restaurant.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-card border border-border rounded-xl shadow-lg shadow-black/5 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-700">
                            <div className="p-6 border-b border-border bg-gradient-to-r from-muted/50 to-muted/10">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-primary" />
                                    Subscription & Payment
                                </h2>
                            </div>
                            <div className="p-6">
                                <RestaurantSubscription
                                    restaurant={restaurant}
                                    onUpdate={fetchData}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
