import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from './ui-components';
import { ChevronLeft, ChevronRight, Send, Mail, User, Type, Paperclip, LayoutGrid, Loader2, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ProtocolLoader } from './ProtocolLoader';

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
    onDelayChange,
    recipientStatuses,
    history = [],
    onSend,
    onClearHistory,
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    // Detect completion
    useEffect(() => {
        if (!isSending && sendingProgress === 100) {
            setShowSuccessModal(true);
        }
    }, [isSending, sendingProgress]);

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
                return String(val || 'MR/MS').trim();
            }

            const actualHeader = headers.find(h => h.toLowerCase() === lowerKey);

            if (actualHeader) {
                const val = row[actualHeader];
                const stringVal = String(val || '').trim();

                if (lowerKey.includes('name') && !stringVal) {
                    return "MR/MS";
                }
                return stringVal;
            }

            if (lowerKey.includes('name')) {
                return "MR/MS";
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

    return (
        <div className="flex flex-col lg:flex-row gap-6 w-full relative pb-24 lg:pb-0 lg:h-[calc(100vh-180px)]">
            {/* Left Sidebar: Recipient List */}
            <div className="w-full lg:w-[300px] shrink-0 flex flex-col gap-4 h-full">
                <Card className="border-none bg-white shadow-sm flex flex-col min-h-[300px] lg:min-h-0 lg:flex-1 overflow-hidden rounded-[32px] border border-[#213448]/5">
                    <CardHeader className="p-6 pb-4 shrink-0 bg-white z-10">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-[#EAE0CF] rounded-xl text-[#213448]">
                                    <User size={14} />
                                </div>
                                <CardTitle className="tracking-widest text-[10px] font-black uppercase text-[#213448]">
                                    Recipients
                                </CardTitle>
                            </div>
                            <CardDescription className="text-[9px] font-black text-[#94B4C1] uppercase tracking-widest bg-[#94B4C1]/5 px-3 py-1 rounded-full">
                                {isSending ? `${sentCount} / ${data.length}` : `${data.length} Total`}
                            </CardDescription>
                        </div>
                        {isSending && (
                            <div className="mt-4 space-y-2">
                                <div className="h-1.5 w-full bg-[#213448]/5 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-[#94B4C1]"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${sendingProgress}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                                <div className="flex justify-between items-center px-0.5">
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#94B4C1] animate-pulse">Sending...</span>
                                    <span className="text-[9px] font-black text-[#213448]">{Math.round(sendingProgress)}%</span>
                                </div>
                            </div>
                        )}
                    </CardHeader>

                    <div className="flex-1 overflow-y-auto lg:overflow-y-auto px-4 pb-6 space-y-2 custom-scrollbar max-h-[200px] lg:max-h-none">
                        {data.map((row, idx) => {
                            const email = row[mapping.email];
                            const name = mapping.name ? row[mapping.name] : 'Unknown';
                            const active = idx === currentIndex;

                            return (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all border-2 text-left group",
                                        active
                                            ? "bg-[#213448] border-[#213448] text-[#EAE0CF] shadow-[0_10px_30px_rgba(33,52,72,0.15)]"
                                            : "bg-white border-transparent hover:border-[#EAE0CF] hover:bg-[#EAE0CF]/20"
                                    )}
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-black text-xs",
                                        active ? "bg-[#547792] text-[#EAE0CF]" : "bg-[#213448]/5 text-[#213448]"
                                    )}>
                                        {String(idx + 1).padStart(2, '0')}
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-tight truncate",
                                            active ? "text-[#EAE0CF]" : "text-[#213448]"
                                        )}>
                                            {name}
                                        </span>
                                        <span className={cn(
                                            "text-[8px] font-bold truncate opacity-60 italic",
                                            active ? "text-[#94B4C1]" : "text-[#547792]"
                                        )}>
                                            {email}
                                        </span>
                                    </div>
                                    {recipientStatuses[idx] && (
                                        <div className={cn(
                                            "shrink-0 w-2 h-2 rounded-full shadow-sm",
                                            recipientStatuses[idx] === 'success' ? "bg-green-500" : "bg-red-500"
                                        )} />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </Card>

                <div className="hidden lg:block">
                    <Button
                        className={cn(
                            "w-full h-16 text-sm font-black rounded-[24px] shadow-lg hover:shadow-[#213448]/20 transition-all group shrink-0 relative overflow-hidden",
                            isSending
                                ? "bg-[#547792] text-[#EAE0CF] cursor-wait"
                                : "bg-[#213448] hover:bg-[#547792] text-[#EAE0CF]"
                        )}
                        onClick={() => onSend()}
                        disabled={!recipientEmail || recipientEmail === 'No email found' || !senderEmail || isSending}
                    >
                        {isSending ? (
                            <div className="flex items-center justify-center">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="mr-3"
                                >
                                    <Loader2 size={18} />
                                </motion.div>
                                SENDING...
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-3">
                                <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                <span>SEND EMAILS</span>
                                <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-[30deg] translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                            </div>
                        )}
                    </Button>
                </div>
            </div>

            {/* Right Main Area: Wide Preview */}
            <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden">
                <Card className="border-none bg-white shadow-md rounded-[40px] overflow-hidden h-full flex flex-col relative w-full border border-[#213448]/5">
                    <CardHeader className="px-8 py-6 border-b border-[#213448]/5 flex flex-row items-center justify-between shrink-0 bg-white relative z-20">
                        <div className="flex items-center gap-5">
                            <div className="p-3.5 bg-[#213448] text-[#EAE0CF] rounded-[20px] shadow-md shrink-0">
                                <Mail size={22} />
                            </div>
                            <div>
                                <CardTitle className="tracking-tighter text-2xl font-black uppercase italic leading-none">
                                    Email Preview
                                </CardTitle>
                                <CardDescription className="text-[10px] uppercase tracking-[0.4em] font-black text-[#94B4C1] mt-1.5 flex items-center gap-2">
                                    Recipient {currentIndex + 1} <span className="w-1 h-1 rounded-full bg-[#94B4C1]/30" /> {data.length} Recipients
                                </CardDescription>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {!isSending && history && history.length > 0 && (
                                <Button
                                    onClick={() => setShowHistory(!showHistory)}
                                    className={cn(
                                        "h-12 px-6 rounded-2xl flex items-center gap-2.5 font-black uppercase text-[10px] tracking-widest transition-all",
                                        showHistory
                                            ? "bg-[#213448] text-[#EAE0CF]"
                                            : "bg-[#EAE0CF] text-[#213448] hover:bg-[#213448] hover:text-[#EAE0CF]"
                                    )}
                                >
                                    <Clock size={16} />
                                    <span>{showHistory ? "Back to Preview" : "History"}</span>
                                </Button>
                            )}

                            {showHistory && !isSending && history && history.length > 0 && onClearHistory && (
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowClearConfirm(true)}
                                    className="h-12 px-5 rounded-2xl flex items-center gap-2.5 font-black uppercase text-[10px] tracking-widest text-red-500 hover:bg-red-500/10 transition-all border border-red-500/10"
                                >
                                    <AlertCircle size={16} />
                                    <span>Clear</span>
                                </Button>
                            )}

                            <div className="hidden lg:flex items-center gap-2 bg-[#EAE0CF]/30 p-1.5 rounded-2xl border border-[#213448]/5">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                                    disabled={currentIndex === 0}
                                    className="h-9 w-9 text-[#213448] hover:bg-[#213448] hover:text-[#EAE0CF] rounded-xl transition-all"
                                >
                                    <ChevronLeft size={18} />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setCurrentIndex((prev) => Math.min(data.length - 1, prev + 1))}
                                    disabled={currentIndex === data.length - 1}
                                    className="h-9 w-9 text-[#213448] hover:bg-[#213448] hover:text-[#EAE0CF] rounded-xl transition-all"
                                >
                                    <ChevronRight size={18} />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 overflow-hidden p-0 relative h-full">
                        <AnimatePresence mode="wait">
                            {showHistory ? (
                                <motion.div
                                    key="history"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="absolute inset-0 overflow-y-auto p-8 custom-scrollbar bg-[#F5F5F5]/30"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {history.map((record, hIdx) => (
                                            <div
                                                key={record.id || hIdx}
                                                className="bg-white p-5 rounded-[24px] border border-[#213448]/10 shadow-sm flex items-center gap-5"
                                            >
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg",
                                                    record.success ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
                                                )}>
                                                    {record.success ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                                                </div>
                                                <div className="flex flex-col min-w-0 flex-1">
                                                    <div className="flex justify-between items-center gap-2 mb-1">
                                                        <span className="text-[11px] font-black uppercase tracking-tight truncate text-[#213448]">
                                                            {record.recipient_email}
                                                        </span>
                                                        <span className="text-[9px] font-black text-[#94B4C1] shrink-0">
                                                            {record.timestamp ? new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] font-bold truncate opacity-80 text-[#547792] italic">
                                                        {record.subject}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key={currentIndex}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="h-full overflow-y-auto p-8 lg:p-12 custom-scrollbar space-y-8"
                                >
                                    {/* Metadata Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                                        <div className="p-4 lg:p-6 rounded-[20px] lg:rounded-[24px] bg-[#EAE0CF]/20 border border-[#213448]/5 flex items-center gap-4 lg:gap-5">
                                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-[14px] lg:rounded-[18px] bg-white flex items-center justify-center text-[#94B4C1] shadow-sm shrink-0">
                                                <User size={18} className="lg:hidden" />
                                                <User size={20} className="hidden lg:block" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[8px] lg:text-[9px] font-black text-[#94B4C1] uppercase tracking-[0.3em] leading-none mb-1 lg:mb-2">Recipient Name</span>
                                                <span className="text-[#213448] font-black text-sm lg:text-base truncate">{recipientName || 'ANONYMOUS'}</span>
                                            </div>
                                        </div>
                                        <div className="p-4 lg:p-6 rounded-[20px] lg:rounded-[24px] bg-[#EAE0CF]/20 border border-[#213448]/5 flex items-center gap-4 lg:gap-5">
                                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-[14px] lg:rounded-[18px] bg-white flex items-center justify-center text-[#94B4C1] shadow-sm shrink-0">
                                                <Mail size={18} className="lg:hidden" />
                                                <Mail size={20} className="hidden lg:block" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[8px] lg:text-[9px] font-black text-[#94B4C1] uppercase tracking-[0.3em] leading-none mb-1 lg:mb-2">Recipient Email</span>
                                                <span className="text-[#213448] font-black text-sm lg:text-base truncate italic">{recipientEmail}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Subject Row */}
                                    <div className="p-4 lg:p-6 rounded-[20px] lg:rounded-[24px] bg-[#213448] border border-[#213448] flex items-center gap-4 lg:gap-5 shadow-lg shadow-[#213448]/10">
                                        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-[14px] lg:rounded-[18px] bg-[#547792] flex items-center justify-center text-[#EAE0CF] shrink-0">
                                            <Type size={18} className="lg:hidden" />
                                            <Type size={20} className="hidden lg:block" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[8px] lg:text-[9px] font-black text-[#94B4C1] uppercase tracking-[0.3em] leading-none mb-1 lg:mb-2">Subject</span>
                                            <span className="text-[#EAE0CF] font-black text-base lg:text-lg uppercase tracking-tight truncate">{previewSubject || '(NOT SET)'}</span>
                                        </div>
                                    </div>

                                    {/* Message Body area */}
                                    <div className="relative group p-1">
                                        <div className="relative bg-white border border-[#213448]/5 rounded-[24px] lg:rounded-[28px] p-6 lg:p-10 min-h-[300px] lg:min-h-[400px] text-base lg:text-lg text-[#213448] font-medium leading-relaxed shadow-sm">
                                            <div
                                                className="prose prose-slate max-w-none"
                                                dangerouslySetInnerHTML={{ __html: previewBody || 'Loading message...' }}
                                            />
                                        </div>
                                    </div>

                                    {/* Assets Area */}
                                    {attachments.length > 0 && (
                                        <div className="pt-8 border-t border-[#213448]/5">
                                            <div className="flex items-center justify-between mb-5">
                                                <div className="flex items-center gap-3">
                                                    <Paperclip size={18} className="text-[#94B4C1]" />
                                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#213448]">Attachments ({attachments.length})</span>
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl bg-[#213448] text-[#EAE0CF]">
                                                    {totalAttachmentKB} KB
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-3">
                                                {attachments.map((file, i) => (
                                                    <div key={i} className="flex items-center gap-3 text-[10px] text-[#213448] bg-white border border-[#213448]/10 px-5 py-3 rounded-2xl font-black uppercase tracking-tight shadow-sm">
                                                        {file.name}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>

                {/* Success Modal */}
                <AnimatePresence>
                    {showSuccessModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#213448]/80 backdrop-blur-md"
                            onClick={() => setShowSuccessModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="bg-[#EAE0CF] w-full max-w-md rounded-[44px] overflow-hidden shadow-2xl relative border-4 border-[#94B4C1]/20"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="bg-[#213448] p-8 text-center relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#94B4C1] to-transparent" />
                                    <div className="w-20 h-20 bg-[#94B4C1] rounded-3xl mx-auto mb-6 flex items-center justify-center text-[#EAE0CF] shadow-2xl shadow-[#94B4C1]/40">
                                        <Mail size={40} />
                                    </div>
                                    <h3 className="text-[#EAE0CF] text-2xl font-black uppercase tracking-tighter mb-1">Emails Sent!</h3>
                                    <p className="text-[#94B4C1] text-[10px] font-black uppercase tracking-[0.3em]">Your emails have been sent successfully.</p>
                                </div>

                                <div className="p-10 space-y-8">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center px-4 py-3 bg-[#213448]/5 rounded-2xl border border-[#213448]/5">
                                            <span className="text-[10px] font-black text-[#94B4C1] uppercase tracking-widest">Total Recipients</span>
                                            <span className="text-sm font-black text-[#213448]">{data.length}</span>
                                        </div>
                                        <div className="flex justify-between items-center px-4 py-3 bg-[#213448]/5 rounded-2xl border border-[#213448]/5">
                                            <span className="text-[10px] font-black text-[#94B4C1] uppercase tracking-widest">Status</span>
                                            <span className="text-[10px] font-black text-[#94B4C1] uppercase tracking-widest bg-[#94B4C1]/10 px-3 py-1 rounded-full">Completed</span>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => setShowSuccessModal(false)}
                                        className="w-full h-14 bg-[#213448] hover:bg-[#547792] text-[#EAE0CF] rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all shadow-xl"
                                    >
                                        Done
                                    </Button>
                                </div>

                                <div className="bg-[#213448]/5 p-4 text-center border-t border-[#213448]/5">
                                    <p className="text-[8px] font-black text-[#94B4C1] uppercase tracking-[0.4em] opacity-50">Operation successful</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Clear History Confirmation Modal */}
                <AnimatePresence>
                    {showClearConfirm && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[210] flex items-center justify-center p-6 bg-[#213448]/80 backdrop-blur-md"
                            onClick={() => setShowClearConfirm(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="bg-[#EAE0CF] w-full max-w-sm rounded-[40px] overflow-hidden shadow-2xl relative border-4 border-red-500/20"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-10 text-center space-y-6">
                                    <div className="w-16 h-16 bg-red-500/10 rounded-full mx-auto flex items-center justify-center text-red-500">
                                        <AlertCircle size={32} />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-[#213448] text-xl font-black uppercase tracking-tight">Clear History?</h3>
                                        <p className="text-[#547792] text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                                            This action is permanent and will remove all dispatch logs from your account.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-4">
                                        <Button
                                            variant="ghost"
                                            onClick={() => setShowClearConfirm(false)}
                                            className="h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest text-[#213448] hover:bg-[#213448]/5"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={async () => {
                                                if (onClearHistory) {
                                                    await onClearHistory();
                                                    setShowClearConfirm(false);
                                                }
                                            }}
                                            className="h-12 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-red-500/20"
                                        >
                                            Clear All
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Mobile Sticky CTA */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-[#213448]/5 z-[100] flex items-center gap-3">
                <div className="flex items-center gap-1 bg-[#213448]/5 p-1 rounded-2xl border border-[#213448]/5">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                        disabled={currentIndex === 0}
                        className="h-10 w-10 text-[#213448] hover:bg-[#213448] hover:text-[#EAE0CF] rounded-xl transition-all"
                    >
                        <ChevronLeft size={18} />
                    </Button>
                    <div className="px-2 text-[10px] font-black text-[#213448] min-w-[40px] text-center">
                        {currentIndex + 1} / {data.length}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCurrentIndex((prev) => Math.min(data.length - 1, prev + 1))}
                        disabled={currentIndex === data.length - 1}
                        className="h-10 w-10 text-[#213448] hover:bg-[#213448] hover:text-[#EAE0CF] rounded-xl transition-all"
                    >
                        <ChevronRight size={18} />
                    </Button>
                </div>

                <Button
                    className={cn(
                        "flex-1 h-14 text-xs font-black rounded-2xl shadow-xl transition-all group relative overflow-hidden",
                        isSending
                            ? "bg-[#547792] text-[#EAE0CF] cursor-wait"
                            : "bg-[#213448] hover:bg-[#547792] text-[#EAE0CF]"
                    )}
                    onClick={() => onSend()}
                    disabled={!recipientEmail || recipientEmail === 'No email found' || !senderEmail || isSending}
                >
                    {isSending ? (
                        <div className="flex items-center justify-center">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="mr-2"
                            >
                                <Loader2 size={14} />
                            </motion.div>
                            SENDING...
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2">
                            <Send size={16} />
                            <span>SEND EMAILS</span>
                        </div>
                    )}
                </Button>
            </div>
        </div>
    );
};
