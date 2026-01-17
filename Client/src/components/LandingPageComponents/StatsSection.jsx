import React from "react";

const StatsSection = () => {
  const stats = [
    { value: "500+", label: "Restaurants Connected", description: "across the country" },
    { value: "2M+", label: "Orders Processed", description: "every month" },
    { value: "40%", label: "Revenue Increase", description: "on average" },
    { value: "3x", label: "Faster Service", description: "table turnover" },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 border-y border-border bg-card">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 gap-8 lg:flex lg:justify-evenly lg:items-start">
          {stats.map((stat, index) => (
            <div key={index} className="text-center lg:text-left flex flex-col justify-center">
              <div className="text-3xl sm:text-4xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-foreground font-medium">{stat.label}</div>
              <div className="text-sm text-muted-foreground">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;

