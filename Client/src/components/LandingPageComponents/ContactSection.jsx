import { useState } from "react"
import { Mail, Phone, MapPin, Send, CheckCircle, Loader2 } from "lucide-react"
import { submitRestaurantRequest } from "../../utils/api"
import toast from "react-hot-toast"

const ContactSection = () => {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    ownerName: "",
    restaurantName: "",
    email: "",
    phone: "",
    message: "",
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await submitRestaurantRequest({
        restaurantName: formData.restaurantName,
        ownerName: formData.ownerName,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
      })

      toast.success("Request submitted successfully!")
      setIsSubmitted(true)
      setTimeout(() => {
        setIsSubmitted(false)
        setFormData({
          ownerName: "",
          restaurantName: "",
          email: "",
          phone: "",
          message: "",
        })
      }, 5000)
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit request")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section
      id="contact"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-[oklch(0.13_0.005_260)]"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16">

      
          <div>
            <p className="text-[oklch(0.7_0.18_45)] font-medium mb-4">
              Get In Touch
            </p>

            <h2 className="text-3xl sm:text-4xl font-bold text-[oklch(0.98_0_0)] mb-4">
              Ready to transform your restaurant?
            </h2>

            <p className="text-[oklch(0.65_0_0)] mb-8">
              Contact us to get a personalized demo and pricing for your restaurant.
              We&apos;ll show you exactly how RestroFlow can help your business grow.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[oklch(0.7_0.18_45)]/10 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-[oklch(0.7_0.18_45)]" />
                </div>
                <div>
                  <div className="text-[oklch(0.98_0_0)] font-medium">Email Us</div>
                  <a
                    href="mailto:contact@restroflow.com"
                    className="text-[oklch(0.65_0_0)] hover:text-[oklch(0.7_0.18_45)] transition"
                  >
                    contact@restroflow.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[oklch(0.7_0.18_45)]/10 rounded-xl flex items-center justify-center">
                  <Phone className="w-6 h-6 text-[oklch(0.7_0.18_45)]" />
                </div>
                <div>
                  <div className="text-[oklch(0.98_0_0)] font-medium">Call Us</div>
                  <span className="text-[oklch(0.65_0_0)]">+1 (234) 567-890</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[oklch(0.7_0.18_45)]/10 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-[oklch(0.7_0.18_45)]" />
                </div>
                <div>
                  <div className="text-[oklch(0.98_0_0)] font-medium">Location</div>
                  <span className="text-[oklch(0.65_0_0)]">
                    123 Tech Street, San Francisco, CA
                  </span>
                </div>
              </div>
            </div>
          </div>

          
          <div className="bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-2xl p-8">
            {isSubmitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 bg-[oklch(0.7_0.18_45)]/10 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-[oklch(0.7_0.18_45)]" />
                </div>
                <h3 className="text-xl font-semibold text-[oklch(0.98_0_0)] mb-2">
                  Message Sent!
                </h3>
                <p className="text-[oklch(0.65_0_0)]">
                  We&apos;ll get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">

              
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    value={formData.ownerName}
                    onChange={(e) =>
                      setFormData({ ...formData, ownerName: e.target.value })
                    }
                    placeholder="Owner Name"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-[oklch(0.22_0.005_260)] border border-[oklch(0.28_0.005_260)] text-[oklch(0.98_0_0)] placeholder:text-[oklch(0.65_0_0)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.7_0.18_45)]"
                  />

                  <input
                    value={formData.restaurantName}
                    onChange={(e) =>
                      setFormData({ ...formData, restaurantName: e.target.value })
                    }
                    placeholder="Restaurant Name"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-[oklch(0.22_0.005_260)] border border-[oklch(0.28_0.005_260)] text-[oklch(0.98_0_0)] placeholder:text-[oklch(0.65_0_0)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.7_0.18_45)]"
                  />
                </div>

                
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Email Address"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-[oklch(0.22_0.005_260)] border border-[oklch(0.28_0.005_260)] text-[oklch(0.98_0_0)] placeholder:text-[oklch(0.65_0_0)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.7_0.18_45)]"
                />

                
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="Phone Number"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-[oklch(0.22_0.005_260)] border border-[oklch(0.28_0.005_260)] text-[oklch(0.98_0_0)] placeholder:text-[oklch(0.65_0_0)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.7_0.18_45)]"
                />

              
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Tell us about your restaurant..."
                  required
                  className="w-full px-4 py-3 rounded-lg bg-[oklch(0.22_0.005_260)] border border-[oklch(0.28_0.005_260)] text-[oklch(0.98_0_0)] placeholder:text-[oklch(0.65_0_0)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.7_0.18_45)]"
                />

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium bg-[oklch(0.7_0.18_45)] text-[oklch(0.13_0.005_260)] hover:bg-orange-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactSection
