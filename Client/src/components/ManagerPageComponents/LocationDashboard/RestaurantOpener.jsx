import React, { useState, useCallback } from "react";
import { Power, AlertCircle, Store, ArrowLeft, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSpring, animated } from "@react-spring/web";



const FloatingParticle = ({ delay, duration, x, y, size }) => (
    <motion.div
        className="absolute rounded-full bg-primary/20"
        style={{ width: size, height: size }}
        initial={{ x, y, opacity: 0, scale: 0 }}
        animate={{
            y: [y, y - 120, y - 200],
            opacity: [0, 0.8, 0],
            scale: [0, 1, 0.5],
        }}
        transition={{
            duration,
            delay,
            repeat: Infinity,
            ease: "easeOut",
        }}
    />
);

const RestaurantOpener = ({ onOpen, locationName, isSubscriptionExpired = false, onBack }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const [showRipple, setShowRipple] = useState(false);

    const [{ scale, rotateZ }, api] = useSpring(() => ({
        scale: 1,
        rotateZ: 0,
        config: { mass: 1, tension: 400, friction: 18 },
    }));

    const [glowSpring] = useSpring(() => ({
        from: { opacity: 0.4 },
        to: async (next) => {
            while (true) {
                await next({ opacity: 0.8, config: { duration: 2000 } });
                await next({ opacity: 0.4, config: { duration: 2000 } });
            }
        },
    }));

    const handleMouseEnter = useCallback(() => {
        if (!isSubscriptionExpired) {
            setIsHovered(true);
            api.start({ scale: 1.08, rotateZ: 2 });
        }
    }, [isSubscriptionExpired, api]);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
        setIsPressed(false);
        api.start({ scale: 1, rotateZ: 0 });
    }, [api]);

    const handleMouseDown = useCallback(() => {
        if (!isSubscriptionExpired) {
            setIsPressed(true);
            api.start({ scale: 0.92, rotateZ: -1 });
        }
    }, [isSubscriptionExpired, api]);

    const handleMouseUp = useCallback(() => {
        if (!isSubscriptionExpired) {
            setIsPressed(false);
            setShowRipple(true);
            api.start({ scale: 1.08, rotateZ: 0 });
            setTimeout(() => setShowRipple(false), 600);
            onOpen();
        }
    }, [isSubscriptionExpired, api, onOpen]);

    const particles = [
        { delay: 0, duration: 4.2, x: 80, y: 0, size: 5.5 },
        { delay: 0.6, duration: 3.8, x: 56.57, y: 56.57, size: 6.2 },
        { delay: 1.2, duration: 4.5, x: 0, y: 80, size: 4.8 },
        { delay: 1.8, duration: 3.5, x: -56.57, y: 56.57, size: 7.0 },
        { delay: 2.4, duration: 4.0, x: -80, y: 0, size: 5.0 },
        { delay: 3.0, duration: 3.6, x: -56.57, y: -56.57, size: 6.8 },
        { delay: 3.6, duration: 4.3, x: 0, y: -80, size: 5.3 },
        { delay: 4.2, duration: 3.9, x: 56.57, y: -56.57, size: 6.5 },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex flex-col items-center justify-center min-h-[85vh] p-4 relative w-full overflow-hidden"
        >
            {/* Ambient background effects */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary/[0.04] blur-3xl"
                    animate={{
                        x: [0, 40, 0],
                        y: [0, -30, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full bg-accent/[0.06] blur-3xl"
                    animate={{
                        x: [0, -40, 0],
                        y: [0, 30, 0],
                        scale: [1.1, 0.9, 1.1],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.02] blur-3xl"
                    animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            {/* Back Button */}
            {onBack && (
                <div className="absolute top-6 left-4 sm:left-10 z-50">
                    <motion.button
                        onClick={onBack}
                        whileHover={{ x: -3 }}
                        whileTap={{ scale: 0.95 }}
                        className="group flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-card/80 hover:bg-card border border-border/60 hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md backdrop-blur-sm"
                    >
                        <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                        <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                            Back to Workspaces
                        </span>
                    </motion.button>
                </div>
            )}

            <div className="text-center space-y-10 max-w-lg mx-auto relative z-10 w-full mt-12 md:mt-0">
                {/* Header Section */}
                <div className="space-y-5">
                    {/* Store Icon with layered glow */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                        className="relative w-24 h-24 md:w-28 md:h-28 mx-auto mb-8"
                    >
                        {/* Outer glow ring */}
                        <motion.div
                            className="absolute inset-0 rounded-full bg-primary/15 blur-xl"
                            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        />
                        {/* Main icon container */}
                        <div className="relative w-full h-full rounded-full bg-gradient-to-br from-primary/15 via-primary/10 to-accent/10 flex items-center justify-center shadow-lg shadow-primary/10 border border-primary/10">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-transparent to-white/10" />
                            <Store className="w-11 h-11 md:w-13 md:h-13 text-primary relative z-10 drop-shadow-sm" />
                        </div>
                    </motion.div>

                    {/* Title with staggered letter reveal */}
                    <motion.h2
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
                        className="text-4xl md:text-6xl font-black text-foreground tracking-tight pb-1"
                    >
                        {locationName}
                    </motion.h2>

                    {/* Subscription expired or description */}
                    {isSubscriptionExpired ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: 0.5, type: "spring" }}
                            className="bg-destructive/10 border border-destructive/25 rounded-2xl p-6 space-y-3 max-w-sm mx-auto shadow-xl shadow-destructive/5 backdrop-blur-md"
                        >
                            <div className="flex items-center justify-center gap-2.5 text-destructive">
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <AlertCircle className="w-6 h-6" />
                                </motion.div>
                                <p className="font-bold text-lg">Subscription Expired</p>
                            </div>
                            <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                                Action Required: Please renew your subscription to resume active management of this location.
                            </p>
                        </motion.div>
                    ) : (
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.7 }}
                            className="text-muted-foreground text-lg md:text-xl font-medium max-w-md mx-auto leading-relaxed"
                        >
                            System is currently offline.{" "}
                            <span className="text-primary font-bold">Power on</span> to access
                            billing, tracking, and management configurations.
                        </motion.p>
                    )}
                </div>

                {/* Interactive Button Area */}
                <div className="relative inline-flex items-center justify-center py-8 w-full">
                    {!isSubscriptionExpired && (
                        <>
                            {/* Floating particles */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                {particles.map((p, i) => (
                                    <FloatingParticle key={i} {...p} />
                                ))}
                            </div>

                            {/* Aura ring 1 - slow expanding */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.6, 2],
                                    opacity: [0.35, 0.12, 0],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeOut",
                                }}
                                className="absolute inset-0 bg-primary/30 rounded-full m-auto w-36 h-36 md:w-48 md:h-48 blur-sm"
                            />
                            {/* Aura ring 2 - offset timing */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.4, 1.8],
                                    opacity: [0.5, 0.15, 0],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeOut",
                                    delay: 1,
                                }}
                                className="absolute inset-0 bg-primary/20 rounded-full m-auto w-36 h-36 md:w-48 md:h-48 blur-md"
                            />
                            {/* Aura ring 3 - accent color */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.3, 1.6],
                                    opacity: [0.3, 0.08, 0],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeOut",
                                    delay: 2,
                                }}
                                className="absolute inset-0 bg-accent/25 rounded-full m-auto w-36 h-36 md:w-48 md:h-48 blur-lg"
                            />
                        </>
                    )}

                    {/* The Main Button */}
                    <animated.div
                        style={{ scale, rotateZ }}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onTouchStart={handleMouseDown}
                        onTouchEnd={handleMouseUp}
                        className={`
              relative z-10 w-40 h-40 md:w-52 md:h-52 rounded-full flex items-center justify-center
              bg-gradient-to-br from-primary via-primary to-accent
              border-[6px] border-background/70 backdrop-blur-xl
              shadow-[0_0_60px_rgba(200,100,30,0.35),0_0_120px_rgba(200,100,30,0.15),inset_0_2px_20px_rgba(255,255,255,0.25)]
              ${isSubscriptionExpired
                                ? "opacity-40 grayscale cursor-not-allowed"
                                : "cursor-pointer hover:shadow-[0_0_80px_rgba(200,100,30,0.5),0_0_160px_rgba(200,100,30,0.2),inset_0_2px_20px_rgba(255,255,255,0.35)]"
                            }
              transition-shadow duration-700
            `}
                    >
                        {/* Inner glass ring */}
                        <div className="absolute inset-3 rounded-full border border-primary-foreground/15" />
                        {/* Inner gradient overlay for depth */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-transparent to-primary-foreground/10" />

                        {/* Click ripple effect */}
                        <AnimatePresence>
                            {showRipple && (
                                <motion.div
                                    className="absolute inset-0 rounded-full border-2 border-primary-foreground/40"
                                    initial={{ scale: 0.8, opacity: 1 }}
                                    animate={{ scale: 1.8, opacity: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.6, ease: "easeOut" }}
                                />
                            )}
                        </AnimatePresence>

                        {/* Animated glow behind icon */}
                        {!isSubscriptionExpired && (
                            <animated.div
                                style={{ opacity: glowSpring.opacity }}
                                className="absolute inset-0 rounded-full bg-primary-foreground/10 blur-md"
                            />
                        )}

                        {/* Power Icon with rotation on hover */}
                        <motion.div
                            animate={isHovered ? { rotate: 90 } : { rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        >
                            <Power
                                className={`w-16 h-16 md:w-20 md:h-20 text-primary-foreground relative z-10 transition-all duration-500 ${isHovered
                                        ? "drop-shadow-[0_0_25px_rgba(255,255,255,0.9)]"
                                        : "drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                                    }`}
                                strokeWidth={isPressed ? 3 : isHovered ? 2.5 : 2}
                            />
                        </motion.div>
                    </animated.div>
                </div>

                {/* Status Indicator */}
                {!isSubscriptionExpired && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
                        className="flex items-center justify-center gap-3 mt-4"
                    >
                        <div className="flex items-center gap-3 bg-card/80 border border-border/50 py-3 px-6 rounded-full backdrop-blur-sm shadow-sm">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary shadow-sm shadow-primary/50"></span>
                            </span>
                            <p className="text-xs md:text-sm uppercase tracking-[0.25em] font-bold text-muted-foreground">
                                Awaiting Initialization
                            </p>
                            <Zap className="w-3.5 h-3.5 text-primary/60" />
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default RestaurantOpener;