import React, { useState } from "react";
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  CreditCard,
  Check,
  AlertCircle,
} from "lucide-react";

const AddRestaurant = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    restaurantName: "",
    ownerName: "",
    email: "",
    phone: "",
    plan: "",
    password: "",
    confirmPassword: "",
    notes: "",
    locations: [
      {
        locationName: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "USA",
        phone: "",
        totalTables: "",
      },
    ],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
          country: "USA",
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

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-[oklch(0.98_0_0)] mb-2">
            Restaurant Added Successfully!
          </h2>
          <p className="text-[oklch(0.65_0_0)] mb-6">
            The restaurant account has been created. They can now log in with their credentials.
          </p>
          <div className="p-4 bg-[oklch(0.22_0.005_260)] rounded-lg mb-6 text-left">
            <p className="text-sm text-[oklch(0.65_0_0)] mb-1">Login Credentials Sent To:</p>
            <p className="text-[oklch(0.98_0_0)] font-medium">{formData.email}</p>
          </div>
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({
                restaurantName: "",
                ownerName: "",
                email: "",
                phone: "",
                plan: "",
                password: "",
                confirmPassword: "",
                notes: "",
                locations: [
                  {
                    locationName: "",
                    address: "",
                    city: "",
                    state: "",
                    zipCode: "",
                    country: "USA",
                    phone: "",
                    totalTables: "",
                  },
                ],
              });
            }}
            className="bg-[oklch(0.7_0.18_45)] text-[oklch(0.13_0.005_260)] px-6 py-3 rounded-lg font-medium hover:bg-[oklch(0.7_0.18_45)]/90 transition"
          >
            Add Another Restaurant
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-[oklch(0.7_0.18_45)]/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-[oklch(0.7_0.18_45)]" />
          </div>
          <div>
            <p className="font-medium text-[oklch(0.98_0_0)]">Approval Required</p>
            <p className="text-sm text-[oklch(0.65_0_0)]">
              Restaurants cannot self-register. They must contact you via the landing page form, and after approval,
              you add them here so they can log in.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-2xl">
        <div className="p-6 border-b border-[oklch(0.28_0.005_260)]">
          <h2 className="text-xl font-bold text-[oklch(0.98_0_0)]">Add New Restaurant</h2>
          <p className="text-sm text-[oklch(0.65_0_0)] mt-1">
            Create a new restaurant account after approving their request
          </p>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-[oklch(0.98_0_0)] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[oklch(0.7_0.18_45)]" />
                Restaurant Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-[oklch(0.65_0_0)]">Restaurant Name *</label>
                  <input
                    placeholder="Enter restaurant name"
                    value={formData.restaurantName}
                    onChange={(e) => handleInputChange("restaurantName", e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-[oklch(0.22_0.005_260)] border border-[oklch(0.28_0.005_260)] text-[oklch(0.98_0_0)] placeholder:text-[oklch(0.65_0_0)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.7_0.18_45)]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-[oklch(0.65_0_0)]">Main Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-[oklch(0.65_0_0)]" />
                    <input
                      type="tel"
                      placeholder="+1 555-0123"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      required
                      className="w-full pl-9 pr-4 py-3 rounded-lg bg-[oklch(0.22_0.005_260)] border border-[oklch(0.28_0.005_260)] text-[oklch(0.98_0_0)] placeholder:text-[oklch(0.65_0_0)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.7_0.18_45)]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-[oklch(0.98_0_0)] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[oklch(0.7_0.18_45)]" />
                  Restaurant Locations
                </h3>
                <button
                  type="button"
                  onClick={addLocation}
                  className="text-sm text-[oklch(0.7_0.18_45)] hover:text-[oklch(0.7_0.18_45)]/80 font-medium flex items-center gap-1"
                >
                  + Add Location
                </button>
              </div>
              {formData.locations.map((location, index) => (
                <div key={index} className="p-4 bg-[oklch(0.22_0.005_260)] rounded-lg border border-[oklch(0.28_0.005_260)] space-y-4">
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
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm text-[oklch(0.65_0_0)]">Location Name *</label>
                      <input
                        placeholder="e.g., Downtown Branch, Main Street Location"
                        value={location.locationName}
                        onChange={(e) => handleLocationChange(index, "locationName", e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-lg bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] text-[oklch(0.98_0_0)] placeholder:text-[oklch(0.65_0_0)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.7_0.18_45)]"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm text-[oklch(0.65_0_0)]">Street Address *</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-[oklch(0.65_0_0)]" />
                        <input
                          placeholder="123 Main Street"
                          value={location.address}
                          onChange={(e) => handleLocationChange(index, "address", e.target.value)}
                          required
                          className="w-full pl-9 pr-4 py-3 rounded-lg bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] text-[oklch(0.98_0_0)] placeholder:text-[oklch(0.65_0_0)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.7_0.18_45)]"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-[oklch(0.65_0_0)]">City *</label>
                      <input
                        placeholder="New York"
                        value={location.city}
                        onChange={(e) => handleLocationChange(index, "city", e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-lg bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] text-[oklch(0.98_0_0)] placeholder:text-[oklch(0.65_0_0)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.7_0.18_45)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-[oklch(0.65_0_0)]">State *</label>
                      <input
                        placeholder="NY"
                        value={location.state}
                        onChange={(e) => handleLocationChange(index, "state", e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-lg bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] text-[oklch(0.98_0_0)] placeholder:text-[oklch(0.65_0_0)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.7_0.18_45)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-[oklch(0.65_0_0)]">Zip Code *</label>
                      <input
                        placeholder="10001"
                        value={location.zipCode}
                        onChange={(e) => handleLocationChange(index, "zipCode", e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-lg bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] text-[oklch(0.98_0_0)] placeholder:text-[oklch(0.65_0_0)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.7_0.18_45)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-[oklch(0.65_0_0)]">Country *</label>
                      <input
                        placeholder="USA"
                        value={location.country}
                        onChange={(e) => handleLocationChange(index, "country", e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-lg bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] text-[oklch(0.98_0_0)] placeholder:text-[oklch(0.65_0_0)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.7_0.18_45)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-[oklch(0.65_0_0)]">Location Phone (Optional)</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-[oklch(0.65_0_0)]" />
                        <input
                          type="tel"
                          placeholder="+1 555-0123"
                          value={location.phone}
                          onChange={(e) => handleLocationChange(index, "phone", e.target.value)}
                          className="w-full pl-9 pr-4 py-3 rounded-lg bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] text-[oklch(0.98_0_0)] placeholder:text-[oklch(0.65_0_0)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.7_0.18_45)]"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-[oklch(0.65_0_0)]">Number of Tables *</label>
                      <input
                        type="number"
                        placeholder="e.g., 25"
                        value={location.totalTables}
                        onChange={(e) => handleLocationChange(index, "totalTables", e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-lg bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] text-[oklch(0.98_0_0)] placeholder:text-[oklch(0.65_0_0)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.7_0.18_45)]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-[oklch(0.98_0_0)] flex items-center gap-2">
                <User className="w-4 h-4 text-[oklch(0.7_0.18_45)]" />
                Owner Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-[oklch(0.65_0_0)]">Owner Name *</label>
                  <input
                    placeholder="Full name"
                    value={formData.ownerName}
                    onChange={(e) => handleInputChange("ownerName", e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-[oklch(0.22_0.005_260)] border border-[oklch(0.28_0.005_260)] text-[oklch(0.98_0_0)] placeholder:text-[oklch(0.65_0_0)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.7_0.18_45)]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-[oklch(0.98_0_0)] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[oklch(0.7_0.18_45)]" />
                Login Credentials
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm text-[oklch(0.65_0_0)]">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-[oklch(0.65_0_0)]" />
                    <input
                      type="email"
                      placeholder="restaurant@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                      className="w-full pl-9 pr-4 py-3 rounded-lg bg-[oklch(0.22_0.005_260)] border border-[oklch(0.28_0.005_260)] text-[oklch(0.98_0_0)] placeholder:text-[oklch(0.65_0_0)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.7_0.18_45)]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-[oklch(0.65_0_0)]">Password *</label>
                  <input
                    type="password"
                    placeholder="Create password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-[oklch(0.22_0.005_260)] border border-[oklch(0.28_0.005_260)] text-[oklch(0.98_0_0)] placeholder:text-[oklch(0.65_0_0)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.7_0.18_45)]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-[oklch(0.65_0_0)]">Confirm Password *</label>
                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-[oklch(0.22_0.005_260)] border border-[oklch(0.28_0.005_260)] text-[oklch(0.98_0_0)] placeholder:text-[oklch(0.65_0_0)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.7_0.18_45)]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-[oklch(0.98_0_0)] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[oklch(0.7_0.18_45)]" />
                Subscription Plan
              </h3>
              <div className="space-y-2">
                <label className="text-sm text-[oklch(0.65_0_0)]">Select Plan *</label>
                <select
                  value={formData.plan}
                  onChange={(e) => handleInputChange("plan", e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-[oklch(0.22_0.005_260)] border border-[oklch(0.28_0.005_260)] text-[oklch(0.98_0_0)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.7_0.18_45)]"
                >
                  <option value="">Select a subscription plan</option>
                  <option value="basic">Basic - $49/month (up to 15 tables)</option>
                  <option value="pro">Pro - $99/month (up to 50 tables)</option>
                  <option value="enterprise">Enterprise - $199/month (unlimited)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[oklch(0.65_0_0)]">Admin Notes (Optional)</label>
              <textarea
                placeholder="Any internal notes about this restaurant..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-[oklch(0.22_0.005_260)] border border-[oklch(0.28_0.005_260)] text-[oklch(0.98_0_0)] placeholder:text-[oklch(0.65_0_0)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.7_0.18_45)] resize-none"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-[oklch(0.7_0.18_45)] text-[oklch(0.13_0.005_260)] px-6 py-3 rounded-lg font-medium hover:bg-[oklch(0.7_0.18_45)]/90 transition disabled:opacity-60"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating Account..." : "Create Restaurant Account"}
              </button>
              <button
                type="button"
                className="px-6 py-3 rounded-lg border border-[oklch(0.28_0.005_260)] text-[oklch(0.98_0_0)] hover:bg-[oklch(0.22_0.005_260)] transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddRestaurant;
