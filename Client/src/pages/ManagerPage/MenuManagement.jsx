import React, { useState, useEffect, useMemo } from "react";
import {
    Plus,
    Edit,
    Trash2,
    X,
    Save,
    Image as ImageIcon,
    Eye,
    EyeOff,
    Search,
    Filter,
    Grid,
    List,
    Package,
    CheckCircle2,
    XCircle,
    ChefHat,
    LayoutGrid,
    MapPin,
    Sparkles,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { ManagerHeader } from "../../components/ManagerPageComponents";
import {
    getCurrentRestaurant,
    getMenu,
    addCategory,
    deleteCategory,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getLocationMenu,
    hideItemFromLocation,
    showItemInLocation,
    addLocationMenuItem,
    deleteLocationMenuItem,
} from "../../utils/api";
import { toast } from "react-hot-toast";

const MenuManagement = () => {
    // ---- State Management ----
    const [restaurant, setRestaurant] = useState(null);
    const [menu, setMenu] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [locationMenu, setLocationMenu] = useState(null);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [showAddItem, setShowAddItem] = useState(false);
    const [showEditItem, setShowEditItem] = useState(null);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [itemForm, setItemForm] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        image: null,
        imagePreview: null,
    });

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
    const [sortBy, setSortBy] = useState("name");
    const [showFilters, setShowFilters] = useState(false);
    const [availabilityFilter, setAvailabilityFilter] = useState("all");
    const [expandedCategories, setExpandedCategories] = useState(new Set());
    const [deleteDialog, setDeleteDialog] = useState(null); // { itemId, isGlobal, name }
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteCategoryDialog, setDeleteCategoryDialog] = useState(null); // { categoryId, name }
    const [isDeletingCategory, setIsDeletingCategory] = useState(false);

    // ---- Data Fetching ----
    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedLocation) {
            fetchLocationMenu(selectedLocation);
        } else {
            setLocationMenu(null);
        }
    }, [selectedLocation]);

    const fetchData = async () => {
        try {
            const [restaurantRes, menuRes] = await Promise.all([
                getCurrentRestaurant(),
                getMenu(),
            ]);

            if (restaurantRes.data?.success) setRestaurant(restaurantRes.data.data);
            if (menuRes.data?.success) setMenu(menuRes.data.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
            toast.error("Failed to load menu data");
        } finally {
            setLoading(false);
        }
    };

    const fetchLocationMenu = async (locationId) => {
        try {
            const res = await getLocationMenu(locationId);
            if (res.data?.success) setLocationMenu(res.data.data);
        } catch (error) {
            console.error("Failed to fetch location menu", error);
            toast.error("Failed to load location menu");
        }
    };

    // ---- Handlers ----
    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return toast.error("Category name is required");
        try {
            const res = await addCategory({ name: newCategoryName });
            if (res.data?.success) {
                setMenu(res.data.data);
                setNewCategoryName("");
                setShowAddCategory(false);
                toast.success("Category added successfully");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add category");
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        try {
            const res = await deleteCategory(categoryId);
            if (res.data?.success) {
                setMenu(res.data.data);
                toast.success("Category deleted");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete category");
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) return toast.error("Image must be < 5MB");
            const reader = new FileReader();
            reader.onloadend = () => {
                setItemForm({ ...itemForm, image: reader.result, imagePreview: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddItem = async () => {
        if (!itemForm.name.trim() || !itemForm.price || !itemForm.category.trim()) return toast.error("Fill required fields");
        try {
            const formData = {
                name: itemForm.name,
                description: itemForm.description,
                price: parseFloat(itemForm.price),
                category: itemForm.category,
                image: itemForm.image,
            };
            const res = await addMenuItem(formData);
            if (res.data?.success) {
                setMenu(res.data.data);
                resetItemForm();
                setShowAddItem(false);
                toast.success("Item added");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add item");
        }
    };

    const handleUpdateItem = async (itemId) => {
        if (!itemForm.name.trim() || !itemForm.price || !itemForm.category.trim()) return toast.error("Fill required fields");
        try {
            const formData = {
                name: itemForm.name,
                description: itemForm.description,
                price: parseFloat(itemForm.price),
                category: itemForm.category,
            };
            if (itemForm.image) formData.image = itemForm.image;

            const res = await updateMenuItem(itemId, formData);
            if (res.data?.success) {
                setMenu(res.data.data);
                resetItemForm();
                setShowEditItem(null);
                toast.success("Item updated");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update item");
        }
    };

    const handleDeleteItem = async (itemId) => {
        try {
            const res = await deleteMenuItem(itemId);
            if (res.data?.success) {
                setMenu(res.data.data);
                toast.success("Item deleted");
            }
        } catch (error) {
            toast.error("Failed to delete item");
        }
    };

    const handleHideItem = async (itemId) => {
        if (!selectedLocation) return toast.error("Select location first");
        try {
            const res = await hideItemFromLocation(selectedLocation, { itemId });
            if (res.data?.success) {
                await fetchLocationMenu(selectedLocation);
                toast.success("Item hidden");
            }
        } catch (error) {
            toast.error("Failed to hide item");
        }
    };

    const handleShowItem = async (itemId) => {
        if (!selectedLocation) return toast.error("Select location first");
        try {
            const res = await showItemInLocation(selectedLocation, { itemId });
            if (res.data?.success) {
                await fetchLocationMenu(selectedLocation);
                toast.success("Item visible");
            }
        } catch (error) {
            toast.error("Failed to show item");
        }
    };

    const handleAddLocationItem = async () => {
        if (!selectedLocation) return toast.error("Select location first");
        if (!itemForm.name.trim() || !itemForm.price || !itemForm.category.trim()) return toast.error("Fill required fields");
        try {
            const formData = {
                name: itemForm.name,
                description: itemForm.description,
                price: parseFloat(itemForm.price),
                category: itemForm.category,
                image: itemForm.image,
            };
            const res = await addLocationMenuItem(selectedLocation, formData);
            if (res.data?.success) {
                await fetchLocationMenu(selectedLocation);
                resetItemForm();
                setShowAddItem(false);
                toast.success("Location item added");
            }
        } catch (error) {
            toast.error("Failed to add location item");
        }
    };

    const handleDeleteLocationItem = async (itemId) => {
        if (!selectedLocation) return toast.error("Select location first");
        try {
            const res = await deleteLocationMenuItem(selectedLocation, itemId);
            if (res.data?.success) {
                await fetchLocationMenu(selectedLocation);
                toast.success("Location item deleted");
            }
        } catch (error) {
            toast.error("Failed to delete location item");
        }
    };

    const openDeleteDialog = (item) => {
        setDeleteDialog({
            itemId: item._id,
            isGlobal: item.isGlobal !== false,
            name: item.name || "this item",
        });
    };

    const openDeleteCategoryDialog = (category) => {
        if (!category?._id) return;
        setDeleteCategoryDialog({
            categoryId: category._id,
            name: category.name || "this category",
        });
    };

    const confirmDelete = async () => {
        if (!deleteDialog) return;
        setIsDeleting(true);
        try {
            if (deleteDialog.isGlobal) {
                await handleDeleteItem(deleteDialog.itemId);
            } else {
                await handleDeleteLocationItem(deleteDialog.itemId);
            }
        } finally {
            setIsDeleting(false);
            setDeleteDialog(null);
        }
    };

    const confirmDeleteCategory = async () => {
        if (!deleteCategoryDialog) return;
        setIsDeletingCategory(true);
        try {
            await handleDeleteCategory(deleteCategoryDialog.categoryId);
            setExpandedCategories((prev) => {
                const next = new Set(prev);
                next.delete(deleteCategoryDialog.name);
                return next;
            });
        } finally {
            setIsDeletingCategory(false);
            setDeleteCategoryDialog(null);
        }
    };

    // ---- Helpers ----
    const resetItemForm = () => {
        setItemForm({ name: "", description: "", price: "", category: "", image: null, imagePreview: null });
    };

    const openEditItem = (item) => {
        setItemForm({
            name: item.name,
            description: item.description || "",
            price: item.price.toString(),
            category: item.category,
            image: null,
            imagePreview: item.image?.url || null,
        });
        setShowEditItem(item._id);
    };

    const isItemHidden = (itemId) => locationMenu?.locationMenu?.hiddenItems?.includes(itemId.toString());

    // ---- Calculation Logic ----
    const getAllItems = useMemo(() => {
        if (!menu) return [];
        let items = menu.globalMenu.items.map(item => {
            const itemObj = typeof item.toObject === 'function' ? item.toObject() : item;
            const itemId = itemObj._id?.toString() || itemObj._id;
            const isHidden = selectedLocation && locationMenu ? isItemHidden(itemId) : false;
            return { ...itemObj, isGlobal: true, isHidden };
        });

        if (selectedLocation && locationMenu) {
            items = items.map(item => {
                const itemId = item._id?.toString() || item._id;
                return { ...item, isHidden: isItemHidden(itemId) };
            });
            const locationItems = locationMenu.items
                .filter(item => !item.isGlobal)
                .map(item => {
                    const itemObj = typeof item.toObject === 'function' ? item.toObject() : item;
                    return { ...itemObj, isGlobal: false, isHidden: false };
                });
            items = [...items, ...locationItems];
        }
        return items;
    }, [menu, locationMenu, selectedLocation]);

    const filteredAndSortedItems = useMemo(() => {
        let filtered = [...getAllItems];
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(query) ||
                item.description?.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query)
            );
        }
        if (selectedCategoryFilter !== "all") {
            filtered = filtered.filter(item => item.category.toLowerCase() === selectedCategoryFilter.toLowerCase());
        }
        if (availabilityFilter === "available") {
            filtered = filtered.filter(item => {
                const isItemAvailable = item.isAvailable !== false;
                const isNotHidden = selectedLocation ? !item.isHidden : true;
                return isItemAvailable && isNotHidden;
            });
        } else if (availabilityFilter === "unavailable") {
            filtered = filtered.filter(item => {
                const isItemUnavailable = item.isAvailable === false;
                const isHidden = selectedLocation ? item.isHidden === true : false;
                return isItemUnavailable || isHidden;
            });
        }
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "name": return a.name.localeCompare(b.name);
                case "price-asc": return a.price - b.price;
                case "price-desc": return b.price - a.price;
                case "category": return a.category.localeCompare(b.category);
                default: return 0;
            }
        });
        return filtered;
    }, [getAllItems, searchQuery, selectedCategoryFilter, availabilityFilter, sortBy]);

    const stats = useMemo(() => ({
        totalItems: getAllItems.length,
        availableItems: getAllItems.filter(item => item.isAvailable !== false).length,
        categoriesCount: menu?.globalMenu.categories.length || 0,
    }), [getAllItems, menu]);

    const sortedCategories = menu?.globalMenu.categories.sort((a, b) => a.order - b.order) || [];
    const selectedLocationData = restaurant?.locations?.find(
        (loc) => loc._id.toString() === selectedLocation
    );

    // Group items by category
    const itemsByCategory = useMemo(() => {
        const grouped = {};
        filteredAndSortedItems.forEach(item => {
            const category = item.category || 'Uncategorized';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(item);
        });
        return grouped;
    }, [filteredAndSortedItems]);

    const toggleCategory = (categoryName) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(categoryName)) {
                newSet.delete(categoryName);
            } else {
                newSet.add(categoryName);
            }
            return newSet;
        });
    };

    const inrFormatter = useMemo(
        () =>
            new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 2,
            }),
        []
    );

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-background pb-20">
            <ManagerHeader restaurant={restaurant} />
            <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">

                {/* ---- Header Section ---- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
                            Menu Management
                        </h1>
                        <p className="text-muted-foreground mt-2 text-base">
                            Customize and organize your culinary offerings with ease.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={() => setShowAddCategory(true)}
                            className="flex-1 md:flex-none inline-flex justify-center items-center gap-2 px-5 py-2.5 bg-card hover:bg-muted text-foreground border border-border rounded-xl font-semibold transition-all duration-300 shadow-sm hover:shadow-md active:scale-95"
                        >
                            <LayoutGrid className="w-5 h-5 text-primary" />
                            Add Category
                        </button>
                        <button
                            onClick={() => { resetItemForm(); setShowAddItem(true); }}
                            className="flex-1 md:flex-none inline-flex justify-center items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                        >
                            <Plus className="w-5 h-5" />
                            New Item
                        </button>
                    </div>
                </div>

                {/* ---- Stats & Location Selector ---- */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:col-span-3">
                        <div className="relative overflow-hidden bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Package className="w-24 h-24 text-primary transform rotate-12" />
                            </div>
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="p-3 rounded-xl bg-primary text-primary-foreground shadow-lg">
                                    <Package className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Total Items</p>
                                    <h3 className="text-3xl font-extrabold text-foreground tracking-tight mt-1">{stats.totalItems}</h3>
                                </div>
                            </div>
                        </div>

                        <div className="relative overflow-hidden bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <CheckCircle2 className="w-24 h-24 text-primary transform rotate-12" />
                            </div>
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="p-3 rounded-xl bg-primary text-primary-foreground shadow-lg">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Available</p>
                                    <h3 className="text-3xl font-extrabold text-foreground tracking-tight mt-1">{stats.availableItems}</h3>
                                </div>
                            </div>
                        </div>

                        <div className="relative overflow-hidden bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Grid className="w-24 h-24 text-primary transform rotate-12" />
                            </div>
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="p-3 rounded-xl bg-primary text-primary-foreground shadow-lg">
                                    <Grid className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Categories</p>
                                    <h3 className="text-3xl font-extrabold text-foreground tracking-tight mt-1">{stats.categoriesCount}</h3>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Location Selector */}
                    <div className="bg-card border border-border p-6 rounded-2xl shadow-xl flex flex-col justify-center gap-3 md:col-span-1">
                        <div>
                            <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2 mb-3">
                                <MapPin className="w-3.5 h-3.5 text-primary" />
                                Location Context
                            </label>
                            <select
                                value={selectedLocation || ""}
                                onChange={(e) => setSelectedLocation(e.target.value || null)}
                                className="w-full bg-background border border-border text-foreground text-sm rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-primary block outline-none transition-all hover:bg-muted cursor-pointer font-semibold"
                            >
                                <option value="" className="bg-background text-foreground">Global Menu (All Locations)</option>
                                {restaurant?.locations?.map((loc) => (
                                    <option key={loc._id} value={loc._id} className="bg-background text-foreground">{loc.locationName}</option>
                                ))}
                            </select>
                            <p className="text-xs text-muted-foreground mt-3 font-semibold">
                                {selectedLocation ? (
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                                        Editing <strong className="text-foreground font-bold">{selectedLocationData?.locationName}</strong>
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                                        Editing Global Base Menu
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ---- Filters & Search ---- */}
                <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-4">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="relative flex-1 max-w-lg">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Search className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-4 py-3 text-sm text-foreground bg-background border border-border hover:bg-muted focus:bg-background focus:border-primary rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground font-semibold"
                                placeholder="Search menu items..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 px-1">
                            <button onClick={() => setShowFilters(!showFilters)} className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl border transition-all ${showFilters ? 'bg-muted border-primary text-primary' : 'bg-card border-border hover:bg-muted text-foreground'}`}>
                                <Filter className="w-4 h-4" />
                                Filters
                            </button>
                        </div>
                    </div>

                    {showFilters && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border">
                            <div>
                                <label className="block mb-2 text-xs font-bold text-foreground uppercase">Category</label>
                                <select value={selectedCategoryFilter} onChange={(e) => setSelectedCategoryFilter(e.target.value)} className="bg-background border border-border hover:bg-muted focus:bg-background focus:border-primary text-foreground text-sm rounded-xl focus:ring-2 focus:ring-primary/20 block w-full p-2.5 outline-none transition-all cursor-pointer font-semibold">
                                    <option value="all" className="bg-background text-foreground">All Categories</option>
                                    {sortedCategories.map((cat) => <option key={cat._id} value={cat.name} className="bg-background text-foreground">{cat.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block mb-2 text-xs font-bold text-foreground uppercase">Availability</label>
                                <select value={availabilityFilter} onChange={(e) => setAvailabilityFilter(e.target.value)} className="bg-background border border-border hover:bg-muted focus:bg-background focus:border-primary text-foreground text-sm rounded-xl focus:ring-2 focus:ring-primary/20 block w-full p-2.5 outline-none transition-all cursor-pointer font-semibold">
                                    <option value="all" className="bg-background text-foreground">All Status</option>
                                    <option value="available" className="bg-background text-foreground">Available</option>
                                    <option value="unavailable" className="bg-background text-foreground">Unavailable</option>
                                </select>
                            </div>
                            <div>
                                <label className="block mb-2 text-xs font-bold text-foreground uppercase">Sort By</label>
                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-background border border-border hover:bg-muted focus:bg-background focus:border-primary text-foreground text-sm rounded-xl focus:ring-2 focus:ring-primary/20 block w-full p-2.5 outline-none transition-all cursor-pointer font-semibold">
                                    <option value="name" className="bg-background text-foreground">Name (A-Z)</option>
                                    <option value="price-asc" className="bg-background text-foreground">Price (Low - High)</option>
                                    <option value="price-desc" className="bg-background text-foreground">Price (High - Low)</option>
                                    <option value="category" className="bg-background text-foreground">Category</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {filteredAndSortedItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 bg-card border border-dashed border-border rounded-3xl text-center shadow-sm">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                            <Sparkles className="w-10 h-10 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground">No Items Found</h3>
                        <p className="text-muted-foreground mt-2 max-w-sm text-base font-medium">
                            {(searchQuery || selectedCategoryFilter !== "all")
                                ? "We couldn't find anything matching your search. Try adjusting the filters."
                                : "Your menu is empty. Start by adding a new category or item!"}
                        </p>
                        {(searchQuery || selectedCategoryFilter !== "all" || availabilityFilter !== "all") && (
                            <button
                                onClick={() => { setSearchQuery(""); setSelectedCategoryFilter("all"); setAvailabilityFilter("all"); }}
                                className="mt-6 px-6 py-2 bg-muted text-foreground rounded-full hover:bg-muted/80 font-medium transition-colors"
                            >
                                Clear all filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {Object.keys(itemsByCategory).map((categoryName) => {
                            const items = itemsByCategory[categoryName];
                            const isExpanded = expandedCategories.has(categoryName);
                            const categoryObj = sortedCategories.find((c) => c.name === categoryName);
                            
                            return (
                                <div key={categoryName} className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border">
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => toggleCategory(categoryName)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault();
                                                toggleCategory(categoryName);
                                            }
                                        }}
                                        className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-bold text-foreground">{categoryName}</h3>
                                            <span className="px-2 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full">
                                                {items.length} {items.length === 1 ? 'item' : 'items'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {categoryObj && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openDeleteCategoryDialog(categoryObj);
                                                    }}
                                                    className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                                                    title="Delete category"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                            {isExpanded ? (
                                                <ChevronUp className="w-5 h-5 text-muted-foreground" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                            )}
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="border-t border-border">
                                            {items.map((item) => {
                                                const hidden = item.isHidden || isItemHidden(item._id);

                                                return (
                                                    <div
                                                        key={item._id}
                                                        className={`group relative border-b border-border last:border-b-0 transition-all duration-300 hover:bg-muted ${hidden && selectedLocation
                                                            ? "opacity-80"
                                                            : ""
                                                            }`}
                                                    >
                                                        <div className="flex items-center p-4 gap-5">
                                                            <div className="w-20 h-20 rounded-xl bg-muted overflow-hidden flex-shrink-0 relative group-hover:ring-2 ring-primary/20 transition-all">
                                                                {item.image?.url ? (
                                                                    <img src={item.image.url} alt={item.name} className={`w-full h-full object-cover ${hidden && selectedLocation ? 'grayscale' : ''}`} />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground"><ChefHat className="w-8 h-8" /></div>
                                                                )}

                                                                {hidden && selectedLocation && (
                                                                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}>
                                                                        <EyeOff className="w-6 h-6 text-white" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-3">
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <h3 className="font-bold text-foreground truncate text-lg">{item.name}</h3>
                                                                        {!item.isGlobal && (
                                                                            <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground rounded-md shadow-sm">
                                                                                Loc
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-sm text-primary font-semibold truncate">{item.category}</p>
                                                                    <p className="text-xs text-muted-foreground truncate mt-1 font-medium">{item.description || "No description"}</p>
                                                                </div>

                                                                <div className="flex items-center justify-end gap-3 md:ml-auto w-full md:w-auto">
                                                                    <span className="font-bold text-xl text-foreground whitespace-nowrap">
                                                                        {inrFormatter.format(Number(item.price) || 0)}
                                                                    </span>

                                                                    {item.isGlobal && (
                                                                        <button
                                                                            onClick={() => {
                                                                                if (!selectedLocation) {
                                                                                    toast.error("Please select a location first");
                                                                                    return;
                                                                                }
                                                                                hidden ? handleShowItem(item._id) : handleHideItem(item._id);
                                                                            }}
                                                                            className={`p-2 rounded-lg transition-colors ${hidden && selectedLocation
                                                                                ? "bg-emerald-500 text-white hover:bg-emerald-600"
                                                                                : "bg-amber-500 text-white hover:bg-amber-600"
                                                                                } ${!selectedLocation ? "opacity-60" : ""}`}
                                                                            title={hidden && selectedLocation ? "Unhide" : "Hide"}
                                                                        >
                                                                            {hidden && selectedLocation ? (
                                                                                <Eye className="w-4 h-4" />
                                                                            ) : (
                                                                                <EyeOff className="w-4 h-4" />
                                                                            )}
                                                                        </button>
                                                                    )}

                                                                    <div className="flex items-center gap-1">
                                                                        <button onClick={() => openEditItem(item)} className="p-2 hover:bg-muted rounded-lg text-primary hover:text-primary/80 transition-colors"><Edit className="w-4 h-4" /></button>
                                                                        <button onClick={() => openDeleteDialog(item)} className="p-2 hover:bg-destructive/10 rounded-lg text-destructive hover:text-destructive/80 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {showAddCategory && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border overflow-hidden transform transition-all scale-100">
                        <div className="p-5 border-b border-border flex justify-between items-center bg-muted/50">
                            <div>
                                <h3 className="font-bold text-lg text-foreground">Add Category</h3>
                                <p className="text-xs text-muted-foreground font-medium">Create a new section for your menu</p>
                            </div>
                            <button onClick={() => setShowAddCategory(false)} className="text-muted-foreground hover:text-foreground p-2 hover:bg-muted rounded-full transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="text-xs font-bold text-foreground uppercase mb-2 block tracking-wider">Category Name</label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-muted-foreground font-semibold"
                                    placeholder="e.g. Signature Cocktails"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                                />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowAddCategory(false)} className="flex-1 py-3 rounded-xl font-semibold text-foreground bg-muted hover:bg-muted/80 transition-colors">Cancel</button>
                                <button
                                    onClick={handleAddCategory}
                                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl font-bold shadow-lg transition-all transform active:scale-95"
                                >
                                    Create Category
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {deleteDialog && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border overflow-hidden">
                        <div className="p-5 border-b border-border flex justify-between items-center bg-muted/50">
                            <div>
                                <h3 className="font-bold text-lg text-foreground">Delete Item</h3>
                                <p className="text-xs text-muted-foreground font-medium">This action can’t be undone.</p>
                            </div>
                            <button
                                onClick={() => !isDeleting && setDeleteDialog(null)}
                                className="text-muted-foreground hover:text-foreground p-2 hover:bg-muted rounded-full transition-colors disabled:opacity-50"
                                disabled={isDeleting}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-foreground">
                                Are you sure you want to delete{" "}
                                <span className="font-semibold">{deleteDialog.name}</span>?
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {deleteDialog.isGlobal
                                    ? "This will remove it from your global menu."
                                    : "This will remove it from the selected location only."}
                            </p>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setDeleteDialog(null)}
                                    className="flex-1 py-3 rounded-xl font-semibold text-foreground bg-muted hover:bg-muted/80 transition-colors disabled:opacity-50"
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 py-3 rounded-xl font-bold bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-colors disabled:opacity-50"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {deleteCategoryDialog && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border overflow-hidden">
                        <div className="p-5 border-b border-border flex justify-between items-center bg-muted/50">
                            <div>
                                <h3 className="font-bold text-lg text-foreground">Delete Category</h3>
                                <p className="text-xs text-muted-foreground font-medium">This action can’t be undone.</p>
                            </div>
                            <button
                                onClick={() => !isDeletingCategory && setDeleteCategoryDialog(null)}
                                className="text-muted-foreground hover:text-foreground p-2 hover:bg-muted rounded-full transition-colors disabled:opacity-50"
                                disabled={isDeletingCategory}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-foreground">
                                Are you sure you want to delete{" "}
                                <span className="font-semibold">{deleteCategoryDialog.name}</span>?
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Items inside this category will also be deleted.
                            </p>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setDeleteCategoryDialog(null)}
                                    className="flex-1 py-3 rounded-xl font-semibold text-foreground bg-muted hover:bg-muted/80 transition-colors disabled:opacity-50"
                                    disabled={isDeletingCategory}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDeleteCategory}
                                    className="flex-1 py-3 rounded-xl font-bold bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-colors disabled:opacity-50"
                                    disabled={isDeletingCategory}
                                >
                                    {isDeletingCategory ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {(showAddItem || showEditItem) && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-card w-full max-w-2xl rounded-3xl shadow-2xl border border-border flex flex-col max-h-[90vh] overflow-hidden">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/50">
                            <div>
                                <h3 className="text-xl font-bold text-foreground">{showEditItem ? "Edit Item" : "New Menu Item"}</h3>
                                <p className="text-xs text-muted-foreground mt-1 font-medium">
                                    {selectedLocation && !showEditItem ? `Adding exclusive item to ${selectedLocationData?.locationName}` : "Adding to Global Base Menu"}
                                </p>
                            </div>
                            <button onClick={() => { setShowAddItem(false); setShowEditItem(null); resetItemForm(); }} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="p-8 overflow-y-auto space-y-8 scrollbar-hide">
                            <div className="flex justify-center">
                                <div className="relative group w-full max-w-xs">
                                    <div className={`aspect-video rounded-2xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted transition-colors ${!itemForm.imagePreview && 'hover:bg-muted/80 hover:border-primary cursor-pointer'}`}>
                                        {itemForm.imagePreview ? (
                                            <img src={itemForm.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center text-muted-foreground group-hover:text-primary transition-colors">
                                                <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-60" />
                                                <span className="text-sm font-semibold">Click to upload image</span>
                                                <p className="text-[10px] mt-1 opacity-70 font-medium">JPG, PNG up to 5MB</p>
                                            </div>
                                        )}
                                    </div>
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    {itemForm.imagePreview && (
                                        <button
                                            onClick={(e) => { e.preventDefault(); setItemForm({ ...itemForm, image: null, imagePreview: null }) }}
                                            className="absolute -top-3 -right-3 bg-card text-destructive p-1.5 rounded-full shadow-lg border border-border hover:scale-110 transition-transform"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-foreground tracking-wider">Item Name <span className="text-destructive">*</span></label>
                                    <input
                                        type="text"
                                        value={itemForm.name}
                                        onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none font-semibold placeholder:text-muted-foreground"
                                        placeholder="e.g. Spicy Chicken Wings"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-foreground tracking-wider">Price (₹) <span className="text-destructive">*</span></label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={itemForm.price}
                                        onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none font-semibold placeholder:text-muted-foreground"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold uppercase text-foreground tracking-wider">Category <span className="text-destructive">*</span></label>
                                    <select
                                        value={itemForm.category}
                                        onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none appearance-none font-semibold cursor-pointer"
                                    >
                                        <option value="" className="bg-background text-foreground">Select a Category...</option>
                                        {sortedCategories.map((cat) => (
                                            <option key={cat._id} value={cat.name} className="bg-background text-foreground">{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold uppercase text-foreground tracking-wider">Description</label>
                                    <textarea
                                        rows="3"
                                        value={itemForm.description}
                                        onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none font-semibold placeholder:text-muted-foreground"
                                        placeholder="Describe the dish, ingredients, allergens, etc."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-border bg-muted/50 flex justify-end gap-3 z-10">
                            <button
                                onClick={() => { setShowAddItem(false); setShowEditItem(null); }}
                                className="px-6 py-3 rounded-xl border border-border bg-card text-foreground hover:bg-muted transition-colors font-semibold text-sm shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (showEditItem) handleUpdateItem(showEditItem);
                                    else if (selectedLocation) handleAddLocationItem();
                                    else handleAddItem();
                                }}
                                className="px-8 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all transform active:scale-95 font-bold text-sm flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {showEditItem ? "Save Changes" : "Create Item"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MenuManagement;
