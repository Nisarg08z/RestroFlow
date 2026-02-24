import React from 'react';
import { motion } from 'framer-motion';
import { useSpring, animated, config } from '@react-spring/web';
import { User, ArrowRight } from 'lucide-react';

const NameStep = ({ name, setName, onSubmit }) => {
    // Spring animation for floating User icon
    const iconSpring = useSpring({
        from: { transform: 'translateY(10px) scale(0.9)', opacity: 0 },
        to: { transform: 'translateY(0px) scale(1)', opacity: 1 },
        config: config.wobbly,
        delay: 200,
    });

    const formSpring = useSpring({
        from: { transform: 'translateY(20px)', opacity: 0 },
        to: { transform: 'translateY(0px)', opacity: 1 },
        config: config.stiff,
        delay: 500,
    });

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden selection:bg-primary/30">
            {/* Atmospheric Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none" />
            <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-primary/10 rounded-full blur-[100px] pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-primary/10 rounded-full blur-[100px] pointer-events-none transform -translate-x-1/3 translate-y-1/3" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none mix-blend-overlay" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md space-y-10 relative z-10 bg-card/60 backdrop-blur-2xl p-8 sm:p-12 rounded-[2.5rem] border border-border/80 shadow-2xl shadow-black/40"
            >
                <div className="text-center space-y-5">
                    <animated.div style={iconSpring} className="flex justify-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl flex items-center justify-center shadow-inner border border-primary/20 transform rotate-3">
                            <User className="w-12 h-12 text-primary drop-shadow-md" />
                        </div>
                    </animated.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h2 className="text-3xl font-black text-foreground tracking-tight">What's your name?</h2>
                        <p className="text-muted-foreground/90 font-medium mt-2">
                            We'd love to personalize your experience
                        </p>
                    </motion.div>
                </div>

                <animated.form style={formSpring} onSubmit={onSubmit} className="space-y-6">
                    <div className="relative group">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name"
                            autoFocus
                            className="w-full px-5 py-4 bg-background/50 border-2 border-border/80 rounded-2xl text-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground/60 font-medium backdrop-blur-sm shadow-inner"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!name.trim()}
                        className="w-full bg-primary hover:bg-primary/95 text-primary-foreground py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] transition-transform" />
                        Continue
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </animated.form>
            </motion.div>
        </div>
    );
};

export default NameStep;
