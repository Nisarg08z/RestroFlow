import React from 'react';
import { motion } from 'framer-motion';
import { Phone, ArrowRight } from 'lucide-react';

const OtpStep = ({ otp, setOtp, onSubmit, onResend, phone, loading, resendLoading }) => {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md space-y-8"
            >
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <Phone className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold text-foreground">Enter OTP</h2>
                    <p className="text-muted-foreground">
                        We've sent a 6-digit code to {phone}
                    </p>
                </div>

                <form onSubmit={onSubmit} className="space-y-6">
                    <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        placeholder="000000"
                        autoFocus
                        className="w-full px-4 py-4 bg-background border-2 border-border rounded-xl text-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-muted-foreground font-medium text-center tracking-[0.5em]"
                        required
                    />
                    <button
                        type="submit"
                        disabled={otp.length !== 6 || loading}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-xl font-semibold shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                        {loading ? (
                            <>
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            <>
                                Verify & View Menu
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={onResend}
                        disabled={resendLoading}
                        className="w-full text-primary font-semibold text-sm hover:underline"
                    >
                        Resend OTP
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default OtpStep;
