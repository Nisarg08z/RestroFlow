import React from 'react';
import { motion } from 'framer-motion';
import { useSpring, animated, config } from '@react-spring/web';
import { Phone, ArrowRight } from 'lucide-react';

const OtpStep = ({ otp, setOtp, onSubmit, onResend, onChangeNumber, phone, loading, resendLoading }) => {
    // Spring animation for floating Phone icon
    const iconSpring = useSpring({
        from: { transform: 'translateY(10px) scale(0.9)', opacity: 0 },
        to: { transform: 'translateY(0px) scale(1)', opacity: 1 },
        config: config.wobbly,
        delay: 200,
    });

    const formSpring = useSpring({
        from: { transform: 'translateY(20px)', opacity: 0 },
        to: { transform: 'translateY(0px)', opacity: 1 },
        config: config.stiff,
        delay: 500,
    });

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden selection:bg-primary/30">
            {/* Atmospheric Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none" />
            <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-[120px] pointer-events-none transform -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-[120px] pointer-events-none transform translate-x-1/2 translate-y-1/2" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none mix-blend-overlay" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md space-y-10 relative z-10 bg-card/60 backdrop-blur-2xl p-8 sm:p-12 rounded-[2.5rem] border border-border/80 shadow-2xl shadow-black/40"
            >
                <div className="text-center space-y-5">
                    <animated.div style={iconSpring} className="flex justify-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl flex items-center justify-center shadow-inner border border-primary/20 transform rotate-3">
                            <Phone className="w-12 h-12 text-primary drop-shadow-md" />
                        </div>
                    </animated.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h2 className="text-3xl font-black text-foreground tracking-tight">Enter OTP</h2>
                        <p className="text-muted-foreground/90 font-medium mt-2">
                            We've sent a 6-digit code to <span className="text-foreground tracking-wide font-semibold">{phone}</span>
                        </p>
                    </motion.div>
                </div>

                <animated.form style={formSpring} onSubmit={onSubmit} className="space-y-6">
                    <div className="relative group">
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                            placeholder="000000"
                            autoFocus
                            className="w-full px-5 py-5 bg-background/50 border-2 border-border/80 rounded-2xl text-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground/30 font-bold text-center tracking-[0.5em] backdrop-blur-sm shadow-inner"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={otp.length !== 6 || loading}
                        className="w-full bg-primary hover:bg-primary/95 text-primary-foreground py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] transition-transform" />
                        {loading ? (
                            <>
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin z-10" />
                                <span className="z-10">Verifying...</span>
                            </>
                        ) : (
                            <>
                                <span className="z-10">Verify & View Menu</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform z-10" />
                            </>
                        )}
                    </button>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="flex items-center justify-center gap-4 pt-2"
                    >
                        <button
                            type="button"
                            onClick={onResend}
                            disabled={resendLoading}
                            className="text-primary font-bold text-sm hover:text-primary/80 transition-colors disabled:opacity-50"
                        >
                            Resend OTP
                        </button>
                        {onChangeNumber && (
                            <>
                                <span className="text-muted-foreground/40">•</span>
                                <button
                                    type="button"
                                    onClick={onChangeNumber}
                                    disabled={loading}
                                    className="text-primary font-bold text-sm hover:text-primary/80 transition-colors disabled:opacity-50"
                                >
                                    Change number
                                </button>
                            </>
                        )}
                    </motion.div>
                </animated.form>
            </motion.div>
        </div>
    );
};

export default OtpStep;
