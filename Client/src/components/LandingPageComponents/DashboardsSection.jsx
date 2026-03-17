import React from "react";
import { Check } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const DashboardsSection = () => {
  const reduceMotion = useReducedMotion();

  const dashboards = [
    {
      title: "Customer App",
      subtitle: "For Diners",
      description: "Scan, browse, and order - all from their smartphone",
      features: [
        "Scan and Connect",
        "Browse Menu",
        "Place Order",
        "Secure Payment",
      ],
      image: "/mobile-app.jpg",
    },
    {
      title: "Chef Dashboard",
      subtitle: "For Kitchen",
      description: "Real-time order display with all the details chefs need",
      features: [
        "Kitchen Display System (KDS)",
        "Order Management",
        "Order Status Control",
        "Menu Availability Control",
        "Smart Notifications",
      ],
      image: "/chef-dashboard.jpg",
    },
    {
      title: "Manager Dashboard",
      subtitle: "For Management",
      description: "Complete control over billing, reports, and operations",
      features: [
        "Location Management",
        "Menu Management",
        "Table and QR Code Management",
        "Billing and Invoicing",
        "Inventory Management",
        "Staff Management",
        "Reports and Analytics",
        "Support System"
      ],
      image: "/restaurant-dashboard.jpg",
    },
    {
      title: "Admin Panel",
      subtitle: "For RestroFlow",
      description: "Oversee all connected restaurants from one place",
      features: [
        "Restaurant Registration Management",
        "Restaurant Status Control",
        "Subscription Management",
        "Support Ticket Handling"
      ],
      image: "/admin-dashboard.jpg",
    },
  ]

  return (
    <section
      id="dashboards"
      className="relative py-24 px-4 sm:px-6 lg:px-8 bg-secondary overflow-hidden"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 left-1/2 h-72 w-[46rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: { opacity: 0, y: reduceMotion ? 0 : 12 },
            show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
          }}
        >
          <p className="text-primary font-medium mb-4">
            Dashboards
          </p>

          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Four powerful dashboards, one platform
          </h2>

          <p className="text-muted-foreground max-w-2xl mx-auto">
            Each user gets a tailored experience designed for their specific role
          </p>
        </motion.div>

        <div className="space-y-24">
          {dashboards.map((dashboard, index) => (
            <motion.div
              key={index}
              className="grid lg:grid-cols-2 gap-12 items-center"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-120px" }}
              variants={{
                hidden: { opacity: 0, y: reduceMotion ? 0 : 16 },
                show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
              }}
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
                <motion.div
                  whileHover={reduceMotion ? undefined : { y: -6 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  className="relative bg-card/80 backdrop-blur border border-border/70 rounded-2xl p-2 hover:border-primary/30 transition-colors overflow-hidden shadow-sm"
                >
                  <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent opacity-60" />
                  <img
                    src={dashboard.image}
                    alt={dashboard.title}
                    className="relative w-full h-auto rounded-xl object-cover"
                    onError={(e) => {
                      console.error(`Failed to load image: ${dashboard.image}`);
                      e.target.style.display = 'none';
                    }}
                  />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default DashboardsSection;