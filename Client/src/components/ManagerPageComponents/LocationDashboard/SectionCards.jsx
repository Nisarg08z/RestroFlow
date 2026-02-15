import React from "react";
import { motion } from "framer-motion";
import { ChefHat, UserCog, ChevronRight } from "lucide-react";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.12 },
    },
};

const cardItem = {
    hidden: { opacity: 0, y: 24, scale: 0.96 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", damping: 22, stiffness: 260 },
    },
};

const SectionCards = ({ onSelect }) => {
    const cards = [
        {
            id: "chef",
            label: "Chef",
            description: "Kitchen orders — start preparing & mark served",
            icon: ChefHat,
            gradient: "from-amber-500/20 to-orange-500/10",
            border: "border-amber-500/30 hover:border-amber-500/50",
            iconBg: "bg-amber-500/20",
            iconColor: "text-amber-600",
        },
        {
            id: "manager",
            label: "Manager",
            description: "Billing, orders & settings",
            icon: UserCog,
            gradient: "from-primary/20 to-primary/5",
            border: "border-primary/30 hover:border-primary/50",
            iconBg: "bg-primary/20",
            iconColor: "text-primary",
        },
    ];

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-2xl mx-auto py-8 px-4"
        >
            <p className="text-center text-muted-foreground text-sm mb-8">
                Choose a section to continue
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <motion.button
                            key={card.id}
                            type="button"
                            variants={cardItem}
                            onClick={() => onSelect(card.id)}
                            className={`
                                group relative text-left rounded-2xl border-2 bg-card p-6
                                shadow-lg hover:shadow-xl transition-all duration-300
                                focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2
                                ${card.border} bg-gradient-to-br ${card.gradient}
                            `}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className={`w-14 h-14 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                    <Icon className={`w-7 h-7 ${card.iconColor}`} />
                                </div>
                                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mt-4 mb-1">
                                {card.label}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {card.description}
                            </p>
                        </motion.button>
                    );
                })}
            </div>
        </motion.div>
    );
};

export default SectionCards;
