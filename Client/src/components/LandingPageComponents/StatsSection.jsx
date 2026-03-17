import React from "react";
import { motion, useReducedMotion } from "framer-motion";

const StatsSection = () => {
  const reduceMotion = useReducedMotion();

  const stats = [
    { value: "500+", label: "Restaurants Connected", description: "across the country" },
    { value: "2M+", label: "Orders Processed", description: "every month" },
    { value: "40%", label: "Revenue Increase", description: "on average" },
    { value: "3x", label: "Faster Service", description: "table turnover" },
  ];

  return (
    <section className="relative py-16 px-4 sm:px-6 lg:px-8 border-y border-border bg-card overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 left-1/2 h-40 w-[36rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="grid grid-cols-2 gap-8 lg:flex lg:justify-evenly lg:items-start"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08, delayChildren: 0.06 } },
          }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: reduceMotion ? 0 : 10 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
              }}
              className="text-center lg:text-left flex flex-col justify-center"
            >
              <div className="text-3xl sm:text-4xl font-bold text-foreground mb-1 tracking-tight">{stat.value}</div>
              <div className="text-foreground font-medium">{stat.label}</div>
              <div className="text-sm text-muted-foreground">{stat.description}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;

