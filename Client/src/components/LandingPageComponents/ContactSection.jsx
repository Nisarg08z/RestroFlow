import { useState } from "react"
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react"

const ContactSection = () => {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    restaurant: "",
    message: "",
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitted(true)
    setTimeout(() => setIsSubmitted(false), 5000)
    setFormData({ name: "", email: "", restaurant: "", message: "" })
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
                  <div className="text-[oklch(0.98_0_0)] font-medium">
                    Email Us
                  </div>
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
                  <div className="text-[oklch(0.98_0_0)] font-medium">
                    Call Us
                  </div>
                  <a
                    href="tel:+1234567890"
                    className="text-[oklch(0.65_0_0)] hover:text-[oklch(0.7_0.18_45)] transition"
                  >
                    +1 (234) 567-890
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[oklch(0.7_0.18_45)]/10 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-[oklch(0.7_0.18_45)]" />
                </div>
                <div>
                  <div className="text-[oklch(0.98_0_0)] font-medium">
                    Location
                  </div>
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

                <div>
                  <label className="block text-sm font-medium text-[oklch(0.98_0_0)] mb-2">
                    Your Name
                  </label>
                  <input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="John Doe"
                    required
                    className="
                      w-full px-4 py-3 rounded-lg
                      bg-[oklch(0.22_0.005_260)]
                      border border-[oklch(0.28_0.005_260)]
                      text-[oklch(0.98_0_0)]
                      placeholder:text-[oklch(0.65_0_0)]
                      focus:outline-none focus:ring-2
                      focus:ring-[oklch(0.7_0.18_45)]
                    "
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[oklch(0.98_0_0)] mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="john@restaurant.com"
                    required
                    className="
                      w-full px-4 py-3 rounded-lg
                      bg-[oklch(0.22_0.005_260)]
                      border border-[oklch(0.28_0.005_260)]
                      text-[oklch(0.98_0_0)]
                      placeholder:text-[oklch(0.65_0_0)]
                      focus:outline-none focus:ring-2
                      focus:ring-[oklch(0.7_0.18_45)]
                    "
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[oklch(0.98_0_0)] mb-2">
                    Restaurant Name
                  </label>
                  <input
                    value={formData.restaurant}
                    onChange={(e) =>
                      setFormData({ ...formData, restaurant: e.target.value })
                    }
                    placeholder="The Great Kitchen"
                    required
                    className="
                      w-full px-4 py-3 rounded-lg
                      bg-[oklch(0.22_0.005_260)]
                      border border-[oklch(0.28_0.005_260)]
                      text-[oklch(0.98_0_0)]
                      placeholder:text-[oklch(0.65_0_0)]
                      focus:outline-none focus:ring-2
                      focus:ring-[oklch(0.7_0.18_45)]
                    "
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[oklch(0.98_0_0)] mb-2">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Tell us about your restaurant..."
                    required
                    className="
                      w-full px-4 py-3 rounded-lg
                      bg-[oklch(0.22_0.005_260)]
                      border border-[oklch(0.28_0.005_260)]
                      text-[oklch(0.98_0_0)]
                      placeholder:text-[oklch(0.65_0_0)]
                      focus:outline-none focus:ring-2
                      focus:ring-[oklch(0.7_0.18_45)]
                    "
                  />
                </div>

                <button
                  type="submit"
                  className="
                    w-full flex items-center justify-center gap-2
                    px-6 py-3 rounded-lg font-medium
                    bg-[oklch(0.7_0.18_45)]
                    text-[oklch(0.13_0.005_260)]
                    hover:bg-orange-400 
                    transition-colors
                  "
                >
                  Send Message
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactSection;