import React, { useState } from "react";
import { ManagerHeader, CreateTicket, TicketList, TypewriterText } from "../../components/ManagerPageComponents";
import { getCurrentRestaurant } from "../../utils/api";
import { motion } from "framer-motion";
import { Headset } from "lucide-react";

const SupportPage = () => {
    const [restaurant, setRestaurant] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    React.useEffect(() => {
        getCurrentRestaurant().then(res => {
            if (res.data?.success) setRestaurant(res.data.data);
        }).catch(err => console.error(err));
    }, []);

    const handleTicketCreated = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const titleText = "Support Center";

    return (
        <div className="min-h-screen bg-background">

            <div className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, type: 'spring', stiffness: 300, damping: 30 }}
                    className="space-y-2 mb-4 sm:mb-6 md:mb-8"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 sm:p-2.5 bg-primary/10 rounded-xl">
                            <Headset className="w-6 h-6 sm:w-8 sm:h-8 text-primary/80" />
                        </div>
                        <h1
                            className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center"
                        >
                            <TypewriterText text={titleText} />
                        </h1>
                    </div>
                    <p className="text-muted-foreground text-base sm:text-lg">
                        Send messages to admin and track your support tokens.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1, type: 'spring', stiffness: 300, damping: 30 }}
                        className="space-y-4 sm:space-y-6 lg:sticky lg:top-24 h-fit"
                    >
                        <CreateTicket onSuccess={handleTicketCreated} />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2, type: 'spring', stiffness: 300, damping: 30 }}
                        className="space-y-4 sm:space-y-6"
                    >
                        <TicketList refreshTrigger={refreshTrigger} restaurant={restaurant} />
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default SupportPage;
