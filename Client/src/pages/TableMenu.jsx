import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { getPublicMenu } from "../utils/api";
import {
  Search,
  UtensilsCrossed,
  ChevronRight,
  Sparkles,
  ChefHat,
  ShoppingBag,
  X,
  MapPin,
  User,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TableMenu = () => {
  const { restaurantId, locationId, tableNumber } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [step, setStep] = useState("welcome");
  const [customerName, setCustomerName] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchMenu();
  }, [restaurantId, locationId]);

  const fetchMenu = async () => {
    try {
      const res = await getPublicMenu(restaurantId, locationId);
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch menu", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWelcomeContinue = () => {
    setTimeout(() => setStep("name"), 500);
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (customerName.trim()) {
      setTimeout(() => setStep("menu"), 500);
    }
  };

  const categories = useMemo(() => {
    if (!data?.categories) return [];
    return [...data.categories].sort((a, b) => a.order - b.order);
  }, [data]);

  const filteredItems = useMemo(() => {
    if (!data?.items) return [];
    let items = [...data.items];

    if (activeCategory !== "all") {
      items = items.filter(
        (item) => item.category.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
      );
    }

    return items;
  }, [data, activeCategory, searchQuery]);

  const groupedItems = useMemo(() => {
    if (activeCategory !== "all" || searchQuery) return null;

    const groups = {};
    categories.forEach(cat => {
      const catItems = data?.items.filter(
        item => item.category.toLowerCase() === cat.name.toLowerCase()
      );
      if (catItems?.length > 0) {
        groups[cat.name] = catItems;
      }
    });
    return groups;
  }, [activeCategory, searchQuery, categories, data]);

  const inrFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }),
    []
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse font-medium">Loading Menu...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <UtensilsCrossed className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Menu Not Available</h2>
        <p className="text-muted-foreground">Unable to load the menu at this moment.</p>
      </div>
    );
  }

  if (step === "welcome") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center space-y-8 relative z-10 max-w-md mx-auto"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
            className="flex justify-center"
          >
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
              <ChefHat className="w-12 h-12 text-primary" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground">
              Welcome to
            </h1>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold text-primary"
            >
              {data.restaurantName}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="text-muted-foreground text-lg mt-4"
            >
              {data.locationName}
            </motion.p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            onClick={handleWelcomeContinue}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-xl font-semibold shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (step === "name") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full max-w-md space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center space-y-4"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <User className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-foreground">What's your name?</h2>
            <p className="text-muted-foreground">
              We'd love to personalize your experience
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleNameSubmit}
            className="space-y-6"
          >
            <div>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your name"
                autoFocus
                className="w-full px-4 py-4 bg-background border-2 border-border rounded-xl text-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-muted-foreground font-medium"
                required
              />
            </div>
            <button
              type="submit"
              disabled={!customerName.trim()}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-xl font-semibold shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              View Menu
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 bg-card border-b border-border shadow-sm"
      >
        <div className="px-4 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-foreground truncate">
                {data.restaurantName}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <p className="text-sm text-muted-foreground truncate">
                  {data.locationName}
                </p>
                {tableNumber && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-primary font-semibold">Table {tableNumber}</span>
                  </>
                )}
                {customerName && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-primary font-semibold">Hi, {customerName}!</span>
                  </>
                )}
              </div>
            </div>
            <div className="p-2.5 bg-primary/10 rounded-full flex-shrink-0">
              <ChefHat className="w-6 h-6 text-primary" />
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground"
            />
          </div>

          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveCategory("all")}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeCategory === "all"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    activeCategory === cat.name
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.header>

      <main className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        <AnimatePresence mode="wait">
          {groupedItems ? (
            Object.entries(groupedItems).map(([categoryName, items], index) => (
              <motion.div
                key={categoryName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 sticky top-[180px] bg-background/95 backdrop-blur-sm py-2 -mx-4 px-4 z-20">
                  <h2 className="text-xl font-bold text-foreground">{categoryName}</h2>
                  <span className="px-2.5 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {items.map((item) => (
                    <MenuItemCard key={item._id} item={item} onSelect={setSelectedItem} inrFormatter={inrFormatter} />
                  ))}
                </div>
              </motion.div>
            ))
          ) : filteredItems.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 gap-3"
            >
              {filteredItems.map((item) => (
                <MenuItemCard key={item._id} item={item} onSelect={setSelectedItem} inrFormatter={inrFormatter} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                <Search className="w-10 h-10 text-muted-foreground opacity-50" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No items found</h3>
              <p className="text-sm text-muted-foreground">Try selecting a different category or search term</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-border"
            >
              <div className="relative h-64 bg-muted">
                {selectedItem.image?.url ? (
                  <img
                    src={selectedItem.image.url}
                    alt={selectedItem.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UtensilsCrossed className="w-16 h-16 text-muted-foreground opacity-30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm text-foreground p-2 rounded-full hover:bg-card transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-bold text-foreground">{selectedItem.name}</h3>
                    <p className="text-sm text-primary font-semibold mt-1">{selectedItem.category}</p>
                  </div>
                  <span className="text-2xl font-bold text-foreground whitespace-nowrap">
                    {inrFormatter.format(Number(selectedItem.price) || 0)}
                  </span>
                </div>

                {selectedItem.description && (
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedItem.description}
                  </p>
                )}

                <button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3.5 rounded-xl font-semibold shadow-lg transition-all flex items-center justify-center gap-2 mt-4 active:scale-[0.98]"
                  onClick={() => {
                    setSelectedItem(null);
                  }}
                >
                  <ShoppingBag className="w-5 h-5" />
                  Add to Order
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MenuItemCard = ({ item, onSelect, inrFormatter }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(item)}
      className="group bg-card border border-border rounded-xl p-4 flex gap-4 hover:shadow-lg transition-all cursor-pointer hover:border-primary/30"
    >
      <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 overflow-hidden rounded-xl bg-muted relative">
        {item.image?.url ? (
          <img
            src={item.image.url}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <UtensilsCrossed className="w-10 h-10 text-muted-foreground opacity-30" />
          </div>
        )}
      </div>
        
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div className="space-y-2">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-bold text-lg text-foreground truncate">{item.name}</h3>
            <span className="font-bold text-xl text-foreground whitespace-nowrap flex-shrink-0">
              {inrFormatter.format(Number(item.price) || 0)}
            </span>
          </div>
          {item.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end mt-2">
          <span className="text-xs font-semibold text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            View Details <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default TableMenu;
