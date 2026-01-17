import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, QrCode, ChefHat, BarChart3 } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-sm text-muted-foreground">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Trusted by 500+ restaurants
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
              The complete platform to{" "}
              <span className="text-primary">manage your restaurant</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Transform dining experience with QR code ordering, real-time kitchen displays, smart billing, and powerful
              analytics. All in one seamless platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/#video">
                <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-colors flex items-center gap-2 text-base">
                  Get a Demo
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link to="#how-it-works">
                <button className="border border-border text-foreground px-6 py-3 rounded-lg font-medium hover:bg-secondary transition-colors bg-transparent text-base">
                  See How It Works
                </button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-colors">
                  <QrCode className="w-10 h-10 text-primary mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">QR Ordering</h3>
                  <p className="text-sm text-muted-foreground">Customers scan & order directly from their table</p>
                </div>
                <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-colors">
                  <BarChart3 className="w-10 h-10 text-primary mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">Analytics</h3>
                  <p className="text-sm text-muted-foreground">Real-time reports and insights</p>
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-colors">
                  <ChefHat className="w-10 h-10 text-primary mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">Kitchen Display</h3>
                  <p className="text-sm text-muted-foreground">Live order queue for chefs</p>
                </div>
                <div className="bg-primary/10 border border-primary/30 rounded-2xl p-6">
                  <div className="text-3xl font-bold text-primary mb-1">98%</div>
                  <p className="text-sm text-muted-foreground">Faster order processing</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
