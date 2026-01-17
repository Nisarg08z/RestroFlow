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
      className="py-24 px-4 sm:px-6 lg:px-8 bg-secondary"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-primary font-medium mb-4">
            Features
          </p>

          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Everything you need to run your restaurant
          </h2>

          <p className="text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed specifically for modern restaurants
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="
                  bg-card
                  border border-border
                  rounded-2xl p-6
                  transition-all
                  hover:-translate-y-1
                  hover:border-primary/50
                "
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>

              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>

              <p className="text-muted-foreground text-sm">
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