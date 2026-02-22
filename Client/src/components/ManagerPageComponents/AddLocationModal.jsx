import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, AlertCircle, MapPin, Store, Phone, Hash, IndianRupee, Map, Globe, ShieldCheck } from "lucide-react";
import { createLocationPaymentOrder, verifyLocationPaymentAndAdd } from "../../utils/api";
import { toast } from "react-hot-toast";
import { isSubscriptionExpired } from "../../utils/subscriptionUtils";
import { motion, AnimatePresence } from "framer-motion";

const PRICE_PER_TABLE = 50;

const backdropVariants = {
    hidden: { opacity: 0, backdropFilter: "blur(0px)" },
    visible: { opacity: 1, backdropFilter: "blur(8px)" },
};

const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 25 }
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        y: -20,
        transition: { duration: 0.2 }
    }
};

const InputField = ({ icon: Icon, label, name, type = "text", placeholder, colSpan = false, min, value, onChange, disabled }) => (
    <div className={`space-y-1.5 ${colSpan ? 'sm:col-span-2' : ''}`}>
        <label className="text-sm font-semibold text-foreground/90 ml-1">
            {label} <span className="text-red-500">*</span>
        </label>
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Icon className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <input
                name={name}
                type={type}
                min={min}
                value={value}
                onChange={onChange}
                required
                placeholder={placeholder}
                disabled={disabled}
                className="w-full pl-11 pr-4 py-2.5 bg-background border border-border/60 hover:border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground placeholder-muted-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            />
        </div>
    </div>
);

