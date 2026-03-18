import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, LogIn, Mail, ShieldCheck } from 'lucide-react';
import { Button } from './ui-components';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-[#213448]/60 backdrop-blur-md z-[100]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[101] px-6"
                    >
                        <div className="bg-white rounded-[44px] shadow-2xl shadow-black/20 overflow-hidden border-2 border-[#213448]/5 relative">
                            {/* Decorative Background Elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#EAE0CF]/30 blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#94B4C1]/10 blur-[60px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                            <div className="p-10 relative z-10">
                                <div className="flex justify-between items-start mb-10">
                                    <div className="p-4 bg-[#213448] text-[#EAE0CF] rounded-3xl shadow-xl shadow-[#213448]/20">
                                        <LogIn size={28} />
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-3 text-[#94B4C1] hover:text-[#213448] hover:bg-[#547792]/5 rounded-2xl transition-all"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="space-y-4 mb-10 text-center">
                                    <h2 className="text-4xl font-black tracking-tighter text-[#213448] uppercase leading-none">
                                        Identity Access
                                    </h2>
                                    <p className="text-xs font-black uppercase tracking-[0.3em] text-[#94B4C1] max-w-[280px] mx-auto leading-relaxed">
                                        Connect your institutional node for secure dispatch protocols
                                    </p>
                                </div>

                                <div className="space-y-6 mb-12">
                                    {[
                                        { icon: ShieldCheck, text: "Authenticated SMTP Handshake" },
                                        { icon: Mail, text: "Native Gmail API Integration" },
                                        { icon: Sparkles, text: "Batch Optimization Protocols" }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-4 group">
                                            <div className="w-10 h-10 rounded-xl bg-[#EAE0CF] flex items-center justify-center text-[#547792] border-2 border-[#547792]/5 transition-all group-hover:bg-[#547792] group-hover:text-[#EAE0CF]">
                                                <item.icon size={18} />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#547792] opacity-80 group-hover:opacity-100 transition-opacity">
                                                {item.text}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    onClick={onLogin}
                                    className="w-full h-20 bg-[#213448] hover:bg-[#547792] text-[#EAE0CF] rounded-[32px] shadow-2xl shadow-[#213448]/20 border-2 border-white/10 group overflow-hidden relative"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-4 font-black uppercase tracking-[0.2em] text-sm">
                                        Google Authorization <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </Button>

                                <div className="mt-8 flex justify-center gap-6">
                                    <a href="/privacy" target="_blank" className="text-[9px] text-[#94B4C1] font-black uppercase tracking-widest hover:text-[#213448] transition-colors decoration-dotted underline underline-offset-4">Privacy Policy</a>
                                    <a href="/tos" target="_blank" className="text-[9px] text-[#94B4C1] font-black uppercase tracking-widest hover:text-[#213448] transition-colors decoration-dotted underline underline-offset-4">Terms of Service</a>
                                </div>

                                <p className="mt-8 text-[9px] text-[#94B4C1] font-black uppercase tracking-[0.2em] text-center opacity-50">
                                    End-to-End Encryption Enabled • System 2026
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
