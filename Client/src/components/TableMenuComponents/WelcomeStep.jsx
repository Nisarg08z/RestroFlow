import React from 'react';
import { motion } from 'framer-motion';
import { useSpring, animated, config } from '@react-spring/web';
import { ChefHat, ArrowRight } from 'lucide-react';

const WelcomeStep = ({ restaurantName, locationName, onContinue }) => {
    // Spring animation for floating ChefHat
    const hatSpring = useSpring({
        from: { transform: 'translateY(10px) rotate(-10deg) scale(0.9)', opacity: 0 },
        to: { transform: 'translateY(0px) rotate(0deg) scale(1)', opacity: 1 },
        config: config.wobbly,
        delay: 300,
    });

    const buttonSpring = useSpring({
        from: { transform: 'translateY(20px)', opacity: 0 },
        to: { transform: 'translateY(0px)', opacity: 1 },
        config: config.stiff,
        delay: 800,
    });

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden selection:bg-primary/30">
            {/* Dark & Gold luxury atmospheric background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none" />
            <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-[100px] pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-[100px] pointer-events-none transform -translate-x-1/3 translate-y-1/3" />

            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none mix-blend-overlay" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-center space-y-10 relative z-10 w-full max-w-md mx-auto bg-card/60 backdrop-blur-2xl p-10 sm:p-12 rounded-[2.5rem] border border-border/80 shadow-2xl shadow-black/40"
            >
                <animated.div style={hatSpring} className="flex justify-center">
                    <div className="w-28 h-28 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl flex items-center justify-center shadow-inner border border-primary/20 transform rotate-3">
                        <ChefHat className="w-14 h-14 text-primary drop-shadow-md" />
                    </div>
                </animated.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.7 }}
                    className="space-y-4"
                >
                    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                        Welcome to
                    </h1>
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6, duration: 0.6, type: "spring" }}
                        className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary pb-2 uppercase tracking-widest leading-tight"
                    >
                        {restaurantName}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.6 }}
                        className="text-muted-foreground/90 font-medium text-lg mt-4 flex items-center justify-center gap-2"
                    >
                        <span className="w-8 h-[1px] bg-primary/40 block" />
                        {locationName}
                        <span className="w-8 h-[1px] bg-primary/40 block" />
                    </motion.p>
                </motion.div>

                <animated.div style={buttonSpring}>
                    <button
                        onClick={onContinue}
                        className="w-full bg-primary hover:bg-primary/95 text-primary-foreground py-4 sm:py-5 rounded-2xl font-bold text-lg shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-3 active:scale-[0.98] group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] transition-transform" />
                        Explore Menu
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </animated.div>
            </motion.div>
        </div>
    );
};

export default WelcomeStep;
