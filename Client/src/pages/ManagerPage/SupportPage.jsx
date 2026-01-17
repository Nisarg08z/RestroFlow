import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ManagerHeader, CreateTicket, TicketList } from "../../components/ManagerPageComponents";
import { getCurrentRestaurant } from "../../utils/api";

const SupportPage = () => {
    const navigate = useNavigate();
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

    return (
        <div className="min-h-screen bg-background">
            <ManagerHeader restaurant={restaurant} />

            <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="space-y-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-2 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back
                    </button>
                    <h1 className="text-3xl font-bold text-foreground">Support Center</h1>
                    <p className="text-muted-foreground text-lg">
                        Send messages to admin and track your support tokens.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <CreateTicket onSuccess={handleTicketCreated} />
                    </div>

                    <div className="space-y-6">
                        <TicketList refreshTrigger={refreshTrigger} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportPage;
