import React from 'react';
import { motion } from 'framer-motion';
import { UtensilsCrossed, ChevronRight } from 'lucide-react';

const MenuItemCard = ({ item, onSelect, inrFormatter }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(item)}
            className="group bg-card border border-border rounded-xl p-4 flex gap-4 hover:shadow-lg transition-all cursor-pointer hover:border-primary/30"
        >
            <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 overflow-hidden rounded-xl bg-muted relative">
                {item.image?.url ? (
                    <img
                        src={item.image.url}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <UtensilsCrossed className="w-10 h-10 text-muted-foreground opacity-30" />
                    </div>
                )}
            </div>

            <div className="flex-1 flex flex-col justify-between min-w-0">
                <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-lg text-foreground truncate">{item.name}</h3>
                        <span className="font-bold text-xl text-foreground whitespace-nowrap flex-shrink-0">
                            {inrFormatter.format(Number(item.price) || 0)}
                        </span>
                    </div>
                    {item.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {item.description}
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-end mt-2">
                    <span className="text-xs font-semibold text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        View Details <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

export default MenuItemCard;
