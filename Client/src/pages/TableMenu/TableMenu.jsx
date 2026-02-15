import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { UtensilsCrossed } from "lucide-react";

import {
    getPublicMenu,
    sendCustomerOTP,
    verifyCustomerOTP,
    getCustomerOrders,
    addToCustomerOrder,
    submitCustomerOrder,
    removeItemFromCustomerOrder,
    updateCartItemQuantity,
} from "../../utils/api";

import LoadingScreen from "../../components/TableMenuComponents/LoadingScreen";
import ErrorScreen from "../../components/TableMenuComponents/ErrorScreen";
import WelcomeStep from "../../components/TableMenuComponents/WelcomeStep";
import NameStep from "../../components/TableMenuComponents/NameStep";
import PhoneStep from "../../components/TableMenuComponents/PhoneStep";
import OtpStep from "../../components/TableMenuComponents/OtpStep";
import MenuHeader from "../../components/TableMenuComponents/MenuHeader";
import MenuGrid from "../../components/TableMenuComponents/MenuGrid";
import ItemDetailsModal from "../../components/TableMenuComponents/ItemDetailsModal";
import CartDrawer from "../../components/TableMenuComponents/CartDrawer";
import HistoryDrawer from "../../components/TableMenuComponents/HistoryDrawer";

const SESSION_KEY = "restroflow_customer_session";

const getStoredSession = (restaurantId, locationId, tableNumber) => {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (
            parsed.restaurantId === restaurantId &&
            parsed.locationId === locationId &&
            parsed.tableNumber === tableNumber
        ) {
            return parsed;
        }
    } catch (_) { }
    return null;
};

const setStoredSession = (data) => {
    try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(data));
    } catch (_) { }
};

