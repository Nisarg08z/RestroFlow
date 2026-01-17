import React from "react";
import { Check } from "lucide-react";

const DashboardsSection = () => {
  const dashboards = [
    {
      title: "Customer App",
      subtitle: "For Diners",
      description: "Scan, browse, and order - all from their smartphone",
      features: [
        "Instant menu access via QR scan",
        "Beautiful food images & descriptions",
        "Easy customization options",
        "Real-time order status tracking",
        "Digital receipts",
      ],
      image: "/mobile-app.jpg",
    },
    {
      title: "Chef Dashboard",
      subtitle: "For Kitchen",
      description: "Real-time order display with all the details chefs need",
      features: [
        "Live order queue",
        "Table-wise order grouping",
        "Special instructions highlighted",
        "One-click order completion",
        "Kitchen performance metrics",
      ],
      image: "/chef-dashboard.jpg",
    },
    {
      title: "Manager Dashboard",
      subtitle: "For Management",
      description: "Complete control over billing, reports, and operations",
      features: [
        "Instant bill generation",
        "Daily/weekly/monthly reports",
        "Staff performance tracking",
        "Inventory alerts",
        "Revenue analytics",
      ],
      image: "/restaurant-dashboard.jpg",
    },
    {
      title: "Admin Panel",
      subtitle: "For RestroFlow",
      description: "Oversee all connected restaurants from one place",
      features: [
        "All restaurant data overview",
        "Subscription management",
        "Support ticket system",
        "Platform-wide analytics",
        "Restaurant onboarding",
      ],
      image: "/admin-dashboard.jpg",
    },
  ]

  return (
    <section
      id="dashboards"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-secondary"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-primary font-medium mb-4">
            Dashboards
          </p>

          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Four powerful dashboards, one platform
          </h2>

          <p className="text-muted-foreground max-w-2xl mx-auto">
            Each user gets a tailored experience designed for their specific role
          </p>
        </div>

        <div className="space-y-24">
          {dashboards.map((dashboard, index) => (
            <div
              key={index}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                <p className="text-primary font-medium mb-2">
                  {dashboard.subtitle}
                </p>

                <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                  {dashboard.title}
                </h3>

                <p className="text-muted-foreground mb-6">
                  {dashboard.description}
                </p>

                <ul className="space-y-3">
                  {dashboard.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-center gap-3"
                    >
                      <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-primary" />
                      </div>

                      <span className="text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                <div className="bg-card border border-border rounded-2xl p-2 hover:border-primary/30 transition-colors overflow-hidden">
                  <img
                    src={dashboard.image}
                    alt={dashboard.title}
                    className="w-full h-auto rounded-xl object-cover"
                    onError={(e) => {
                      console.error(`Failed to load image: ${dashboard.image}`);
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default DashboardsSection;