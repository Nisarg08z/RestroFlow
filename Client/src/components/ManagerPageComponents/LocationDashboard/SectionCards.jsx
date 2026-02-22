import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSpring, animated } from "@react-spring/web";
import { ChefHat, UserCog, ArrowRight } from "lucide-react";

const pageVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.92, y: 40 },
    show: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { type: "spring", damping: 25, stiffness: 200 },
    },
};

const TypewriterText = ({ text }) => {
    const [displayText, setDisplayText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (!isDeleting) {
                if (displayText.length < text.length) {
                    setDisplayText(text.slice(0, displayText.length + 1));
                } else {
                    setTimeout(() => setIsDeleting(true), 1500);
                }
            } else {
                if (displayText.length > 0) {
                    setDisplayText(text.slice(0, displayText.length - 1));
                } else {
                    setIsDeleting(false);
                }
            }
        }, isDeleting ? 50 : 100);

        return () => clearTimeout(timeout);
    }, [displayText, isDeleting, text]);

    return (
        <span>
            {displayText}
            <span className="animate-pulse border-r-2 border-primary ml-[2px] pr-1"></span>
        </span>
    );
};

const CardItem = ({ card }) => {
    const [isHovered, setIsHovered] = useState(false);
    const Icon = card.icon;

    const springProps = useSpring({
        scale: isHovered ? 1.03 : 1,
        y: isHovered ? -12 : 0,
        boxShadow: isHovered
            ? "0 40px 80px -20px rgba(0,0,0,0.55)"
            : "0 15px 35px -15px rgba(0,0,0,0.35)",
        config: { mass: 1, tension: 350, friction: 30 },
    });

    return (
        <motion.div variants={itemVariants} className="w-full h-full flex">
            <animated.button
                onClick={card.onClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onFocus={() => setIsHovered(true)}
                onBlur={() => setIsHovered(false)}
                style={{
                    ...springProps,
                    filter: isHovered ? "brightness(1.08)" : "brightness(1)",
                }}
                className={`
          group relative flex flex-col justify-between text-left
          rounded-[2rem] border backdrop-blur-xl
          bg-white/5 dark:bg-white/[0.04]
          p-8 md:p-12 overflow-hidden outline-none
          w-full h-full min-h-[300px] md:min-h-[400px]
          transition-all duration-500
          hover:shadow-2xl hover:shadow-black/40
          focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
          ${card.border} bg-gradient-to-br ${card.gradient}
        `}
            >
                {/* Soft Glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-700">
                    <div
                        className={`absolute -top-10 -left-10 w-40 h-40 rounded-full blur-3xl ${card.iconBg}`}
                    />
                </div>

                {/* Decorative Background Icon */}
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-[0.08] blur-2xl transition-all duration-700 pointer-events-none transform translate-x-8 -translate-y-8">
                    <Icon className={`w-72 h-72 md:w-96 md:h-96 ${card.iconColor}`} />
                </div>

                {/* Top Section */}
                <div className="relative z-10 flex items-start justify-between w-full mb-8">
                    <motion.div
                        whileHover={{ rotate: 8, scale: 1.08 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className={`w-20 h-20 md:w-28 md:h-28 rounded-3xl ${card.iconBg}
            flex items-center justify-center shrink-0 shadow-inner border border-white/10`}
                    >
                        <Icon className={`w-10 h-10 md:w-14 md:h-14 ${card.iconColor}`} />
                    </motion.div>
                </div>

                {/* Bottom Section */}
                <div className="relative z-10 mt-auto">
                    <h3 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground mb-3">
                        {card.label}
                    </h3>
                    <p className="text-base md:text-xl text-muted-foreground font-medium leading-relaxed max-w-md">
                        {card.description}
                    </p>
                </div>

                {/* Bottom Accent Line */}
                <div
                    className={`absolute bottom-0 left-0 h-1.5 w-full ${card.accentColor}
          origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out`}
                />
            </animated.button>
        </motion.div>
    );
};

const SectionCards = ({ locationId }) => {
    const navigate = useNavigate();

    const cards = [
        {
            id: "chef",
            label: "Chef Dashboard",
            description:
                "Manage incoming kitchen orders, start preparations, and mark dishes as served seamlessly.",
            icon: ChefHat,
            gradient: "from-amber-600/10 via-orange-500/5 to-transparent",
            border: "border-amber-500/20 hover:border-amber-500/50",
            iconBg: "bg-amber-500/20",
            iconColor: "text-amber-500",
            accentColor: "bg-gradient-to-r from-amber-500 to-orange-500",
            onClick: () => navigate(`/chef/kitchen/${locationId}`),
        },
        {
            id: "manager",
            label: "Manager Dashboard",
            description:
                "Oversee billing operations, track all active orders, and configure restaurant settings efficiently.",
            icon: UserCog,
            gradient: "from-primary/10 via-primary/5 to-transparent",
            border: "border-primary/20 hover:border-primary/50",
            iconBg: "bg-primary/20",
            iconColor: "text-primary",
            accentColor: "bg-gradient-to-r from-primary to-blue-500",
            onClick: () => navigate(`/manager/${locationId}`),
        },
    ];

    return (
        <motion.div
            variants={pageVariants}
            initial="hidden"
            animate="show"
            className="w-full flex-1 flex flex-col py-6 md:py-10"
        >
            <motion.div variants={itemVariants} className="mb-10 text-center space-y-3 min-h-[48px]">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight flex items-center justify-center h-full min-h-[40px]">
                    <TypewriterText text="Select Your Workspace" />
                </h2>
                <p className="text-muted-foreground">
                    Choose where you want to continue your workflow
                </p>
            </motion.div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 w-full">
                {cards.map((card) => (
                    <CardItem key={card.id} card={card} />
                ))}
            </div>
        </motion.div>
    );
};

export default SectionCards;