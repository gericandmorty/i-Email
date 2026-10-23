import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button } from './ui-components';
import {
    ChevronLeft,
    ChevronRight,
    Send,
    User,
    Paperclip,
    Loader2,
    Clock,
    AlertCircle,
    CheckCircle2,
    Search,
    Check,
    Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandLogo } from './BrandLogo';
import { DispatchModal } from './DispatchModal';
import { useScrollLock } from '@/lib/use-scroll-lock';

interface PreviewStepProps {
    data: any[];
    headers: string[];
    mapping: { email: string; name: string };
    subjectTemplate: string;
    bodyTemplate: string;
    senderName: string;
    senderEmail: string;
    attachments: File[];
    isSending: boolean;
    sendingProgress: number;
    delayBetweenEmails: number;
    onDelayChange: (delay: number) => void;
    recipientStatuses: Record<number, 'pending' | 'sending' | 'success' | 'error'>;
    history?: any[];
    onSend: () => void;
    onClearHistory?: () => Promise<void>;
    sendError?: string | null;
    onClearSendError?: () => void;
    isDispatchSuccess?: boolean;
    onResetDispatch?: () => void;
}

export const PreviewStep: React.FC<PreviewStepProps> = ({
    data,
    headers,
    mapping,
    subjectTemplate,
    bodyTemplate,
    senderName,
    senderEmail,
    attachments,
    isSending,
    sendingProgress,
    delayBetweenEmails,
    recipientStatuses,
    history = [],
    onSend,
    onClearHistory,
    sendError = null,
    onClearSendError,
    isDispatchSuccess = false,
    onResetDispatch,
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [searchRecipient, setSearchRecipient] = useState('');

    // If sending starts externally or error arrives, keep dispatch modal visible
    useEffect(() => {
        if (isSending || sendError) {
            setIsDispatchModalOpen(true);
        }
    }, [isSending, sendError]);

    // Zero-shift body scroll lock for history clear modal
    useScrollLock(showClearConfirm);

    // Escape listener for history clear modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && showClearConfirm) {
                setShowClearConfirm(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showClearConfirm]);

    const replaceVariables = (template: string, row: any, isBody: boolean = false) => {
        if (!template) return '';
        let result = template;

        const universalRegex = /{{\s*(.*?)\s*}}/g;

        result = result.replace(universalRegex, (match, content) => {
            const cleanKey = content.replace(/<[^>]*>?/gm, '').trim();
            const lowerKey = cleanKey.toLowerCase();

            if (lowerKey === 'today') {
                return new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            }

            if (lowerKey === 'recipient') {
                const val = mapping.name ? row[mapping.name] : null;
                return String(val || 'Friend').trim();
            }

            const actualHeader = headers.find(h => h.toLowerCase() === lowerKey);

            if (actualHeader) {
                const val = row[actualHeader];
                const stringVal = String(val || '').trim();

                if (lowerKey.includes('name') && !stringVal) {
                    return "Friend";
                }
                return stringVal;
            }

            if (lowerKey.includes('name')) {
                return "Friend";
            }

            return match;
        });

        if (isBody) {
            return result.replace(/\n/g, '<br/>');
        }
        return result;
    };

    const currentRow = data[currentIndex] || {};
    const previewSubject = replaceVariables(subjectTemplate, currentRow);
    const previewBody = replaceVariables(bodyTemplate, currentRow, true);
    const recipientEmail = currentRow[mapping.email] || 'No email found';
    const recipientName = mapping.name ? currentRow[mapping.name] : '';

    const totalAttachmentSize = attachments.reduce((sum, file) => sum + file.size, 0);
    const totalAttachmentKB = Math.round(totalAttachmentSize / 1024);
    const sentCount = Math.floor((sendingProgress / 100) * data.length);

    // Keyboard navigation (ArrowLeft / ArrowRight)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if (isDispatchModalOpen || showClearConfirm) return;

            if (e.key === 'ArrowLeft') {
                setCurrentIndex((prev) => Math.max(0, prev - 1));
            } else if (e.key === 'ArrowRight') {
                setCurrentIndex((prev) => Math.min(data.length - 1, prev + 1));
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [data.length, isDispatchModalOpen, showClearConfirm]);

    const filteredRecipients = data.map((row, idx) => ({ row, idx })).filter(({ row }) => {
        if (!searchRecipient) return true;
        const email = String(row[mapping.email] || '').toLowerCase();
        const name = String(mapping.name ? row[mapping.name] : '').toLowerCase();
        const q = searchRecipient.toLowerCase();
        return email.includes(q) || name.includes(q);
    });

    return (
        <div className="flex flex-col lg:flex-row gap-6 w-full relative pb-20 lg:pb-0 lg:h-[calc(100vh-140px)]">
            {/* Left Column: Contact List & Send Button */}
            <div className="w-full lg:w-72 shrink-0 flex flex-col gap-3 h-full">
                <Card className="bg-[#161B22] border-[#30363D] flex flex-col h-full overflow-hidden">
                    {/* Header */}
                    <div className="p-3.5 border-b border-[#30363D] space-y-2.5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <User size={14} className="text-[#58A6FF]" />
                                <span className="text-xs font-semibold text-[#E6EDF3]">Contacts List</span>
                            </div>
                            <span className="text-[11px] font-mono text-[#8B949E] px-2 py-0.5 rounded bg-[#21262D] border border-[#30363D]">
                                {isSending ? `${sentCount}/${data.length}` : `${data.length} total`}
                            </span>
                        </div>

                        {/* Sending Progress Bar in Sidebar */}
                        {isSending && (
                            <div className="space-y-1.5 pt-1">
                                <div className="h-1.5 w-full bg-[#0D1117] rounded-full overflow-hidden border border-[#30363D]">
                                    <motion.div
                                        className="h-full bg-[#3FB950]"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${sendingProgress}%` }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-[#8B949E]">
                                    <span className="text-[#58A6FF] flex items-center gap-1">
                                        <Loader2 size={10} className="animate-spin" /> Sending emails...
                                    </span>
                                    <span>{Math.round(sendingProgress)}%</span>
                                </div>
                            </div>
                        )}

                        {/* Search Filter */}
                        <div className="relative">
                            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8B949E]" />
                            <input
                                placeholder="Find a contact..."
                                value={searchRecipient}
                                onChange={(e) => setSearchRecipient(e.target.value)}
                                className="h-7 w-full pl-7 pr-2 rounded bg-[#0D1117] border border-[#30363D] text-[11px] text-[#E6EDF3] placeholder:text-[#8B949E]/70 focus:outline-none focus:border-[#58A6FF]"
                            />
                        </div>
                    </div>

                    {/* Recipient list */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {filteredRecipients.map(({ row, idx }) => {
                            const email = row[mapping.email];
                            const name = mapping.name ? row[mapping.name] : 'Contact';
                            const active = idx === currentIndex;
                            const status = recipientStatuses[idx];

                            return (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-2 rounded text-left transition-colors text-xs",
                                        active
                                            ? "bg-[#21262D] text-[#E6EDF3] font-semibold border border-[#58A6FF]/40"
                                            : "hover:bg-[#21262D]/60 text-[#8B949E] border border-transparent"
                                    )}
                                >
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <span className="font-mono text-[10px] text-[#8B949E] w-5 text-right shrink-0">
                                            {idx + 1}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-xs text-[#E6EDF3]">{name}</div>
                                            <div className="truncate text-[10px] text-[#8B949E] font-mono">{email}</div>
                                        </div>
                                    </div>

                                    {/* Status Indicator */}
                                    {status && (
                                        <div className="shrink-0 ml-1.5">
                                            {status === 'success' && (
                                                <span className="w-2 h-2 rounded-full bg-[#3FB950] block" title="Sent successfully" />
                                            )}
                                            {status === 'error' && (
                                                <span className="w-2 h-2 rounded-full bg-[#F85149] block" title="Failed to send" />
                                            )}
                                            {status === 'sending' && (
                                                <span className="w-2 h-2 rounded-full bg-[#58A6FF] animate-pulse block" title="Sending now..." />
                                            )}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Send Button */}
                    <div className="p-3 border-t border-[#30363D] bg-[#161B22]">
                        <Button
                            variant="primary"
                            className="w-full h-10 text-xs font-semibold flex items-center justify-center gap-2"
                            onClick={() => setIsDispatchModalOpen(true)}
                            disabled={!recipientEmail || recipientEmail === 'No email found' || !senderEmail}
                        >
                            {isSending ? (
                                <>
                                    <Loader2 size={13} className="animate-spin" />
                                    <span>Sending Emails ({Math.round(sendingProgress)}%)...</span>
                                </>
                            ) : (
                                <>
                                    <Send size={13} />
                                    <span>Send to All ({data.length})</span>
                                </>
                            )}
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Right Column: Preview & History */}
            <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden">
                <Card className="bg-[#161B22] border-[#30363D] h-full flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="px-5 py-3 border-b border-[#30363D] flex items-center justify-between shrink-0 bg-[#161B22]">
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                                <BrandLogo size={28} />
                            </div>
                            <div>
                                <h3 className="text-xs font-semibold text-[#E6EDF3]">
                                    Email Preview
                                </h3>
                                <span className="text-[11px] text-[#8B949E]">
                                    Person {currentIndex + 1} of {data.length}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            {!isSending && history && history.length > 0 && (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setShowHistory(!showHistory)}
                                    className="text-xs flex items-center gap-1.5 h-8"
                                >
                                    <Clock size={12} />
                                    <span>{showHistory ? "Back to Preview" : `Sent History (${history.length})`}</span>
                                </Button>
                            )}

                            {/* Pagination Controls */}
                            <div className="flex items-center gap-1 bg-[#0D1117] p-1 rounded border border-[#30363D]">
                                <button
                                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                                    disabled={currentIndex === 0 || isSending}
                                    className="p-1 rounded text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                    title="Previous contact (Arrow Left)"
                                >
                                    <ChevronLeft size={14} />
                                </button>
                                <span className="text-[11px] font-mono text-[#8B949E] px-2 min-w-[50px] text-center">
                                    {currentIndex + 1} / {data.length}
                                </span>
                                <button
                                    onClick={() => setCurrentIndex((prev) => Math.min(data.length - 1, prev + 1))}
                                    disabled={currentIndex === data.length - 1 || isSending}
                                    className="p-1 rounded text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                    title="Next contact (Arrow Right)"
                                >
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Preview Content Area */}
                    <CardContent className="p-5 lg:p-6 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                        <AnimatePresence mode="wait">
                            {showHistory ? (
                                /* History View */
                                <motion.div
                                    key="history"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-3"
                                >
                                    <div className="flex items-center justify-between pb-2 border-b border-[#30363D]">
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} className="text-[#58A6FF]" />
                                            <span className="text-xs font-semibold text-[#E6EDF3]">Recent Dispatches</span>
                                        </div>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => setShowClearConfirm(true)}
                                            className="text-xs text-[#F85149] hover:bg-[#F85149]/10 border-[#F85149]/30 h-7"
                                        >
                                            <Trash2 size={12} className="mr-1" /> Clear History
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        {history.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="p-3 bg-[#0D1117] border border-[#30363D] rounded-lg text-xs space-y-1"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-[#E6EDF3]">{item.subject || '(No subject)'}</span>
                                                    <span className="text-[11px] font-mono text-[#8B949E]">
                                                        {new Date(item.timestamp).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-[11px] text-[#8B949E]">
                                                    <span>Recipients: <strong className="text-[#E6EDF3]">{item.total}</strong></span>
                                                    <span>Delivered: <strong className="text-[#3FB950]">{item.success_count}</strong></span>
                                                    {item.error_count > 0 && (
                                                        <span>Failed: <strong className="text-[#F85149]">{item.error_count}</strong></span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ) : (
                                /* Regular Email Preview */
                                <motion.div
                                    key={currentIndex}
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    transition={{ duration: 0.12 }}
                                    className="space-y-4"
                                >
                                    {/* Sender & Recipient Metadata */}
                                    <div className="p-3.5 rounded-md bg-[#0D1117] border border-[#30363D] space-y-2 text-xs">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[#8B949E] font-medium w-14 shrink-0">From:</span>
                                            <span className="text-[#E6EDF3] font-mono">
                                                {senderName ? `${senderName} <${senderEmail}>` : senderEmail}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className="text-[#8B949E] font-medium w-14 shrink-0">To:</span>
                                            <span className="text-[#58A6FF] font-mono">
                                                {recipientName ? `${recipientName} <${recipientEmail}>` : recipientEmail}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3 pt-1 border-t border-[#30363D]">
                                            <span className="text-[#8B949E] font-medium w-14 shrink-0">Subject:</span>
                                            <span className="text-[#E6EDF3] font-semibold">
                                                {previewSubject || '(No subject provided)'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Rendered Email Body Box */}
                                    <div className="p-5 lg:p-6 rounded-md bg-[#161B22] border border-[#30363D] min-h-[340px] text-xs text-[#E6EDF3] leading-relaxed shadow-sm">
                                        <div
                                            className="prose prose-invert max-w-none text-xs text-[#E6EDF3]"
                                            dangerouslySetInnerHTML={{ __html: previewBody || '<span class="text-[#8B949E] italic">Empty message</span>' }}
                                        />
                                    </div>

                                    {/* Attachments List */}
                                    {attachments.length > 0 && (
                                        <div className="p-3.5 rounded-md bg-[#161B22] border border-[#30363D] space-y-2">
                                            <div className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-1.5 text-[#E6EDF3] font-medium">
                                                    <Paperclip size={13} className="text-[#58A6FF]" />
                                                    <span>Attached Files ({attachments.length})</span>
                                                </div>
                                                <span className="text-[11px] text-[#8B949E]">{totalAttachmentKB} KB</span>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {attachments.map((file, i) => (
                                                    <span
                                                        key={i}
                                                        className="px-2.5 py-1 rounded bg-[#0D1117] border border-[#30363D] text-[11px] text-[#E6EDF3]"
                                                    >
                                                        {file.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </div>

            {/* Unified Real-time Dispatch Modal */}
            <DispatchModal
                isOpen={isDispatchModalOpen}
                onClose={() => {
                    setIsDispatchModalOpen(false);
                    if (onResetDispatch) onResetDispatch();
                }}
                onSend={onSend}
                isSending={isSending}
                sendingProgress={sendingProgress}
                isDispatchSuccess={isDispatchSuccess}
                totalRecipients={data.length}
                senderEmail={senderEmail}
                delayBetweenEmails={delayBetweenEmails}
                attachmentsCount={attachments.length}
                totalAttachmentKB={totalAttachmentKB}
                recipientStatuses={recipientStatuses}
                data={data}
                mapping={mapping}
                sendError={sendError}
                onClearSendError={onClearSendError}
                onViewHistory={() => setShowHistory(true)}
            />

            {/* Clear History Confirmation Modal */}
            <AnimatePresence>
                {showClearConfirm && (
                    <motion.div
                        key="clear-confirm-wrapper"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 z-[130] flex items-center justify-center p-4 isolate"
                        role="dialog"
                        aria-modal="true"
                    >
                        <div
                            className="absolute inset-0 bg-[#04070A]/80 cursor-pointer"
                            onClick={() => setShowClearConfirm(false)}
                            aria-hidden="true"
                        />
                        <motion.div
                            initial={{ scale: 0.96, opacity: 0, y: 6 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.96, opacity: 0, y: 6 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="relative z-10 bg-[#161B22] w-full max-w-sm rounded-xl border border-[#30363D] shadow-2xl p-5 space-y-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-2 text-[#F85149]">
                                <AlertCircle size={18} />
                                <h3 className="text-sm font-semibold text-[#E6EDF3]">Clear Sent History?</h3>
                            </div>

                            <p className="text-xs text-[#8B949E] leading-relaxed">
                                This will permanently delete the list of sent emails from your history.
                            </p>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setShowClearConfirm(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={async () => {
                                        if (onClearHistory) {
                                            await onClearHistory();
                                            setShowClearConfirm(false);
                                        }
                                    }}
                                >
                                    Delete History
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Bottom Sticky Action Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3 bg-[#161B22] border-t border-[#30363D] z-[100] flex items-center gap-2.5">
                <div className="flex items-center gap-1 bg-[#0D1117] p-1 rounded border border-[#30363D]">
                    <button
                        onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                        disabled={currentIndex === 0 || isSending}
                        className="p-1 rounded text-[#8B949E] disabled:opacity-30"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-[11px] font-mono text-[#8B949E] px-1">
                        {currentIndex + 1}/{data.length}
                    </span>
                    <button
                        onClick={() => setCurrentIndex((prev) => Math.min(data.length - 1, prev + 1))}
                        disabled={currentIndex === data.length - 1 || isSending}
                        className="p-1 rounded text-[#8B949E] disabled:opacity-30"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>

                <Button
                    variant="primary"
                    className="flex-1 text-xs font-semibold h-10"
                    onClick={() => setIsDispatchModalOpen(true)}
                    disabled={!recipientEmail || recipientEmail === 'No email found' || !senderEmail || isSending}
                >
                    {isSending ? `Sending (${Math.round(sendingProgress)}%)...` : `Send Emails (${data.length})`}
                </Button>
            </div>
        </div>
    );
};
