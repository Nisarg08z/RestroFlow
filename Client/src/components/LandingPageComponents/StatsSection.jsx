import React from "react";

const StatsSection = () => {
  const stats = [
    { value: "500+", label: "Restaurants Connected", description: "across the country" },
    { value: "2M+", label: "Orders Processed", description: "every month" },
    { value: "40%", label: "Revenue Increase", description: "on average" },
    { value: "3x", label: "Faster Service", description: "table turnover" },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 border-y border-gray-800 bg-[oklch(0.17_0.005_260)]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center lg:text-left">
              <div className="text-3xl sm:text-4xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-white font-medium">{stat.label}</div>
              <div className="text-sm text-gray-400">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;

