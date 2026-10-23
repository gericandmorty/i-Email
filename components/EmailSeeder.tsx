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
import { toast } from './Toast';
import { BrandLogo } from './BrandLogo';

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
    const [isDispatchSuccess, setIsDispatchSuccess] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);
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
            toast.success('Google account connected successfully!', {
                title: 'Account Connected',
            });
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
        setSendError(null);
        setIsDispatchSuccess(false);
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

            toast.info(`Starting dispatch of ${recipients.length} emails...`, {
                title: 'Dispatch Initiated',
            });

            console.log("Frontend: Fetching /send-emails...");
            const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
            const response = await fetch(`${baseUrl}/send-emails`, {
                method: 'POST',
                body: formData,
            });

            console.log(`Frontend: Response status ${response.status}`);

            if (!response.ok) {
                let errorDetail = 'Failed to dispatch emails';
                try {
                    const errorData = await response.json();
                    errorDetail = errorData.detail || errorData.message || errorDetail;
                } catch (e) {
                    // Fallback to status text
                    errorDetail = `Server returned status ${response.status}: ${response.statusText}`;
                }
                throw new Error(errorDetail);
            }

            // Consume Streaming Response
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) throw new Error("Could not initialize stream reader");

            let buffer = "";
            let failedCount = 0;
            let successCount = 0;

            const processLine = (line: string) => {
                const trimmedLine = line.trim();
                if (!trimmedLine) return;

                // SSE format parsing: remove "data: " prefix if present
                const jsonStr = trimmedLine.startsWith("data: ")
                    ? trimmedLine.slice(6).trim()
                    : trimmedLine;

                try {
                    const rawData = JSON.parse(jsonStr);
                    const data = rawData.data || rawData;

                    if (data.type === 'progress') {
                        if (data.success) {
                            successCount++;
                        } else {
                            failedCount++;
                        }
                        setRecipientStatuses(prev => ({
                            ...prev,
                            [data.index]: data.success ? 'success' : 'error'
                        }));
                        const progress = data.total > 0
                            ? Math.min(100, Math.round(((data.index + 1) / data.total) * 100))
                            : 100;
                        setSendingProgress(progress);
                    } else if (data.type === 'completed' || data.type === 'complete') {
                        console.log("Dispatch mission accomplished:", data);
                        setSendingProgress(100);
                        setIsDispatchSuccess(true);

                        const totalCount = data.total || data.totalCount || recipients.length;
                        const finalFailures = data.failCount ?? failedCount;
                        const finalSuccess = data.successCount ?? successCount;

                        if (finalFailures === 0) {
                            toast.success(`All ${totalCount} emails sent successfully!`, {
                                title: 'Dispatch Completed',
                            });
                        } else {
                            toast.warning(`Dispatch completed: ${finalSuccess} sent, ${finalFailures} failed.`, {
                                title: 'Dispatch Completed with Warnings',
                            });
                        }
                    } else if (data.type === 'error') {
                        throw new Error(data.message || 'Stream dispatch error occurred');
                    }
                } catch (e: any) {
                    if (e && e.message && !e.message.includes('JSON')) {
                        throw e;
                    }
                    console.error("Error parsing stream line:", e, trimmedLine);
                }
            };

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");

                // Process all lines except the last potentially incomplete one
                buffer = lines.pop() || "";

                for (const line of lines) {
                    processLine(line);
                }
            }

            // Process any remaining data in buffer after stream ends
            if (buffer.trim()) {
                processLine(buffer);
                buffer = "";
            }

            // Ensure progress reaches 100% and success state is registered
            setSendingProgress(100);
            setIsDispatchSuccess(true);
            setIsSending(false);
            fetchHistory();

        } catch (error) {
            setIsSending(false);
            setIsDispatchSuccess(false);
            console.error('Dispatch error:', error);
            const errorMsg = error instanceof Error ? error.message : 'Unknown dispatch error occurred';
            setSendError(errorMsg);
            toast.error(errorMsg, {
                title: 'Dispatch Failed',
            });
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
            <div className="flex items-center justify-center min-h-screen bg-[#0D1117]">
                <ProtocolLoader label="Loading your account..." />
            </div>
        );
    }

    const stepLabels = [
        { num: 1, name: '1. Contacts' },
        { num: 2, name: '2. Message' },
        { num: 3, name: '3. Preview & Send' }
    ];

    return (
        <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3] flex flex-col lg:flex-row font-sans">
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
            <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[#161B22] border-b border-[#30363D] flex items-center justify-between px-4 z-[90]">
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-1.5 rounded-md text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D]"
                    aria-label="Open navigation menu"
                >
                    <Menu size={18} />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center">
                        <BrandLogo size={24} />
                    </div>
                    <span className="text-xs font-semibold text-[#E6EDF3]">iEmail</span>
                </div>
                <div className="w-6" /> {/* spacer */}
            </header>

            {/* Main Content Area */}
            <main className="flex-1 min-h-screen overflow-y-auto bg-[#0D1117] flex flex-col pt-14 lg:pt-0">
                {/* Desktop Workspace Topbar */}
                <div className="hidden lg:flex h-14 border-b border-[#30363D] bg-[#161B22]/60 px-8 items-center justify-between shrink-0">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-xs font-medium">
                        <span className="text-[#8B949E]">iEmail</span>
                        <span className="text-[#30363D]">/</span>
                        <span className="text-[#E6EDF3] font-semibold">
                            {view === 'templates' ? 'Templates' : stepLabels[step - 1]?.name}
                        </span>
                        {view === 'wizard' && file && (
                            <>
                                <span className="text-[#30363D]">/</span>
                                <span className="text-[#8B949E] font-mono text-[11px] truncate max-w-[200px]">
                                    {file.name}
                                </span>
                            </>
                        )}
                    </div>

                    {/* Step progress pills (when in wizard) */}
                    {view === 'wizard' && (
                        <div className="flex items-center gap-1.5">
                            {stepLabels.map((s, idx) => {
                                const isActive = step === s.num;
                                const isPassed = step > s.num;
                                return (
                                    <React.Fragment key={s.num}>
                                        <button
                                            onClick={() => {
                                                if (s.num === 1) setStep(1);
                                                if (s.num === 2 && file) setStep(2);
                                                if (s.num === 3 && file && subject && body) setStep(3);
                                            }}
                                            disabled={(s.num === 2 && !file) || (s.num === 3 && (!file || !subject || !body))}
                                            className={cn(
                                                "px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5",
                                                isActive
                                                    ? "bg-[#21262D] text-[#58A6FF] border border-[#58A6FF]/40 font-semibold"
                                                    : isPassed
                                                    ? "text-[#3FB950] hover:bg-[#21262D]"
                                                    : "text-[#8B949E] hover:bg-[#21262D] disabled:opacity-40 disabled:hover:bg-transparent"
                                            )}
                                        >
                                            <span className="w-4 h-4 rounded-full bg-[#30363D] flex items-center justify-center text-[10px] font-mono">
                                                {s.num}
                                            </span>
                                            <span>{s.name}</span>
                                        </button>
                                        {idx < stepLabels.length - 1 && (
                                            <span className="text-[#30363D] text-xs">→</span>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    )}

                    {/* Connected Account status */}
                    <div className="flex items-center gap-2 text-xs">
                        <span className="w-2 h-2 rounded-full bg-[#3FB950]" />
                        <span className="text-[#8B949E] font-mono text-[11px]">
                            {senderEmail || 'Guest Mode'}
                        </span>
                    </div>
                </div>

                {/* Workspace Body */}
                <div className={cn(
                    "flex-1 w-full mx-auto py-6 lg:py-8 px-4 sm:px-6 lg:px-8 transition-all duration-300",
                    step === 3 ? "max-w-none" : "max-w-7xl"
                )}>
                    {view === 'templates' ? (
                        <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.2 }}
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
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.15 }}
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
                                                isDispatchSuccess={isDispatchSuccess}
                                                onResetDispatch={() => {
                                                    setIsDispatchSuccess(false);
                                                    setSendingProgress(0);
                                                }}
                                                delayBetweenEmails={delayBetweenEmails}
                                                onDelayChange={setDelayBetweenEmails}
                                                recipientStatuses={recipientStatuses}
                                                history={dispatchHistory}
                                                onSend={handleSend}
                                                sendError={sendError}
                                                onClearSendError={() => setSendError(null)}
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
                                            <div className="flex flex-col items-center justify-center p-12 text-[#8B949E] space-y-4 h-[60vh] border border-dashed border-[#30363D] rounded-lg bg-[#161B22]">
                                                <LayoutDashboard size={48} className="text-[#8B949E]" />
                                                <div className="text-center space-y-2">
                                                    <h3 className="text-sm font-semibold text-[#E6EDF3]">No contacts uploaded yet</h3>
                                                    <p className="text-xs text-[#8B949E] max-w-sm">Please upload an Excel or CSV file with your contact list first.</p>
                                                    <Button variant="primary" onClick={() => setStep(1)} className="mt-2">
                                                        Upload Contact List
                                                    </Button>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            {/* Step Navigation Bar */}
                            <AnimatePresence>
                                {((step === 1 && file) || (step > 1 && step < 3)) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-8 flex justify-between items-center bg-[#161B22] p-4 rounded-lg border border-[#30363D] shadow-sm"
                                    >
                                        {step > 1 ? (
                                            <Button
                                                variant="secondary"
                                                onClick={prevStep}
                                                disabled={isSending}
                                                className="text-xs flex items-center gap-1.5"
                                            >
                                                <ChevronLeft size={14} /> Back
                                            </Button>
                                        ) : (
                                            <div />
                                        )}
                                        <Button
                                            variant="primary"
                                            onClick={nextStep}
                                            disabled={isNextDisabled() || isSending}
                                            className="text-xs flex items-center gap-1.5"
                                        >
                                            {step === 1 ? "Next: Write Email" : "Next: Preview & Send"} <ChevronRight size={14} />
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {step === 3 && !isSending && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-6 flex justify-start"
                                >
                                    <Button
                                        variant="secondary"
                                        onClick={prevStep}
                                        className="text-xs flex items-center gap-1.5 text-[#8B949E] hover:text-[#E6EDF3]"
                                    >
                                        <ChevronLeft size={14} /> Back to edit message
                                    </Button>
                                </motion.div>
                            )}
                        </>
                    )}
                </div>

                <Footer className="mt-auto" />
            </main>

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onLogin={handleConnectGoogle}
            />
        </div>
    );
}

