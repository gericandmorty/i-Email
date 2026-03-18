"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { FileUpload } from './FileUpload';
import { TemplateStep } from './TemplateStep';
import { PreviewStep } from './PreviewStep';
import { parseExcelFile, ParsedExcel } from '@/lib/excel-utils';
import { Footer } from './Footer';
import Sidebar from './Sidebar';
import { Button } from './ui-components';
import { ProtocolLoader } from './ProtocolLoader';
import { cn } from '@/lib/utils';
import { ChevronRight, ChevronLeft, CheckCircle2, Mail, LayoutDashboard, Sparkles, LogOut, User, Send, Paperclip, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginModal } from './LoginModal';
import { TemplatesView } from './TemplatesView';

interface GoogleAccount {
    email: string;
    name: string | null;
    picture: string | null;
}

export default function IEmail({
    onLogout,
    initialAccounts = [],
    currentUserEmail
}: {
    onLogout?: (email?: string) => void,
    initialAccounts?: GoogleAccount[],
    currentUserEmail?: string | null
}) {
    const [view, setView] = useState<'wizard' | 'templates'>('wizard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const [file, setFile] = useState<File | null>(null);
    const [excelData, setExcelData] = useState<ParsedExcel | null>(null);
    const [mapping, setMapping] = useState({ email: '', name: '' });
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
    const [deviceId, setDeviceId] = useState<string>('');

    // Get formatted date today
    const today = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    // API Base URL normalization
    const apiBaseUrl = (() => {
        let url = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
        if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
            url = `https://${url}`;
        }
        return url.replace(/\/$/, '');
    })();

    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');

    // Sender override state
    const [senderName, setSenderName] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('iEmail_senderName') || 'Geric Morit';
        }
        return 'Geric Morit';
    });
    const [senderEmail, setSenderEmail] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('iEmail_senderEmail') || '';
        }
        return '';
    });
    const [senderPicture, setSenderPicture] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('iEmail_senderPicture') || '';
        }
        return '';
    });

    const fetchHistory = async () => {
        if (!senderEmail) return;
        try {
            const res = await fetch(`${apiBaseUrl}/history?email=${senderEmail}`);
            if (res.ok) {
                const data = await res.json();
                setDispatchHistory(data.history);
            }
        } catch (error) {
            console.error("Failed to fetch history", error);
        }
    };

    // Fetch history when senderEmail changes
    useEffect(() => {
        if (senderEmail) {
            fetchHistory();
        }
    }, [senderEmail]);

    // Sync to localStorage
    useEffect(() => {
        if (senderEmail && typeof window !== 'undefined') {
            localStorage.setItem('iEmail_senderEmail', senderEmail);
        }
    }, [senderEmail]);

    useEffect(() => {
        if (senderName && typeof window !== 'undefined') {
            localStorage.setItem('iEmail_senderName', senderName);
        }
    }, [senderName]);

    useEffect(() => {
        if (senderPicture && typeof window !== 'undefined') {
            localStorage.setItem('iEmail_senderPicture', senderPicture);
        }
    }, [senderPicture]);

    const [attachments, setAttachments] = useState<File[]>([]);


    // Sending state
    const [isSending, setIsSending] = useState(false);
    const [sendingProgress, setSendingProgress] = useState(0);
    const [delayBetweenEmails, setDelayBetweenEmails] = useState(2); // Default 2 seconds
    const [recipientStatuses, setRecipientStatuses] = useState<Record<number, 'pending' | 'sending' | 'success' | 'error'>>({});
    const [dispatchHistory, setDispatchHistory] = useState<any[]>([]);

    const handleFileSelect = async (selectedFile: File) => {
        setFile(selectedFile);
        const parsed = await parseExcelFile(selectedFile);
        setExcelData(parsed);

        // Auto-map if "Email" or "Name" exists
        const emailHeader = parsed.headers.find(h => h.toLowerCase().includes('email'));
        const nameHeader = parsed.headers.find(h => h.toLowerCase().includes('name'));

        setMapping({
            email: emailHeader || '',
            name: nameHeader || '',
        });
    };

    const handleClear = () => {
        setFile(null);
        setExcelData(null);
        setStep(1);
    };

    const [connectedAccounts, setConnectedAccounts] = useState<GoogleAccount[]>(initialAccounts);

    const fetchAccounts = useCallback(async () => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
            const url = new URL(`${baseUrl}/auth/accounts`);
            if (deviceId) {
                url.searchParams.append('deviceId', deviceId);
            }
            const res = await fetch(url.toString());
            if (!res.ok) throw new Error("Failed to fetch accounts");
            const data = await res.json();
            setConnectedAccounts(data.accounts);
            return data.accounts;
        } catch (err) {
            console.error("Failed to fetch accounts:", err);
            return [];
        }
    }, []);

    // Check for auth success in URL on mount
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const isAuthSuccess = urlParams.get('auth') === 'success';

        if (isAuthSuccess) {
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        const init = async () => {
            setIsLoadingAccounts(true);

            // Device ID logic
            let currentDeviceId = localStorage.getItem('iEmail_deviceId');
            if (!currentDeviceId) {
                currentDeviceId = Math.random().toString(36).substring(2) + Date.now().toString(36);
                localStorage.setItem('iEmail_deviceId', currentDeviceId);
            }
            setDeviceId(currentDeviceId);

            // If we have initial accounts, we can already show the UI but we fetch anyway to stay fresh
            // Pass the deviceId explicitly here since the state update might not have propagated yet
            try {
                const url = new URL(`${apiBaseUrl}/auth/accounts`);
                url.searchParams.append('deviceId', currentDeviceId);
                const res = await fetch(url.toString());
                const data = await res.json();
                const accounts = data.accounts || [];
                setConnectedAccounts(accounts);

                let accountsToUse = accounts.length > 0 ? accounts : initialAccounts;

                // Auto-sync logic: If we have a current Firebase user but they aren't associated with this device yet
                if (currentUserEmail && !accountsToUse.find((a: GoogleAccount) => a.email.toLowerCase() === currentUserEmail.toLowerCase())) {
                    try {
                        await fetch(`${apiBaseUrl}/auth/sync`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                email: currentUserEmail,
                                deviceId: currentDeviceId,
                            }),
                        });
                        // Re-fetch once after sync to get the fully updated list
                        const reRes = await fetch(url.toString());
                        const reData = await reRes.json();
                        const refreshedAccounts = reData.accounts || [];
                        setConnectedAccounts(refreshedAccounts);
                        accountsToUse = refreshedAccounts; // Update local reference
                    } catch (syncErr) {
                        console.error("Auto-sync failed:", syncErr);
                    }
                }

                if (accountsToUse.length > 0) {
                    const params = new URLSearchParams(window.location.search);
                    const isAuthSuccess = params.get('auth') === 'success';

                    const newestAccount = accountsToUse[0];
                    const firebaseMatch = currentUserEmail ? accountsToUse.find((a: GoogleAccount) => a.email.toLowerCase() === currentUserEmail.toLowerCase()) : null;

                    if (isAuthSuccess || !senderEmail || firebaseMatch) {
                        const targetAccount = firebaseMatch || newestAccount;
                        setSenderEmail(targetAccount.email);
                        if (targetAccount.name) setSenderName(targetAccount.name);
                        if (targetAccount.picture) setSenderPicture(targetAccount.picture);
                    } else {
                        // Check if the current senderEmail is still valid
                        const validAccount = accountsToUse.find((a: GoogleAccount) => a.email.toLowerCase() === senderEmail.toLowerCase());
                        if (!validAccount) {
                            setSenderEmail(newestAccount.email);
                            if (newestAccount.name) setSenderName(newestAccount.name);
                            if (newestAccount.picture) setSenderPicture(newestAccount.picture);
                        } else {
                            if (validAccount.name) setSenderName(validAccount.name);
                            if (validAccount.picture) setSenderPicture(validAccount.picture);
                        }
                    }
                }
                setIsLoadingAccounts(false);
            } catch (err) {
                console.error("Failed to fetch accounts:", err);
                setIsLoadingAccounts(false);
            }
        };

        init();
    }, [fetchAccounts, currentUserEmail]);

    const handleConnectGoogle = useCallback(async () => {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
        // Redirect to backend OAuth2 flow — this gets a real refresh_token from Google
        let url = `${baseUrl}/auth/google`;
        if (deviceId) {
            url += `?deviceId=${deviceId}`;
        }
        window.location.href = url;
    }, [deviceId]);

    const handleLogout = () => {
        if (onLogout) {
            onLogout(senderEmail);
        } else {
            window.location.href = '/';
        }
    };

    const handleUseTemplate = (template: any) => {
        setSubject(template.subject);
        setBody(template.body);
        setAttachments([]); // Clear assets when using a template
        setView('wizard');
        setStep(2); // Go to compose step
    };

    const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    const handleSend = async () => {
        console.log("Frontend: handleSend triggered");
        if (!excelData) {
            console.log("Frontend: excelData missing");
            return;
        }

        setIsSending(true);
        setSendingProgress(0);
        setRecipientStatuses({});

        try {
            const formData = new FormData();
            const recipients = excelData.data.map(row => ({
                ...row,
                email: row[mapping.email],
                name: mapping.name ? row[mapping.name] : ''
            }));

            formData.append('recipients', JSON.stringify(recipients));
            formData.append('subject', subject);
            formData.append('body', body);
            formData.append('delay', String(delayBetweenEmails));

            if (senderEmail) {
                const fullSender = senderName ? `${senderName} <${senderEmail}>` : senderEmail;
                formData.append('sender', fullSender);
            }

            attachments.forEach((file) => {
                formData.append('attachments', file);
            });

            console.log("Frontend: Fetching /send-emails...");
            const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
            const response = await fetch(`${baseUrl}/send-emails`, {
                method: 'POST',
                body: formData,
            });

            console.log(`Frontend: Response status ${response.status}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to dispatch emails');
            }

            // Consume Streaming Response
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) throw new Error("Could not initialize stream reader");

            let buffer = "";
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");

                // Process all lines except the last potentially incomplete one
                buffer = lines.pop() || "";

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (!trimmedLine) continue;

                    // SSE format parsing: remove "data: " prefix if present
                    const jsonStr = trimmedLine.startsWith("data: ")
                        ? trimmedLine.slice(6)
                        : trimmedLine;

                    try {
                        const data = JSON.parse(jsonStr);
                        if (data.type === 'progress') {
                            setRecipientStatuses(prev => ({
                                ...prev,
                                [data.index]: data.success ? 'success' : 'error'
                            }));
                            setSendingProgress(((data.index + 1) / data.total) * 100);
                        } else if (data.type === 'completed') {
                            console.log("Dispatch mission accomplished:", data);
                            setSendingProgress(100);
                        }
                    } catch (e) {
                        console.error("Error parsing stream line:", e, trimmedLine);
                    }
                }
            }

            setIsSending(false);
            fetchHistory();

        } catch (error) {
            setIsSending(false);
            console.error('Dispatch error:', error);
            alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const isNextDisabled = () => {
        if (step === 1 && !file) return true;
        if (step === 2 && (!subject || !body || !senderEmail || !mapping.email)) return true;
        return false;
    };

    const handleSidebarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            handleFileSelect(selectedFile);
        }
    };


    if (isLoadingAccounts) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#EAE0CF]">
                <ProtocolLoader label="Loading Email Accounts..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#EAE0CF] text-[#213448] selection:bg-[#94B4C1]/20 selection:text-[#213448] flex flex-col lg:flex-row">
            <Sidebar
                isSidebarExpanded={isSidebarExpanded}
                setIsSidebarExpanded={setIsSidebarExpanded}
                senderEmail={senderEmail}
                senderName={senderName}
                senderPicture={senderPicture}
                connectedAccounts={connectedAccounts}
                handleLogout={handleLogout}
                view={view}
                setView={setView}
                step={step}
                setStep={setStep}
                file={file}
                excelData={excelData}
                subject={subject}
                body={body}
                onSenderEmailChange={setSenderEmail}
                onSenderNameChange={setSenderName}
                onConnectGoogle={handleConnectGoogle}
                handleSidebarFileSelect={handleSidebarFileSelect}
                isMobileMenuOpen={isMobileMenuOpen}
                onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />

            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#213448] text-[#EAE0CF] flex items-center justify-between px-6 z-[90] shadow-xl border-b border-[#547792]">
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="w-10 h-10 rounded-xl bg-[#547792]/20 flex items-center justify-center text-[#94B4C1]"
                >
                    <Menu size={20} />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#94B4C1] text-[#213448] rounded-lg flex items-center justify-center">
                        <Mail size={16} />
                    </div>
                    <span className="text-sm font-black tracking-tighter uppercase italic">iEmail</span>
                </div>
            </header>

            {/* Right Column: Process Area */}
            <main className="flex-1 min-h-screen overflow-y-auto bg-[#EAE0CF] relative flex flex-col pt-16 lg:pt-0">
                <div className={cn(
                    "flex-1 w-full mx-auto py-8 lg:py-12 px-4 lg:px-12 transition-all duration-300",
                    step === 3 ? "max-w-none" : "max-w-6xl"
                )}>
                    {view === 'templates' ? (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="h-full"
                        >
                            <TemplatesView
                                senderEmail={senderEmail}
                                onUseTemplate={handleUseTemplate}
                                placeholders={excelData?.headers}
                                mapping={mapping}
                                onMappingChange={setMapping}
                            />
                        </motion.div>
                    ) : (
                        <>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={step}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    transition={{
                                        type: "spring",
                                        damping: 25,
                                        stiffness: 120,
                                        mass: 1
                                    }}
                                >
                                    {/* Wizard Steps */}
                                    {step === 1 && (
                                        <FileUpload
                                            onFileSelect={handleFileSelect}
                                            selectedFile={file}
                                            onClear={handleClear}
                                            data={excelData}
                                        />
                                    )}

                                    {step === 2 && (
                                        <TemplateStep
                                            subject={subject}
                                            body={body}
                                            onSubjectChange={setSubject}
                                            onBodyChange={setBody}
                                            senderName={senderName}
                                            onSenderNameChange={setSenderName}
                                            senderEmail={senderEmail}
                                            onSenderEmailChange={setSenderEmail}
                                            attachments={attachments}
                                            onAddAttachments={(files) => setAttachments(prev => [...prev, ...files])}
                                            onRemoveAttachment={(index) => setAttachments(prev => prev.filter((_, i) => i !== index))}
                                            onClearAttachments={() => setAttachments([])}
                                            connectedAccounts={connectedAccounts}
                                            onConnectGoogle={handleConnectGoogle}
                                            placeholders={excelData?.headers}
                                            mapping={mapping}
                                            onMappingChange={setMapping}
                                            delayBetweenEmails={delayBetweenEmails}
                                            onDelayChange={setDelayBetweenEmails}
                                        />
                                    )}

                                    {step === 3 && (
                                        excelData ? (
                                            <PreviewStep
                                                data={excelData.data}
                                                headers={excelData.headers}
                                                mapping={mapping}
                                                subjectTemplate={subject}
                                                bodyTemplate={body}
                                                senderName={senderName}
                                                senderEmail={senderEmail}
                                                attachments={attachments}
                                                isSending={isSending}
                                                sendingProgress={sendingProgress}
                                                delayBetweenEmails={delayBetweenEmails}
                                                onDelayChange={setDelayBetweenEmails}
                                                recipientStatuses={recipientStatuses}
                                                history={dispatchHistory}
                                                onSend={handleSend}
                                                onClearHistory={async () => {
                                                    if (!senderEmail) return;
                                                    try {
                                                        const res = await fetch(`${apiBaseUrl}/history?email=${senderEmail}`, {
                                                            method: 'DELETE'
                                                        });
                                                        if (res.ok) {
                                                            setDispatchHistory([]);
                                                        }
                                                    } catch (error) {
                                                        console.error("Failed to clear history", error);
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center p-12 text-[#94B4C1] opacity-50 space-y-4 h-[60vh] border-2 border-dashed border-[#94B4C1]/20 rounded-[44px]">
                                                <LayoutDashboard size={64} strokeWidth={1} />
                                                <div className="text-center">
                                                    <h3 className="text-xl font-black uppercase tracking-widest mb-2">No Recipient Data</h3>
                                                    <p className="text-sm font-bold opacity-70 mb-6 uppercase tracking-tight">An active recipient list is required for dispatch.</p>
                                                    <Button onClick={() => setStep(1)} className="bg-[#213448] text-[#EAE0CF] hover:bg-[#547792] rounded-xl px-8 h-12 shadow-xl">
                                                        Initialize Upload
                                                    </Button>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            {/* Navigation Footer */}
                            <AnimatePresence>
                                {((step === 1 && file) || (step > 1 && step < 3)) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-16 flex justify-between items-center bg-[#213448] p-6 rounded-[32px] shadow-2xl"
                                    >
                                        {step > 1 && (
                                            <Button variant="ghost" onClick={prevStep} disabled={isSending} className="text-[#94B4C1] hover:text-[#EAE0CF] hover:bg-white/5">
                                                <ChevronLeft size={18} className="mr-2" /> Back
                                            </Button>
                                        )}
                                        <Button
                                            onClick={nextStep}
                                            disabled={isNextDisabled() || isSending}
                                            className="min-w-[160px] bg-[#94B4C1] hover:bg-[#94B4C1]/90 text-[#213448] rounded-2xl h-12 font-black uppercase text-[11px] tracking-widest shadow-xl shadow-[#94B4C1]/20"
                                        >
                                            Proceed <ChevronRight size={18} className="ml-2" />
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {step === 3 && !isSending && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-8 flex justify-center"
                                >
                                    <Button variant="ghost" onClick={prevStep} className="text-[#547792] font-bold hover:text-[#213448]">
                                        <ChevronLeft size={16} className="mr-2" /> Refine details
                                    </Button>
                                </motion.div>
                            )}

                            {/* End Wizard Content */}
                        </>
                    )}
                </div>

                <Footer className="border-t border-[#213448]/5 mt-20 pb-20" />
            </main >

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onLogin={handleConnectGoogle}
            />
        </div >
    );
}
