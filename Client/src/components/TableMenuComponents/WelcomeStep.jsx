import React from 'react';
import { motion } from 'framer-motion';
import { ChefHat, ArrowRight } from 'lucide-react';

const WelcomeStep = ({ restaurantName, locationName, onContinue }) => {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
            <div className="absolute top-20 right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-20 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-center space-y-8 relative z-10 max-w-md mx-auto"
            >
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                        delay: 0.2,
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                    }}
                    className="flex justify-center"
                >
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                        <ChefHat className="w-12 h-12 text-primary" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="space-y-4"
                >
                    <h1 className="text-4xl md:text-5xl font-extrabold text-foreground">
                        Welcome to
                    </h1>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                        className="text-3xl md:text-4xl font-bold text-primary"
                    >
                        {restaurantName}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                        className="text-muted-foreground text-lg mt-4"
                    >
                        {locationName}
                    </motion.p>
                </motion.div>

                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.6 }}
                    onClick={onContinue}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-xl font-semibold shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                    Continue
                    <ArrowRight className="w-5 h-5" />
                </motion.button>
            </motion.div>
        </div>
    );
};

export default WelcomeStep;
