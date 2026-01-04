import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, QrCode, ChefHat, BarChart3 } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[oklch(0.22_0.005_260)] rounded-full text-sm text-gray-300">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              Trusted by 500+ restaurants
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight text-balance">
              The complete platform to{" "}
              <span className="text-orange-500">manage your restaurant</span>
            </h1>

            <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
              Transform dining experience with QR code ordering, real-time kitchen displays, smart billing, and powerful
              analytics. All in one seamless platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/#video">
                <button className="bg-[oklch(0.7_0.18_45)] text-black px-6 py-3 rounded-lg font-medium hover:bg-orange-400 transition-colors flex items-center gap-2 text-base">
                  Get a Demo
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link to="#how-it-works">
                <button className="border border-gray-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors bg-transparent text-base">
                  See How It Works
                </button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-[oklch(0.17_0.005_260)] border border-gray-800 rounded-2xl p-6 hover:border-orange-500/50 transition-colors">
                  <QrCode className="w-10 h-10 text-orange-500 mb-4" />
                  <h3 className="font-semibold text-white mb-2">QR Ordering</h3>
                  <p className="text-sm text-gray-400">Customers scan & order directly from their table</p>
                </div>
                <div className="bg-[oklch(0.17_0.005_260)] border border-gray-800 rounded-2xl p-6 hover:border-orange-500/50 transition-colors">
                  <BarChart3 className="w-10 h-10 text-orange-500 mb-4" />
                  <h3 className="font-semibold text-white mb-2">Analytics</h3>
                  <p className="text-sm text-gray-400">Real-time reports and insights</p>
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="bg-[oklch(0.17_0.005_260)] border border-gray-800 rounded-2xl p-6 hover:border-orange-500/50 transition-colors">
                  <ChefHat className="w-10 h-10 text-orange-500 mb-4" />
                  <h3 className="font-semibold text-white mb-2">Kitchen Display</h3>
                  <p className="text-sm text-gray-400">Live order queue for chefs</p>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-6">
                  <div className="text-3xl font-bold text-orange-500 mb-1">98%</div>
                  <p className="text-sm text-gray-400">Faster order processing</p>
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
