import {
    QrCode,
    Smartphone,
    Bell,
    Receipt,
    BarChart3,
    Users,
    Clock,
    Shield,
    Zap,
  } from "lucide-react"
  
const FeaturesSection = () => {
    const features = [
      {
        icon: QrCode,
        title: "QR Code Tables",
        description:
          "Unique QR code for each table. Easy setup and instant access to your menu.",
      },
      {
        icon: Smartphone,
        title: "Digital Menu",
        description:
          "Beautiful, mobile-optimized menu with images, descriptions, and pricing.",
      },
      {
        icon: Bell,
        title: "Real-time Notifications",
        description:
          "Instant alerts for new orders, ready dishes, and customer requests.",
      },
      {
        icon: Receipt,
        title: "Smart Billing",
        description:
          "Automatic bill generation with itemized details and payment tracking.",
      },
      {
        icon: BarChart3,
        title: "Analytics Dashboard",
        description:
          "Track sales, popular items, peak hours, and revenue trends.",
      },
      {
        icon: Users,
        title: "Multi-user Access",
        description:
          "Separate dashboards for chef, manager, and admin with role-based access.",
      },
      {
        icon: Clock,
        title: "Order History",
        description:
          "Complete order records with timestamps and customer preferences.",
      },
      {
        icon: Shield,
        title: "Secure & Reliable",
        description:
          "Enterprise-grade security with 99.9% uptime guarantee.",
      },
      {
        icon: Zap,
        title: "Fast Setup",
        description:
          "Get started in minutes. No hardware required, just your existing devices.",
      },
    ]
  
    return (
      <section
        id="features"
        className="py-24 px-4 sm:px-6 lg:px-8 bg-[oklch(0.17_0.005_260)]"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[oklch(0.7_0.18_45)] font-medium mb-4">
              Features
            </p>
  
            <h2 className="text-3xl sm:text-4xl font-bold text-[oklch(0.98_0_0)] mb-4">
              Everything you need to run your restaurant
            </h2>
  
            <p className="text-[oklch(0.65_0_0)] max-w-2xl mx-auto">
              Powerful features designed specifically for modern restaurants
            </p>
          </div>
  
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="
                  bg-[oklch(0.17_0.005_260)]
                  border border-[oklch(0.28_0.005_260)]
                  rounded-2xl p-6
                  transition-all
                  hover:-translate-y-1
                  hover:border-[oklch(0.7_0.18_45)]/50
                "
              >
                <div className="w-12 h-12 bg-[oklch(0.7_0.18_45)]/10 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-[oklch(0.7_0.18_45)]" />
                </div>
  
                <h3 className="text-lg font-semibold text-[oklch(0.98_0_0)] mb-2">
                  {feature.title}
                </h3>
  
                <p className="text-[oklch(0.65_0_0)] text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

export default FeaturesSection;