const TableMenu = () => {
    const { restaurantId, locationId, tableNumber } = useParams();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [step, setStep] = useState("welcome");
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [activeCategory, setActiveCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedItem, setSelectedItem] = useState(null);
    const [previousOrders, setPreviousOrders] = useState([]);
    const [addToOrderLoading, setAddToOrderLoading] = useState(false);
    const [submitOrderLoading, setSubmitOrderLoading] = useState(false);
    const [removeFromCartLoading, setRemoveFromCartLoading] = useState(false);
    const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
    const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);

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
        const stored = getStoredSession(restaurantId, locationId, tableNumber);
        if (stored?.phone && stored?.name) {
            setCustomerName(stored.name);
            setCustomerPhone(stored.phone);
            fetchOrdersAndGoToMenu(stored.phone, stored.name);
            return;
        }
        setTimeout(() => setStep("name"), 500);
    };

    const handleNameSubmit = (e) => {
        e.preventDefault();
        if (customerName.trim()) {
            setTimeout(() => setStep("phone"), 500);
        }
    };

    const handlePhoneSubmit = async (e) => {
        e.preventDefault();
        if (!customerName.trim() || !customerPhone.trim()) return;
        setOtpLoading(true);
        try {
            const res = await sendCustomerOTP({
                name: customerName.trim(),
                phone: customerPhone.trim(),
                restaurantId,
                locationId,
                tableNumber,
            });
            if (res.data?.success) {
                setOtpSent(true);
                setStep("otp");
                setOtp("");
                toast.success("OTP sent to your phone!");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send OTP");
        } finally {
            setOtpLoading(false);
        }
    };

    const handleOTPVerify = async (e) => {
        e.preventDefault();
        if (!otp.trim()) return;
        setVerifyLoading(true);
        try {
            const res = await verifyCustomerOTP({
                phone: customerPhone.trim(),
                otp: otp.trim(),
                restaurantId,
                locationId,
                tableNumber,
            });
            if (res.data?.success) {
                setStoredSession({
                    phone: res.data.data.phone,
                    name: res.data.data.name,
                    restaurantId,
                    locationId,
                    tableNumber,
                });
                toast.success("Phone verified!");
                fetchOrdersAndGoToMenu(res.data.data.phone, res.data.data.name);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Invalid OTP");
        } finally {
            setVerifyLoading(false);
        }
    };

    const fetchOrdersAndGoToMenu = async (phone, name) => {
        try {
            const res = await getCustomerOrders(restaurantId, locationId, tableNumber, phone);
            if (res.data?.success && res.data.data?.orders) {
                setPreviousOrders(res.data.data.orders);
                setCustomerName(res.data.data.customerName || name);
                setCustomerPhone(phone);
                setStep("menu");
            } else {
                setCustomerName(name);
                setCustomerPhone(phone);
                setStep("menu");
            }
        } catch (_) {
            setCustomerName(name);
            setCustomerPhone(phone);
            setStep("menu");
        }
    };

    const handleAddToOrder = async (item, quantity = 1, specialInstructions = '') => {
        setAddToOrderLoading(true);
        try {
            const res = await addToCustomerOrder({
                restaurantId,
                locationId,
                tableNumber,
                phone: customerPhone,
                name: customerName,
                items: [
                    {
                        itemId: item._id,
                        name: item.name,
                        price: item.price,
                        quantity,
                        specialInstructions: specialInstructions || undefined,
                    },
                ],
            });
            if (res.data?.success) {
                const updated = res.data.data.order;
                setPreviousOrders((prev) => {
                    const rest = prev.filter((o) => o._id !== updated._id);
                    return [updated, ...rest];
                });
                toast.success("Added to order!");
                setSelectedItem(null);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add to order");
        } finally {
            setAddToOrderLoading(false);
        }
    };

    const handleSubmitOrder = async () => {
        const pending = previousOrders.find((o) => o.status === "PENDING");
        if (!pending) {
            toast.error("No order in cart");
            return;
        }
        if (!pending.items?.length) {
            toast.error("Your cart is empty. Add items before sending to kitchen.");
            return;
        }
        setSubmitOrderLoading(true);
        try {
            const res = await submitCustomerOrder({
                orderId: pending._id,
                phone: customerPhone,
                restaurantId,
                locationId,
                tableNumber,
            });
            if (res.data?.success) {
                const updated = res.data.data.order;
                setPreviousOrders((prev) =>
                    prev.map((o) => (o._id === updated._id ? updated : o))
                );
                toast.success("Order sent to kitchen!");
                setCartDrawerOpen(false);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send order");
        } finally {
            setSubmitOrderLoading(false);
        }
    };

    const handleRemoveFromCart = async (itemIndex) => {
        const pending = previousOrders.find((o) => o.status === "PENDING");
        if (!pending || !pending._id) return;
        setRemoveFromCartLoading(true);
        try {
            const res = await removeItemFromCustomerOrder({
                orderId: pending._id,
                phone: customerPhone,
                restaurantId,
                locationId,
                tableNumber,
                itemIndex,
            });
            if (res.data?.success && res.data.data?.order) {
                const updated = res.data.data.order;
                setPreviousOrders((prev) =>
                    prev.map((o) => (o._id === updated._id ? updated : o))
                );
                toast.success("Item removed from cart");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to remove item");
        } finally {
            setRemoveFromCartLoading(false);
        }
    };

    const handleUpdateQuantity = async (itemIndex, newQuantity) => {
        const pending = previousOrders.find((o) => o.status === "PENDING");
        if (!pending || !pending._id) return;
        setRemoveFromCartLoading(true);
        try {
            const res = await updateCartItemQuantity({
                orderId: pending._id,
                phone: customerPhone,
                restaurantId,
                locationId,
                tableNumber,
                itemIndex,
                quantity: newQuantity,
            });
            if (res.data?.success && res.data.data?.order) {
                const updated = res.data.data.order;
                setPreviousOrders((prev) =>
                    prev.map((o) => (o._id === updated._id ? updated : o))
                );
                if (newQuantity < 1) toast.success("Item removed from cart");
                else toast.success("Quantity updated");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update quantity");
        } finally {
            setRemoveFromCartLoading(false);
        }
    };

    const categories = useMemo(() => {
        if (!data?.categories) return [];
        const sorted = [...data.categories].sort((a, b) => (a.order || 0) - (b.order || 0));
        const seen = new Set();
        return sorted.filter((cat) => {
            const key = (cat.name || "").trim().toLowerCase();
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, [data]);

    const filteredItems = useMemo(() => {
        if (!data?.items) return [];
        let items = [...data.items];

        if (activeCategory !== "all") {
            items = items.filter(
                (item) =>
                    item.category?.toLowerCase() === activeCategory.toLowerCase()
            );
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            items = items.filter(
                (item) =>
                    item.name?.toLowerCase().includes(query) ||
                    item.description?.toLowerCase().includes(query)
            );
        }

        return items;
    }, [data, activeCategory, searchQuery]);

    const groupedItems = useMemo(() => {
        if (activeCategory !== "all" || searchQuery) return null;

        const groups = {};
        categories.forEach((cat) => {
            const catItems = data?.items.filter(
                (item) =>
                    item.category?.toLowerCase() === cat.name?.toLowerCase()
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

    const pendingOrder = previousOrders.find((o) => o.status === "PENDING");
    const cartItemCount = pendingOrder?.items?.reduce((sum, it) => sum + (it.quantity || 1), 0) || 0;

    if (loading) return <LoadingScreen />;
    if (!data) return <ErrorScreen />;

    if (step === "welcome") {
        return (
            <WelcomeStep
                restaurantName={data.restaurantName}
                locationName={data.locationName}
                onContinue={handleWelcomeContinue}
            />
        );
    }

    if (step === "name") {
        return (
            <NameStep
                name={customerName}
                setName={setCustomerName}
                onSubmit={handleNameSubmit}
            />
        );
    }

    if (step === "phone") {
        return (
            <PhoneStep
                phone={customerPhone}
                setPhone={setCustomerPhone}
                onSubmit={handlePhoneSubmit}
                loading={otpLoading}
            />
        );
    }

    if (step === "otp") {
        return (
            <OtpStep
                otp={otp}
                setOtp={setOtp}
                onSubmit={handleOTPVerify}
                onResend={handlePhoneSubmit}
                phone={customerPhone}
                loading={verifyLoading}
                resendLoading={otpLoading}
            />
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <MenuHeader
                data={data}
                tableNumber={tableNumber}
                customerName={customerName}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                categories={categories}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                cartItemCount={cartItemCount}
                onCartClick={() => setCartDrawerOpen(true)}
                onHistoryClick={() => setHistoryDrawerOpen(true)}
            />

            <main className="px-4 py-6 max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-2">
                    <UtensilsCrossed className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-bold text-foreground">Menu</h2>
                </div>

                <MenuGrid
                    groupedItems={groupedItems}
                    filteredItems={filteredItems}
                    setSelectedItem={setSelectedItem}
                    inrFormatter={inrFormatter}
                />
            </main>

            <ItemDetailsModal
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
                onAddToOrder={handleAddToOrder}
                inrFormatter={inrFormatter}
                loading={addToOrderLoading}
            />

            <CartDrawer
                isOpen={cartDrawerOpen}
                onClose={() => setCartDrawerOpen(false)}
                pendingOrder={pendingOrder}
                inrFormatter={inrFormatter}
                onSubmitOrder={handleSubmitOrder}
                submitLoading={submitOrderLoading}
                onRemoveItem={handleRemoveFromCart}
                onUpdateQuantity={handleUpdateQuantity}
                removeLoading={removeFromCartLoading}
            />

            <HistoryDrawer
                isOpen={historyDrawerOpen}
                onClose={() => setHistoryDrawerOpen(false)}
                previousOrders={previousOrders}
                inrFormatter={inrFormatter}
            />
        </div>
    );
};

export default TableMenu;
