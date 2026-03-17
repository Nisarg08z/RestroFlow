import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, QrCode, ChefHat, BarChart3 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const HeroSection = () => {
  const reduceMotion = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const stagger = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.08, delayChildren: 0.06 },
    },
  };

  return (
    <section className="relative overflow-hidden pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-24 right-[-10rem] h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-28 left-[-10rem] h-72 w-72 rounded-full bg-secondary/70 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            className="space-y-8"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/70 border border-border/60 backdrop-blur rounded-full text-sm text-muted-foreground shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary/40 blur-[1px]" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Trusted by 500+ restaurants
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
              The complete platform to{" "}
              <span className="relative text-primary">
                manage your restaurant
                <span aria-hidden className="absolute -bottom-2 left-0 right-0 h-[6px] rounded-full bg-primary/20 blur-[1px]" />
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Transform dining experience with QR code ordering, real-time kitchen displays, smart billing, and powerful
              analytics. All in one seamless platform.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
              <Link to="/#video">
                <motion.button
                  whileHover={reduceMotion ? undefined : { y: -1 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-colors flex items-center justify-center gap-2 text-base shadow-sm"
                >
                  Get a Demo
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
              <Link to="#how-it-works">
                <motion.button
                  whileHover={reduceMotion ? undefined : { y: -1 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                  className="border border-border text-foreground px-6 py-3 rounded-lg font-medium hover:bg-secondary/70 transition-colors bg-transparent text-base"
                >
                  See How It Works
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-tr from-primary/10 via-transparent to-primary/5 blur-2xl rounded-[2rem]" aria-hidden />

            <motion.div
              className="grid grid-cols-2 gap-4"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              variants={{
                hidden: {},
                show: {
                  transition: { staggerChildren: 0.08, delayChildren: 0.1 },
                },
              }}
            >
              <div className="space-y-4">
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: reduceMotion ? 0 : 14 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
                  }}
                  whileHover={reduceMotion ? undefined : { y: -4 }}
                  className="bg-card/80 backdrop-blur border border-border/70 rounded-2xl p-6 hover:border-primary/40 transition-colors shadow-sm"
                >
                  <QrCode className="w-10 h-10 text-primary mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">QR Ordering</h3>
                  <p className="text-sm text-muted-foreground">Customers scan & order directly from their table</p>
                </motion.div>
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: reduceMotion ? 0 : 14 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
                  }}
                  whileHover={reduceMotion ? undefined : { y: -4 }}
                  className="bg-card/80 backdrop-blur border border-border/70 rounded-2xl p-6 hover:border-primary/40 transition-colors shadow-sm"
                >
                  <BarChart3 className="w-10 h-10 text-primary mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">Analytics</h3>
                  <p className="text-sm text-muted-foreground">Real-time reports and insights</p>
                </motion.div>
              </div>
              <div className="space-y-4 mt-8">
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: reduceMotion ? 0 : 14 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
                  }}
                  whileHover={reduceMotion ? undefined : { y: -4 }}
                  className="bg-card/80 backdrop-blur border border-border/70 rounded-2xl p-6 hover:border-primary/40 transition-colors shadow-sm"
                >
                  <ChefHat className="w-10 h-10 text-primary mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">Kitchen Display</h3>
                  <p className="text-sm text-muted-foreground">Live order queue for chefs</p>
                </motion.div>
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: reduceMotion ? 0 : 14 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
                  }}
                  whileHover={reduceMotion ? undefined : { y: -4 }}
                  className="relative overflow-hidden bg-primary/10 border border-primary/30 rounded-2xl p-6 shadow-sm"
                >
                  <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/20 blur-2xl" />
                  <div className="relative text-3xl font-bold text-primary mb-1">98%</div>
                  <p className="relative text-sm text-muted-foreground">Faster order processing</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
