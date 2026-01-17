import React, { useState } from "react";
import { createTicket } from "../../utils/api";
import { toast } from "react-hot-toast";
import { Send, MessageSquare } from "lucide-react";

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
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border bg-muted/30">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-foreground">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Send Message to Admin
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Create a new support ticket or ask a question.
                </p>
            </div>

            <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Subject</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
                                placeholder="Brief summary of your issue"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Priority</label>
                            <select
                                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
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

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Message</label>
                        <textarea
                            required
                            rows={6}
                            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground resize-none"
                            placeholder="Describe your issue or question in detail..."
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition-colors shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <Send className="w-4 h-4" />
                            {loading ? "Sending..." : "Send Message"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTicket;
