import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';
import { UtensilsCrossed, ChevronRight } from 'lucide-react';

const MenuItemCard = ({ item, onSelect, inrFormatter }) => {
    const cardRef = useRef(null);

    // Spring animation for 3D tilt effect on hover
    const [props, set] = useSpring(() => ({
        xys: [0, 0, 1],
        config: { mass: 5, tension: 350, friction: 40 }
    }));

    const calc = (x, y) => {
        if (!cardRef.current) return [0, 0, 1];
        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        // Sensitivity multipliers
        const rotateX = -(y - centerY) / 15;
        const rotateY = (x - centerX) / 15;
        return [rotateX, rotateY, 1.02]; // scale up slightly
    };

    const trans = (x, y, s) => `perspective(600px) rotateX(${x}deg) rotateY(${y}deg) scale(${s})`;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-full"
        >
            <animated.div
                ref={cardRef}
                onMouseMove={({ clientX: x, clientY: y }) => set({ xys: calc(x, y) })}
                onMouseLeave={() => set({ xys: [0, 0, 1] })}
                style={{ transform: props.xys.to(trans) }}
                onClick={() => onSelect(item)}
                className="group relative bg-card hover:bg-card/80 border border-border/50 rounded-2xl p-4 flex gap-4 backdrop-blur-md shadow-sm hover:shadow-primary/20 transition-all cursor-pointer overflow-hidden"
            >
                {/* Subtle shine effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                <div className="w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0 overflow-hidden rounded-xl bg-muted relative shadow-inner">
                    {item.image?.url ? (
                        <img
                            src={item.image.url}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                            <UtensilsCrossed className="w-10 h-10 text-muted-foreground opacity-30" />
                        </div>
                    )}

                    {/* Optional Item Tag/Badge can go here */}
                </div>

                <div className="flex-1 flex flex-col justify-center min-w-0 pr-2">
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-start gap-2">
                            <h3 className="font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors">
                                {item.name}
                            </h3>
                            <span className="font-bold text-lg text-foreground whitespace-nowrap bg-primary/10 px-2.5 py-1 rounded-lg">
                                {inrFormatter.format(Number(item.price) || 0)}
                            </span>
                        </div>
                        {item.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed opacity-90">
                                {item.description}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-end mt-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                            View Details <ChevronRight className="w-4 h-4 ml-0.5" />
                        </span>
                    </div>
                </div>
            </animated.div>
        </motion.div>
    );
};

export default MenuItemCard;
