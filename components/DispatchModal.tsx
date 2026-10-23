import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    X,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Paperclip,
    Clock,
    User,
    Check
} from 'lucide-react';
import { Button } from './ui-components';
import { BrandLogo } from './BrandLogo';
import { useScrollLock } from '@/lib/use-scroll-lock';

interface DispatchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSend: () => void;
    isSending: boolean;
    sendingProgress: number;
    totalRecipients: number;
    senderEmail: string;
    delayBetweenEmails: number;
    attachmentsCount: number;
    totalAttachmentKB: number;
    recipientStatuses: Record<number, 'pending' | 'sending' | 'success' | 'error'>;
    data: any[];
    mapping: { email: string; name: string };
    sendError: string | null;
    onClearSendError?: () => void;
    onViewHistory?: () => void;
    isDispatchSuccess?: boolean;
}

export const DispatchModal: React.FC<DispatchModalProps> = ({
    isOpen,
    onClose,
    onSend,
    isSending,
    sendingProgress,
    totalRecipients,
    senderEmail,
    delayBetweenEmails,
    attachmentsCount,
    totalAttachmentKB,
    recipientStatuses,
    data,
    mapping,
    sendError,
    onClearSendError,
    onViewHistory,
    isDispatchSuccess = false,
}) => {
    // Zero-shift body scroll lock
    useScrollLock(isOpen);

    // Escape key listener (disabled during active dispatch)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen && !isSending) {
                if (sendError && onClearSendError) {
                    onClearSendError();
                }
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isSending, sendError, onClose, onClearSendError]);

    // Warn if user tries to close window/tab during sending
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isSending) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isSending]);

    const isCompleted = !isSending && !sendError && (isDispatchSuccess || (sendingProgress >= 100 && Object.keys(recipientStatuses).length > 0));

    // Calculate live counts
    const statusValues = Object.values(recipientStatuses);
    const successCount = statusValues.filter(s => s === 'success').length;
    const errorCount = statusValues.filter(s => s === 'error').length;
    const sentCount = Math.min(totalRecipients, Math.floor((sendingProgress / 100) * totalRecipients));

    // Current recipient in flight
    const currentRecipientIndex = Math.min(
        totalRecipients - 1,
        Math.max(0, Object.keys(recipientStatuses).length)
    );
    const currentRecipientRow = data[currentRecipientIndex] || {};
    const currentRecipientEmail = currentRecipientRow[mapping.email] || '';
    const currentRecipientName = mapping.name ? currentRecipientRow[mapping.name] : '';

    const handleDismiss = () => {
        if (isSending) return;
        if (sendError && onClearSendError) {
            onClearSendError();
        }
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="dispatch-modal-wrapper"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 z-[120] flex items-center justify-center p-4 isolate"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="dispatch-modal-title"
                >
                    {/* Dark Backdrop (flicker-free, hardware composited) */}
                    <div
                        className="absolute inset-0 bg-[#04070A]/80 cursor-pointer"
                        onClick={!isSending ? handleDismiss : undefined}
                        aria-hidden="true"
                    />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 6 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative z-10 w-full max-w-md bg-[#161B22] border border-[#30363D] rounded-xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#30363D] bg-[#161B22]">
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                                    <BrandLogo size={26} />
                                </div>
                                <h3 id="dispatch-modal-title" className="text-sm font-semibold text-[#E6EDF3]">
                                    {isCompleted
                                        ? "Dispatch Completed"
                                        : isSending
                                        ? "Sending Emails..."
                                        : sendError
                                        ? "Dispatch Issue"
                                        : "Confirm Email Dispatch"}
                                </h3>
                            </div>

                            {!isSending && (
                                <button
                                    onClick={handleDismiss}
                                    className="p-1 rounded-md text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D] transition-colors"
                                    aria-label="Close modal"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 space-y-4">
                            {/* STATE 1: ERROR OCCURRED */}
                            {sendError ? (
                                <div className="space-y-4">
                                    <div className="p-3.5 rounded-lg bg-[#F85149]/10 border border-[#F85149]/40 text-[#F85149] flex items-start gap-3">
                                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                        <div className="text-xs space-y-1">
                                            <span className="font-semibold block">Sending halted</span>
                                            <p className="leading-relaxed text-[#E6EDF3]/90">{sendError}</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-2">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={handleDismiss}
                                        >
                                            Close
                                        </Button>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => {
                                                if (onClearSendError) onClearSendError();
                                                onSend();
                                            }}
                                        >
                                            Retry Sending
                                        </Button>
                                    </div>
                                </div>
                            ) : isCompleted ? (
                                /* STATE 2: COMPLETED SUCCESSFULLY */
                                <div className="space-y-4 text-center py-2">
                                    <div className="w-12 h-12 rounded-full bg-[#238636]/15 border border-[#238636]/40 text-[#3FB950] flex items-center justify-center mx-auto shadow-sm">
                                        <Check size={24} />
                                    </div>

                                    <div className="space-y-1">
                                        <h4 className="text-base font-semibold text-[#E6EDF3]">All Emails Dispatched!</h4>
                                        <p className="text-xs text-[#8B949E]">
                                            Successfully processed {totalRecipients} emails through your Gmail account.
                                        </p>
                                    </div>

                                    <div className="bg-[#0D1117] p-3.5 rounded-lg border border-[#30363D] text-xs space-y-2 text-left">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[#8B949E]">Sender Account:</span>
                                            <span className="text-[#E6EDF3] font-mono truncate max-w-[200px]">{senderEmail}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[#8B949E]">Successfully Delivered:</span>
                                            <span className="text-[#3FB950] font-semibold">{successCount || totalRecipients} emails</span>
                                        </div>
                                        {errorCount > 0 && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-[#8B949E]">Delivery Failures:</span>
                                                <span className="text-[#F85149] font-semibold">{errorCount}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        {onViewHistory && (
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => {
                                                    handleDismiss();
                                                    onViewHistory();
                                                }}
                                            >
                                                View History
                                            </Button>
                                        )}
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            className="flex-1"
                                            onClick={handleDismiss}
                                        >
                                            Done
                                        </Button>
                                    </div>
                                </div>
                            ) : isSending ? (
                                /* STATE 3: ACTIVELY DISPATCHING (STREAMING) */
                                <div className="space-y-4 py-1">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-[#58A6FF] font-medium flex items-center gap-1.5">
                                                <Loader2 size={13} className="animate-spin" />
                                                Streaming emails live...
                                            </span>
                                            <span className="text-[#E6EDF3] font-mono font-semibold">
                                                {Math.round(sendingProgress)}%
                                            </span>
                                        </div>

                                        {/* Progress Track */}
                                        <div className="h-2 w-full bg-[#0D1117] rounded-full overflow-hidden border border-[#30363D]">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-[#238636] to-[#3FB950]"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${sendingProgress}%` }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="bg-[#0D1117] p-2 rounded border border-[#30363D] text-center">
                                            <span className="text-[10px] text-[#8B949E] block">Delivered</span>
                                            <span className="text-xs font-semibold text-[#3FB950] font-mono">
                                                {successCount}
                                            </span>
                                        </div>
                                        <div className="bg-[#0D1117] p-2 rounded border border-[#30363D] text-center">
                                            <span className="text-[10px] text-[#8B949E] block">Failed</span>
                                            <span className="text-xs font-semibold text-[#F85149] font-mono">
                                                {errorCount}
                                            </span>
                                        </div>
                                        <div className="bg-[#0D1117] p-2 rounded border border-[#30363D] text-center">
                                            <span className="text-[10px] text-[#8B949E] block">Remaining</span>
                                            <span className="text-xs font-semibold text-[#8B949E] font-mono">
                                                {Math.max(0, totalRecipients - (successCount + errorCount))}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Current recipient being processed */}
                                    {currentRecipientEmail && (
                                        <div className="bg-[#0D1117] p-2.5 rounded border border-[#30363D] flex items-center justify-between text-xs">
                                            <span className="text-[#8B949E] text-[11px]">Processing:</span>
                                            <span className="text-[#58A6FF] font-mono truncate max-w-[220px]">
                                                {currentRecipientName ? `${currentRecipientName} (${currentRecipientEmail})` : currentRecipientEmail}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between text-[11px] text-[#8B949E] pt-1">
                                        <span>Pause rate: {delayBetweenEmails}s per contact</span>
                                        <span className="text-[#58A6FF]">Please keep tab open</span>
                                    </div>
                                </div>
                            ) : (
                                /* STATE 4: PRE-FLIGHT CONFIRMATION */
                                <div className="space-y-4">
                                    <p className="text-xs text-[#8B949E] leading-relaxed">
                                        You are about to dispatch this personalized campaign from your verified Google account:
                                    </p>

                                    <div className="bg-[#0D1117] p-3.5 rounded-lg border border-[#30363D] space-y-2.5 text-xs">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[#8B949E]">Sender Address:</span>
                                            <span className="text-[#E6EDF3] font-mono truncate max-w-[200px]">{senderEmail}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[#8B949E]">Total Recipients:</span>
                                            <span className="text-[#3FB950] font-semibold">{totalRecipients} emails</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[#8B949E]">Pause Rate:</span>
                                            <span className="text-[#E6EDF3] flex items-center gap-1">
                                                <Clock size={12} className="text-[#8B949E]" />
                                                {delayBetweenEmails} seconds between emails
                                            </span>
                                        </div>
                                        {attachmentsCount > 0 && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-[#8B949E]">Attachments:</span>
                                                <span className="text-[#E6EDF3] flex items-center gap-1">
                                                    <Paperclip size={12} className="text-[#58A6FF]" />
                                                    {attachmentsCount} files ({totalAttachmentKB} KB)
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-end gap-2 pt-2">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={handleDismiss}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={onSend}
                                            className="flex items-center gap-1.5"
                                        >
                                            <Send size={13} />
                                            Start Sending
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-5 py-2.5 border-t border-[#30363D] bg-[#0D1117] flex items-center justify-between text-[11px] text-[#8B949E]">
                            <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#3FB950]" />
                                Google Mail API Direct Stream
                            </span>
                            <span>Zero Data Retention</span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