const AddLocationModal = ({ isOpen, onClose, restaurant, onSuccess }) => {
    const [submitting, setSubmitting] = useState(false);
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);
    const [formData, setFormData] = useState({
        locationName: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "India",
        phone: "",
        totalTables: 1,
    });

    useEffect(() => {
        if (window.Razorpay) {
            setRazorpayLoaded(true);
            return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => setRazorpayLoaded(true);
        script.onerror = () => toast.error("Failed to load payment gateway");
        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    useEffect(() => {
        if (!isOpen) {
            setFormData({
                locationName: "",
                address: "",
                city: "",
                state: "",
                zipCode: "",
                country: "India",
                phone: "",
                totalTables: 1,
            });
        }
    }, [isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "totalTables" ? (value === "" ? "" : parseInt(value) || "") : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (restaurant && isSubscriptionExpired(restaurant.subscription)) {
            toast.error("Your subscription has expired. Please renew your subscription to add new locations.");
            return;
        }

        if (!razorpayLoaded || !window.Razorpay) {
            toast.error("Payment gateway is loading. Please wait...");
            return;
        }

        if (!formData.locationName || !formData.address || !formData.city ||
            !formData.state || !formData.zipCode || !formData.phone) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (!formData.totalTables || parseInt(formData.totalTables) < 1) {
            toast.error("Number of tables must be at least 1");
            return;
        }

        setSubmitting(true);

        try {
            const orderRes = await createLocationPaymentOrder({
                totalTables: parseInt(formData.totalTables)
            });

            if (orderRes.data?.success) {
                const { orderId, amount, currency } = orderRes.data.data;

                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                    amount: amount * 100,
                    currency: currency,
                    name: "RestroFlow",
                    description: `New Location Subscription - ${formData.locationName}`,
                    order_id: orderId,
                    handler: async function (response) {
                        try {
                            setSubmitting(true);
                            const verifyRes = await verifyLocationPaymentAndAdd({
                                ...formData,
                                totalTables: parseInt(formData.totalTables),
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            });

                            if (verifyRes.data?.success) {
                                toast.success("Location added successfully!");
                                onClose();
                                if (onSuccess) onSuccess();
                            }
                        } catch (verifyError) {
                            console.error("Payment verification failed", verifyError);
                            toast.error(verifyError.response?.data?.message || "Payment verification failed.");
                        } finally {
                            setSubmitting(false);
                        }
                    },
                    prefill: {
                        name: restaurant?.ownerName || restaurant?.restaurantName || "",
                        email: restaurant?.email || "",
                        contact: restaurant?.phone || formData.phone || ""
                    },
                    theme: { color: "#ea580c" }, // Brand primary color
                    modal: {
                        ondismiss: function () {
                            setSubmitting(false);
                        }
                    }
                };

                const razorpay = new window.Razorpay(options);
                razorpay.open();
            }
        } catch (error) {
            console.error("Failed to initiate payment:", error);
            toast.error(error.response?.data?.message || "Failed to initiate payment.");
            setSubmitting(false);
        }
    };

    const calculatedPrice = (parseInt(formData.totalTables) || 1) * PRICE_PER_TABLE;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] grid place-items-center p-4">

                    {/* Backdrop */}
                    <motion.div
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="relative w-full max-w-2xl bg-card rounded-3xl border border-border/50 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-muted/30 border-b border-border/50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-10 backdrop-blur-md">
                            <div>
                                <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
                                    <Store className="w-6 h-6 text-primary" />
                                    Add New Location
                                </h2>
                                <p className="text-sm font-medium text-muted-foreground mt-1 ml-8">
                                    Expand your network and configure seating
                                </p>
                            </div>

                            <button
                                onClick={onClose}
                                disabled={submitting}
                                className="absolute right-6 top-6 p-2 bg-background/50 hover:bg-muted border border-border/50 rounded-full transition-all disabled:opacity-50 hover:rotate-90"
                            >
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="overflow-y-auto scrollbar-thin">
                            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">

                                {restaurant && isSubscriptionExpired(restaurant.subscription) && (
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                                        <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5 animate-pulse" />
                                        <div className="flex-1">
                                            <p className="text-base font-bold text-red-600">Subscription Expired</p>
                                            <p className="text-sm font-medium text-red-500/80 mt-1">
                                                Please renew your primary subscription before adding new operational wings.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Form Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-6">
                                    <InputField icon={Store} label="Location Name" name="locationName" placeholder="e.g. Bandra Branch" value={formData.locationName} onChange={handleInputChange} disabled={submitting} />
                                    <InputField icon={Phone} label="Phone Number" name="phone" type="tel" placeholder="+91 98765 43210" value={formData.phone} onChange={handleInputChange} disabled={submitting} />
                                    <InputField icon={MapPin} label="Street Address" name="address" placeholder="123 Linking Road" colSpan value={formData.address} onChange={handleInputChange} disabled={submitting} />
                                    <InputField icon={Map} label="City" name="city" placeholder="Mumbai" value={formData.city} onChange={handleInputChange} disabled={submitting} />
                                    <InputField icon={Map} label="State / Province" name="state" placeholder="Maharashtra" value={formData.state} onChange={handleInputChange} disabled={submitting} />
                                    <InputField icon={Hash} label="Zip Code" name="zipCode" placeholder="400050" value={formData.zipCode} onChange={handleInputChange} disabled={submitting} />
                                    <InputField icon={Globe} label="Country" name="country" placeholder="India" value={formData.country} onChange={handleInputChange} disabled={submitting} />
                                </div>

                                {/* Subscription Block */}
                                <div className="mt-8 pt-8 border-t border-border/50">
                                    <div className="flex items-center gap-2 mb-4">
                                        <ShieldCheck className="w-5 h-5 text-primary" />
                                        <h3 className="text-lg font-black text-foreground">
                                            Subscription & Capacity
                                        </h3>
                                    </div>

                                    <div className="bg-gradient-to-br from-muted/50 to-background border border-border/80 rounded-3xl p-6 shadow-sm">

                                        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">

                                            <div className="flex-1 space-y-2 w-full">
                                                <label className="text-sm font-bold text-foreground ml-1">
                                                    Total Tables <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative group">
                                                    <input
                                                        type="number"
                                                        name="totalTables"
                                                        min="1"
                                                        value={formData.totalTables}
                                                        onChange={handleInputChange}
                                                        onFocus={(e) => e.target.select()}
                                                        required
                                                        disabled={submitting}
                                                        className="w-full sm:max-w-[200px] px-4 py-3 bg-card border-2 border-border/80 hover:border-primary/50 focus:border-primary rounded-2xl outline-none text-lg font-bold text-foreground transition-all shadow-inner disabled:opacity-50"
                                                    />
                                                </div>
                                                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 ml-1">
                                                    <IndianRupee className="w-3 h-3" />
                                                    {PRICE_PER_TABLE} per table / monthly
                                                </p>
                                            </div>

                                            <div className="h-px sm:h-16 w-full sm:w-px bg-border/80" />

                                            <div className="flex flex-col items-start sm:items-end w-full sm:w-auto">
                                                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">
                                                    Monthly Cost
                                                </span>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-3xl font-black text-primary tracking-tighter">
                                                        ₹{calculatedPrice}
                                                    </span>
                                                    <span className="text-sm font-medium text-muted-foreground">/mo</span>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                                    <button
                                        type="submit"
                                        disabled={submitting || !razorpayLoaded || (restaurant && isSubscriptionExpired(restaurant.subscription))}
                                        className="w-full px-6 py-3.5 bg-primary text-primary-foreground font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Processing Gateway...
                                            </>
                                        ) : !razorpayLoaded ? (
                                            "Initializing Gateway..."
                                        ) : (
                                            "Confirm Setup & Pay"
                                        )}
                                    </button>
                                </div>

                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default AddLocationModal;
