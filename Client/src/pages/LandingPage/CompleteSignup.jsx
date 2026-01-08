import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  UtensilsCrossed,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Loader2,
  MapPin,
  Phone,
  Plus,
  X,
  CreditCard,
  Calculator,
  ArrowLeft,
} from "lucide-react";
import { verifySignupToken, createPaymentOrder, completeSignup } from "../../utils/api";
import toast from "react-hot-toast";

const CompleteSignup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [step, setStep] = useState("verify");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [requestData, setRequestData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
    gstNumber: "",
    locations: [
      {
        locationName: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "India",
        phone: "",
        totalTables: "",
      },
    ],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid signup link");
      navigate("/");
      return;
    }

    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      setVerifying(true);
      const response = await verifySignupToken(token);
      setRequestData(response.data.data);
      setStep("form");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or expired signup link");
      setStep("error");
    } finally {
      setVerifying(false);
    }
  };

  const handleLocationChange = (index, field, value) => {
    setFormData((prev) => {
      const newLocations = [...prev.locations];
      newLocations[index] = { ...newLocations[index], [field]: value };
      return { ...prev, locations: newLocations };
    });
  };

  const addLocation = () => {
    setFormData((prev) => ({
      ...prev,
      locations: [
        ...prev.locations,
        {
          locationName: "",
          address: "",
          city: "",
          state: "",
          zipCode: "",
          country: "India",
          phone: "",
          totalTables: "",
        },
      ],
    }));
  };

  const removeLocation = (index) => {
    if (formData.locations.length > 1) {
      setFormData((prev) => ({
        ...prev,
        locations: prev.locations.filter((_, i) => i !== index),
      }));
    }
  };

  const calculateTotalTables = () => {
    return formData.locations.reduce((sum, loc) => {
      return sum + (parseInt(loc.totalTables) || 0);
    }, 0);
  };

  const calculatePrice = (tables) => {
    const pricePerTable = 50;
    return tables * pricePerTable;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    formData.locations.forEach((loc, index) => {
      if (!loc.locationName) {
        newErrors[`location_${index}_name`] = "Location name is required";
      }
      if (!loc.address) {
        newErrors[`location_${index}_address`] = "Address is required";
      }
      if (!loc.city) {
        newErrors[`location_${index}_city`] = "City is required";
      }
      if (!loc.state) {
        newErrors[`location_${index}_state`] = "State is required";
      }
      if (!loc.zipCode) {
        newErrors[`location_${index}_zipCode`] = "Zip code is required";
      }
      if (!loc.totalTables || parseInt(loc.totalTables) <= 0) {
        newErrors[`location_${index}_tables`] = "Number of tables is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill all required fields");
      return;
    }

    const totalTables = calculateTotalTables();
    if (totalTables === 0) {
      toast.error("Total tables must be greater than 0");
      return;
    }

    try {
      setLoading(true);
      const response = await createPaymentOrder({
        token,
        locations: formData.locations,
      });
      setPaymentData(response.data.data);
      setStep("payment");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create payment order");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    if (!razorpayLoaded || !window.Razorpay) {
      toast.error("Payment gateway not loaded. Please refresh the page.");
      return;
    }

    const totalTables = calculateTotalTables();
    const monthlyPrice = calculatePrice(totalTables);

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: monthlyPrice * 100,
      currency: "INR",
      name: "RestroFlow",
      description: `Monthly subscription for ${totalTables} tables`,
      order_id: paymentData.orderId,
      handler: async function (response) {
        try {
          setLoading(true);
          await completeSignup({
            token,
            password: formData.password,
            locations: formData.locations,
            gstNumber: formData.gstNumber || undefined,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          setStep("success");
          toast.success("Account created successfully!");
        } catch (error) {
          toast.error(error.response?.data?.message || "Payment verification failed");
        } finally {
          setLoading(false);
        }
      },
      prefill: {
        name: requestData?.ownerName,
        email: requestData?.email,
        contact: requestData?.phone,
      },
      theme: {
        color: "#ff6b35",
      },
      modal: {
        ondismiss: function () {
          toast.error("Payment cancelled");
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[oklch(0.13_0.005_260)] px-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[oklch(0.7_0.18_45)] mx-auto mb-4 animate-spin" />
          <p className="text-[oklch(0.98_0_0)]">Verifying your signup link...</p>
        </div>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[oklch(0.13_0.005_260)] px-4">
        <div className="max-w-md w-full bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-2xl p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[oklch(0.98_0_0)] mb-2">
            Invalid Signup Link
          </h1>
          <p className="text-[oklch(0.65_0_0)] mb-6">
            This signup link is invalid or has expired. Please contact support or request a new approval.
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-[oklch(0.7_0.18_45)] text-[oklch(0.13_0.005_260)] rounded-lg font-medium hover:bg-orange-400 transition-colors"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[oklch(0.13_0.005_260)] px-4">
        <div className="max-w-md w-full bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-2xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[oklch(0.98_0_0)] mb-2">
            Account Created Successfully!
          </h1>
          <p className="text-[oklch(0.65_0_0)] mb-6">
            Your RestroFlow account has been created and payment is confirmed. You can now log in and start using the platform.
          </p>
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-[oklch(0.7_0.18_45)] text-[oklch(0.13_0.005_260)] rounded-lg font-medium hover:bg-orange-400 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const totalTables = calculateTotalTables();
  const monthlyPrice = calculatePrice(totalTables);

  return (
    <div className="min-h-screen bg-[oklch(0.13_0.005_260)] px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[oklch(0.65_0_0)] hover:text-[oklch(0.98_0_0)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-[oklch(0.7_0.18_45)] rounded-lg flex items-center justify-center">
              <UtensilsCrossed className="w-6 h-6 text-[oklch(0.13_0.005_260)]" />
            </div>
            <span className="text-2xl font-bold text-[oklch(0.98_0_0)]">RestroFlow</span>
          </Link>
          <h1 className="text-3xl font-bold text-[oklch(0.98_0_0)] mb-2">
            Complete Your Signup
          </h1>
          <p className="text-[oklch(0.65_0_0)]">
            Welcome, {requestData?.restaurantName}! Set up your account and locations.
          </p>
        </div>

        {step === "form" && (
          <div className="bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-2xl p-8">
            <form onSubmit={handleFormSubmit} className="space-y-6">    
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[oklch(0.98_0_0)]">
                  Set Password
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[oklch(0.98_0_0)] mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        placeholder="Enter your password"
                        required
                        className="w-full px-4 py-3 pr-10 rounded-lg bg-[oklch(0.22_0.005_260)] border border-[oklch(0.28_0.005_260)] text-[oklch(0.98_0_0)] placeholder:text-[oklch(0.65_0_0)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.7_0.18_45)]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[oklch(0.65_0_0)] hover:text-[oklch(0.98_0_0)]"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[oklch(0.98_0_0)] mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({ ...formData, confirmPassword: e.target.value })
                        }
                        placeholder="Confirm your password"
                        required
                        className="w-full px-4 py-3 pr-10 rounded-lg bg-[oklch(0.22_0.005_260)] border border-[oklch(0.28_0.005_260)] text-[oklch(0.98_0_0)] placeholder:text-[oklch(0.65_0_0)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.7_0.18_45)]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[oklch(0.65_0_0)] hover:text-[oklch(0.98_0_0)]"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Locations Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[oklch(0.98_0_0)] flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[oklch(0.7_0.18_45)]" />
                    Restaurant Locations
                  </h3>
                  <button
                    type="button"
                    onClick={addLocation}
                    className="text-sm text-[oklch(0.7_0.18_45)] hover:text-[oklch(0.7_0.18_45)]/80 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Location
                  </button>
                </div>

                {formData.locations.map((location, index) => (
                  <div
                    key={index}
                    className="p-4 bg-[oklch(0.22_0.005_260)] rounded-lg border border-[oklch(0.28_0.005_260)] space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-[oklch(0.98_0_0)]">
                        Location {index + 1}
                      </h4>
                      {formData.locations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLocation(index)}
                          className="text-sm text-red-500 hover:text-red-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm text-[oklch(0.65_0_0)] mb-2">
                          Location Name *
                        </label>
                        <input
                          placeholder="e.g., Main Branch, Downtown Location"
                          value={location.locationName}
                          onChange={(e) =>
                            handleLocationChange(index, "locationName", e.target.value)
                          }
                          required
                          className="w-full px-4 py-3 rounded-lg bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] text-[oklch(0.98_0_0)] placeholder:text-[oklch(0.65_0_0)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.7_0.18_45)]"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm text-[oklch(0.65_0_0)] mb-2">
                          Street Address *
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 w-4 h-4 text-[oklch(0.65_0_0)]" />
                          <input
                            placeholder="123 Main Street"
                            value={location.address}
                            onChange={(e) =>
                              handleLocationChange(index, "address", e.target.value)
                            }
                            required
                            className="w-full pl-9 pr-4 py-3 rounded-lg bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] text-[oklch(0.98_0_0)] placeholder:text-[oklch(0.65_0_0)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.7_0.18_45)]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-[oklch(0.65_0_0)] mb-2">City *</label>
                        <input
                          placeholder="Mumbai"
                          value={location.city}
                          onChange={(e) =>
                            handleLocationChange(index, "city", e.target.value)
                          }
                          required
                          className="w-full px-4 py-3 rounded-lg bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] text-[oklch(0.98_0_0)] placeholder:text-[oklch(0.65_0_0)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.7_0.18_45)]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-[oklch(0.65_0_0)] mb-2">State *</label>
                        <input
                          placeholder="Maharashtra"
                          value={location.state}
                          onChange={(e) =>
                            handleLocationChange(index, "state", e.target.value)
                          }
                          required
                          className="w-full px-4 py-3 rounded-lg bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] text-[oklch(0.98_0_0)] placeholder:text-[oklch(0.65_0_0)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.7_0.18_45)]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-[oklch(0.65_0_0)] mb-2">
                          Zip Code *
                        </label>
                        <input
                          placeholder="400001"
                          value={location.zipCode}
                          onChange={(e) =>
                            handleLocationChange(index, "zipCode", e.target.value)
                          }
                          required
                          className="w-full px-4 py-3 rounded-lg bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] text-[oklch(0.98_0_0)] placeholder:text-[oklch(0.65_0_0)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.7_0.18_45)]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-[oklch(0.65_0_0)] mb-2">Country *</label>
                        <input
                          placeholder="India"
                          value={location.country}
                          onChange={(e) =>
                            handleLocationChange(index, "country", e.target.value)
                          }
                          required
                          className="w-full px-4 py-3 rounded-lg bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] text-[oklch(0.98_0_0)] placeholder:text-[oklch(0.65_0_0)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.7_0.18_45)]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-[oklch(0.65_0_0)] mb-2">
                          Location Phone
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 w-4 h-4 text-[oklch(0.65_0_0)]" />
                          <input
                            type="tel"
                            placeholder="+91 9876543210"
                            value={location.phone}
                            onChange={(e) =>
                              handleLocationChange(index, "phone", e.target.value)
                            }
                            className="w-full pl-9 pr-4 py-3 rounded-lg bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] text-[oklch(0.98_0_0)] placeholder:text-[oklch(0.65_0_0)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.7_0.18_45)]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-[oklch(0.65_0_0)] mb-2">
                          Number of Tables *
                        </label>
                        <input
                          type="number"
                          placeholder="e.g., 25"
                          value={location.totalTables}
                          onChange={(e) =>
                            handleLocationChange(index, "totalTables", e.target.value)
                          }
                          required
                          min="1"
                          className="w-full px-4 py-3 rounded-lg bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] text-[oklch(0.98_0_0)] placeholder:text-[oklch(0.65_0_0)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.7_0.18_45)]"
                        />
                        {errors[`location_${index}_tables`] && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors[`location_${index}_tables`]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* GST Number */}
              <div>
                <label className="block text-sm font-medium text-[oklch(0.98_0_0)] mb-2">
                  GST Number (Optional)
                </label>
                <input
                  type="text"
                  value={formData.gstNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, gstNumber: e.target.value })
                  }
                  placeholder="Enter GST number"
                  className="w-full px-4 py-3 rounded-lg bg-[oklch(0.22_0.005_260)] border border-[oklch(0.28_0.005_260)] text-[oklch(0.98_0_0)] placeholder:text-[oklch(0.65_0_0)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.7_0.18_45)]"
                />
              </div>

              {/* Price Summary */}
              {totalTables > 0 && (
                <div className="p-4 bg-[oklch(0.22_0.005_260)] rounded-lg border border-[oklch(0.28_0.005_260)]">
                  <div className="flex items-center gap-2 mb-3">
                    <Calculator className="w-5 h-5 text-[oklch(0.7_0.18_45)]" />
                    <h4 className="text-sm font-semibold text-[oklch(0.98_0_0)]">
                      Pricing Summary
                    </h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-[oklch(0.65_0_0)]">
                      <span>Total Tables:</span>
                      <span className="text-[oklch(0.98_0_0)] font-medium">{totalTables}</span>
                    </div>
                    <div className="flex justify-between text-[oklch(0.65_0_0)]">
                      <span>Price per table/month:</span>
                      <span className="text-[oklch(0.98_0_0)] font-medium">₹50</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-[oklch(0.98_0_0)] pt-2 border-t border-[oklch(0.28_0.005_260)]">
                      <span>Monthly Subscription:</span>
                      <span className="text-[oklch(0.7_0.18_45)]">₹{monthlyPrice}</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || totalTables === 0}
                className="w-full py-3 rounded-lg font-medium bg-[oklch(0.7_0.18_45)] hover:bg-orange-400 transition-colors text-[oklch(0.13_0.005_260)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Proceed to Payment
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {step === "payment" && paymentData && (
          <div className="bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-2xl p-8">
            <div className="text-center mb-6">
              <CreditCard className="w-12 h-12 text-[oklch(0.7_0.18_45)] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[oklch(0.98_0_0)] mb-2">
                Complete Payment
              </h2>
              <p className="text-[oklch(0.65_0_0)]">
                Total Amount: <span className="text-[oklch(0.98_0_0)] font-bold text-xl">₹{paymentData.amount}</span>
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-[oklch(0.22_0.005_260)] rounded-lg">
                <p className="text-sm text-[oklch(0.65_0_0)] mb-2">Payment Details:</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[oklch(0.65_0_0)]">Total Tables:</span>
                    <span className="text-[oklch(0.98_0_0)]">{paymentData.totalTables}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[oklch(0.65_0_0)]">Plan:</span>
                    <span className="text-[oklch(0.98_0_0)]">{paymentData.plan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[oklch(0.65_0_0)]">Price per table:</span>
                    <span className="text-[oklch(0.98_0_0)]">₹{paymentData.pricing.pricePerTable}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading || !razorpayLoaded}
                className="w-full py-3 rounded-lg font-medium bg-[oklch(0.7_0.18_45)] hover:bg-orange-400 transition-colors text-[oklch(0.13_0.005_260)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Pay ₹{paymentData.amount}
                  </>
                )}
              </button>

              <button
                onClick={() => setStep("form")}
                className="w-full py-3 rounded-lg font-medium border border-[oklch(0.28_0.005_260)] text-[oklch(0.98_0_0)] hover:bg-[oklch(0.22_0.005_260)] transition-colors"
              >
                Back to Form
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompleteSignup;
