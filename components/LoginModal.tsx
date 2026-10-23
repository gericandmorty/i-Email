import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Lock, Loader2 } from 'lucide-react';
import { Button } from './ui-components';
import { BrandLogo } from './BrandLogo';
import { useScrollLock } from '@/lib/use-scroll-lock';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: () => Promise<void> | void;
    isLoading?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
    isOpen,
    onClose,
    onLogin,
    isLoading: externalLoading = false,
}) => {
    const [internalLoading, setInternalLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const isBusy = externalLoading || internalLoading;

    // Zero-shift body scroll lock
    useScrollLock(isOpen);

    // Reset error when opened
    useEffect(() => {
        if (isOpen) {
            setErrorMessage(null);
            setInternalLoading(false);
        }
    }, [isOpen]);

    // Escape key listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen && !isBusy) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isBusy, onClose]);

    const handleGoogleClick = async () => {
        if (isBusy) return;
        setErrorMessage(null);
        setInternalLoading(true);

        try {
            const maybePromise = onLogin();
            if (maybePromise && typeof maybePromise.then === 'function') {
                await maybePromise;
            }
            onClose();
        } catch (err: any) {
            console.error("Google sign-in error:", err);
            if (
                err?.code === 'auth/popup-closed-by-user' ||
                err?.code === 'auth/cancelled-popup-request'
            ) {
                setInternalLoading(false);
                return;
            }
            setErrorMessage(err?.message || 'Could not complete sign in with Google. Please try again.');
            setInternalLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="login-modal-wrapper"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 z-[120] flex items-center justify-center p-4 isolate"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                >
                    {/* Dark Backdrop Overlay (flicker-free, hardware composited) */}
                    <div
                        className="absolute inset-0 bg-[#04070A]/80 cursor-pointer"
                        onClick={!isBusy ? onClose : undefined}
                        aria-hidden="true"
                    />

                    {/* Modal Dialog Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 6 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative z-10 w-full max-w-md bg-[#161B22] border border-[#30363D] rounded-xl shadow-2xl overflow-hidden"
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#30363D] bg-[#161B22]">
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                                    <BrandLogo size={26} />
                                </div>
                                <h2 id="modal-title" className="text-sm font-semibold text-[#E6EDF3]">
                                    Sign in to iEmail
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                disabled={isBusy}
                                className="p-1 rounded-md text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D] transition-colors disabled:opacity-40"
                                aria-label="Close modal"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-5">
                            <div>
                                <p className="text-xs text-[#8B949E] leading-relaxed">
                                    Connect your Google or Gmail account so your emails are dispatched directly from your authenticated address with zero third-party data retention.
                                </p>
                            </div>

                            <div className="space-y-2.5 bg-[#0D1117] p-3.5 rounded-lg border border-[#30363D]">
                                <div className="flex items-start gap-2.5">
                                    <ShieldCheck size={15} className="text-[#3FB950] shrink-0 mt-0.5" />
                                    <div className="text-xs">
                                        <span className="font-semibold text-[#E6EDF3] block">Safe & Private</span>
                                        <span className="text-[#8B949E] text-[11px]">We never see or save your password.</span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2.5">
                                    <Lock size={15} className="text-[#58A6FF] shrink-0 mt-0.5" />
                                    <div className="text-xs">
                                        <span className="font-semibold text-[#E6EDF3] block">Send Permission Only</span>
                                        <span className="text-[#8B949E] text-[11px]">We only request permission to send messages you author. We cannot read your inbox.</span>
                                    </div>
                                </div>
                            </div>

                            {/* Error Banner if any */}
                            {errorMessage && (
                                <div className="p-2.5 rounded-md bg-[#F85149]/10 border border-[#F85149]/40 text-[#F85149] text-xs leading-relaxed">
                                    {errorMessage}
                                </div>
                            )}

                            {/* Google Sign-in Button */}
                            <Button
                                onClick={handleGoogleClick}
                                disabled={isBusy}
                                className="w-full h-10 bg-white hover:bg-zinc-100 text-[#1F2328] font-medium text-xs rounded-md shadow-sm border border-zinc-300 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-60"
                            >
                                {isBusy ? (
                                    <>
                                        <Loader2 size={15} className="animate-spin text-[#1F2328]" />
                                        <span>Connecting to Google...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        <span>Continue with Google</span>
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-5 py-3 border-t border-[#30363D] bg-[#0D1117] flex items-center justify-between text-[11px] text-[#8B949E]">
                            <span className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#3FB950]" />
                                Verified Google OAuth 2.0
                            </span>
                            <div className="flex gap-3">
                                <a href="/privacy" target="_blank" className="hover:text-[#58A6FF] transition-colors">Privacy</a>
                                <span>•</span>
                                <a href="/tos" target="_blank" className="hover:text-[#58A6FF] transition-colors">Terms</a>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
