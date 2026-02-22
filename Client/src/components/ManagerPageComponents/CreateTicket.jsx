import React, { useState } from "react";
import { createTicket } from "../../utils/api";
import { toast } from "react-hot-toast";
import { Send, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const CreateTicket = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        subject: "",
        message: "",
        priority: "MEDIUM",
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await createTicket(formData);
            if (res.data?.success) {
                toast.success("Message sent successfully!");
                setFormData({ subject: "", message: "", priority: "MEDIUM" });
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            console.error("Failed to send message", error);
            toast.error(error.response?.data?.message || "Failed to send message");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-card border border-border/50 rounded-3xl shadow-lg shadow-black/5 overflow-hidden">
            <div className="p-4 sm:p-5 md:p-6 border-b border-border/50 bg-muted/20 backdrop-blur-sm">
                <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-foreground tracking-tight">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                    </div>
                    Send Message to Admin
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2 font-medium">
                    Create a new support ticket or ask a question.
                </p>
            </div>

            <div className="p-4 sm:p-5 md:p-6 space-y-2">
                <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs sm:text-sm font-semibold text-foreground/90 ml-1">Subject <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2.5 bg-background border border-border/60 hover:border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder-muted-foreground shadow-sm text-sm sm:text-base font-medium"
                                placeholder="Brief summary of your issue"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs sm:text-sm font-semibold text-foreground/90 ml-1">Priority</label>
                            <select
                                className="w-full px-4 py-2.5 bg-background border border-border/60 hover:border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm text-sm sm:text-base font-semibold cursor-pointer"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="CRITICAL">Critical</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs sm:text-sm font-semibold text-foreground/90 ml-1">Message <span className="text-red-500">*</span></label>
                        <textarea
                            required
                            rows={6}
                            className="w-full px-4 py-3 bg-background border border-border/60 hover:border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder-muted-foreground shadow-sm text-sm sm:text-base font-medium resize-none custom-scrollbar"
                            placeholder="Describe your issue or question in detail..."
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        />
                    </div>

                    <div className="flex items-center justify-end pt-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto px-6 py-3 text-sm sm:text-base bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 font-bold transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <Send className="w-4 h-4" />
                            <span>{loading ? "Sending..." : "Send Message"}</span>
                        </motion.button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTicket;
