import { QrCode, Smartphone, ChefHat, CreditCard } from "lucide-react"

const HowItWorksSection = () => {
  const steps = [
    {
      icon: QrCode,
      step: "01",
      title: "Scan QR Code",
      description: "Each table has a unique QR code. Customers simply scan it with their phone.",
    },
    {
      icon: Smartphone,
      step: "02",
      title: "Browse & Order",
      description: "Digital menu appears instantly. Customers browse, customize, and place orders.",
    },
    {
      icon: ChefHat,
      step: "03",
      title: "Kitchen Prepares",
      description: "Orders appear on the chef's dashboard in real-time with all details.",
    },
    {
      icon: CreditCard,
      step: "04",
      title: "Easy Billing",
      description: "Manager generates bills instantly. Digital payments or cash - all tracked.",
    },
  ]

  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-16">
          <p className="text-primary font-medium mb-4">
            How It Works
          </p>

          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            From scan to serve in minutes
          </h2>

          <p className="text-muted-foreground max-w-2xl mx-auto">
            A seamless workflow that connects customers, kitchen, and management
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <div key={index} className="relative">
              <div className="bg-card border border-border rounded-2xl p-6 h-full hover:border-primary/50 transition">

                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-4xl font-bold text-muted/20">
                    {item.step}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {item.title}
                </h3>

                <p className="text-muted-foreground text-sm">
                  {item.description}
                </p>
              </div>

              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-border -translate-y-1/2 z-10" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorksSection;