import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, CreditCard, Loader2 } from "lucide-react";
import { createLocationPaymentOrder, verifyLocationPaymentAndAdd } from "../../utils/api";
import { toast } from "react-hot-toast";

const PRICE_PER_TABLE = 50;

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
        script.onerror = () => {
            toast.error("Failed to load payment gateway");
        };
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
            [name]: name === "totalTables" ? Math.max(1, parseInt(value) || 1) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!razorpayLoaded || !window.Razorpay) {
            toast.error("Payment gateway is loading. Please wait...");
            return;
        }

        if (!formData.locationName || !formData.address || !formData.city || 
            !formData.state || !formData.zipCode || !formData.phone) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (formData.totalTables < 1) {
            toast.error("Number of tables must be at least 1");
            return;
        }

        setSubmitting(true);

        try {
            const orderRes = await createLocationPaymentOrder({
                totalTables: formData.totalTables
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
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            });

                            if (verifyRes.data?.success) {
                                toast.success("Location added successfully!");
                                onClose();
                                if (onSuccess) {
                                    onSuccess();
                                }
                            }
                        } catch (verifyError) {
                            console.error("Payment verification failed", verifyError);
                            toast.error(
                                verifyError.response?.data?.message || 
                                "Payment verification failed. Please contact support."
                            );
                        } finally {
                            setSubmitting(false);
                        }
                    },
                    prefill: {
                        name: restaurant?.ownerName || restaurant?.restaurantName || "",
                        email: restaurant?.email || "",
                        contact: restaurant?.phone || formData.phone || ""
                    },
                    theme: {
                        color: "#2563eb"
                    },
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
            toast.error(
                error.response?.data?.message || 
                "Failed to initiate payment. Please try again."
            );
            setSubmitting(false);
        }
    };

    const calculatedPrice = (parseInt(formData.totalTables) || 1) * PRICE_PER_TABLE;

    if (!isOpen) return null;

    return createPortal(
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div 
                className="bg-card w-full max-w-2xl rounded-xl border border-border shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 bg-card border-b border-border p-4 sm:p-6 flex items-center justify-between z-10">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Add New Location</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Enter location details and configure subscription
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="p-2 hover:bg-muted rounded-full transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Location Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                name="locationName"
                                value={formData.locationName}
                                onChange={handleInputChange}
                                required
                                placeholder="e.g. Downtown Branch"
                                disabled={submitting}
                                className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-foreground disabled:opacity-50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Phone Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                                placeholder="+1 234 567 8900"
                                disabled={submitting}
                                className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-foreground disabled:opacity-50"
                            />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <label className="text-sm font-medium text-foreground">
                                Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                required
                                placeholder="123 Main St"
                                disabled={submitting}
                                className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-foreground disabled:opacity-50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                City <span className="text-red-500">*</span>
                            </label>
                            <input
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                required
                                placeholder="New York"
                                disabled={submitting}
                                className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-foreground disabled:opacity-50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                State <span className="text-red-500">*</span>
                            </label>
                            <input
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                required
                                placeholder="NY"
                                disabled={submitting}
                                className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-foreground disabled:opacity-50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Zip Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                name="zipCode"
                                value={formData.zipCode}
                                onChange={handleInputChange}
                                required
                                placeholder="10001"
                                disabled={submitting}
                                className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-foreground disabled:opacity-50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Country
                            </label>
                            <input
                                name="country"
                                value={formData.country}
                                onChange={handleInputChange}
                                disabled={submitting}
                                className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-foreground disabled:opacity-50"
                            />
                        </div>
                    </div>

                    <div className="border-t border-border pt-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4">
                            Subscription & Payment
                        </h3>
                        <div className="bg-muted/50 rounded-xl p-4 border border-border space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Number of Tables <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="totalTables"
                                    min="1"
                                    value={formData.totalTables}
                                    onChange={handleInputChange}
                                    required
                                    disabled={submitting}
                                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground disabled:opacity-50"
                                />
                                <p className="text-xs text-muted-foreground">
                                    ₹{PRICE_PER_TABLE} per table / month
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                <span className="font-medium text-foreground">Monthly Cost</span>
                                <span className="text-xl font-bold text-primary">
                                    ₹{calculatedPrice}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="flex-1 px-4 py-2.5 border border-border rounded-xl text-foreground hover:bg-muted font-medium transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !razorpayLoaded}
                            className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 font-medium transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processing...
                                </>
                            ) : !razorpayLoaded ? (
                                "Loading Payment..."
                            ) : (
                                "Confirm & Pay"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default AddLocationModal;
