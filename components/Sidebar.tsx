import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Mail,
    Send,
    Paperclip,
    LogOut,
    User,
    ChevronDown,
    Plus,
    Menu,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
    isSidebarExpanded: boolean;
    setIsSidebarExpanded: (expanded: boolean) => void;
    senderEmail: string | null;
    senderName: string | null;
    senderPicture: string | null;
    connectedAccounts: any[];
    handleLogout: (email?: string) => void;
    onConnectGoogle: () => void;
    view: 'wizard' | 'templates';
    setView: (view: 'wizard' | 'templates') => void;
    step: number;
    setStep: (step: number) => void;
    file: File | null;
    excelData: any;
    subject: string;
    body: string;
    onSenderEmailChange: (val: string) => void;
    onSenderNameChange: (val: string) => void;
    handleSidebarFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isMobileMenuOpen?: boolean;
    onMobileMenuToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    isSidebarExpanded,
    setIsSidebarExpanded,
    senderEmail,
    senderName,
    senderPicture,
    connectedAccounts,
    handleLogout,
    onConnectGoogle,
    view,
    setView,
    step,
    setStep,
    file,
    excelData,
    subject,
    body,
    onSenderEmailChange,
    onSenderNameChange,
    handleSidebarFileSelect,
    isMobileMenuOpen = false,
    onMobileMenuToggle
}) => {
    const [isAccountPickerOpen, setIsAccountPickerOpen] = React.useState(false);
    const activeAccount = connectedAccounts.find(a => a.email.toLowerCase() === senderEmail?.toLowerCase());
    const fullName = activeAccount?.name || senderName || 'User';
    const profilePicture = activeAccount?.picture || senderPicture;
    const displayName = fullName.split(' ')[0];

    return (
        <>
            {/* Mobile Backdrop */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onMobileMenuToggle}
                        className="fixed inset-0 bg-[#213448]/60 backdrop-blur-sm z-[100] lg:hidden"
                    />
                )}
            </AnimatePresence>

            <motion.aside
                initial={false}
                animate={{
                    width: isSidebarExpanded ? 280 : 70,
                    x: typeof window !== 'undefined' && window.innerWidth < 1024 ? (isMobileMenuOpen ? 0 : -300) : 0
                }}
                transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                className={cn(
                    "h-screen sticky top-0 bg-[#213448] text-[#EAE0CF] flex-col border-r border-[#547792] overflow-visible z-[101] shadow-2xl",
                    "fixed lg:sticky inset-y-0 left-0 lg:translate-x-0 transition-transform duration-300",
                    isMobileMenuOpen ? "translate-x-0 flex" : "-translate-x-full lg:flex"
                )}
            >
                <div className={cn(
                    "flex flex-col h-full transition-all duration-300",
                    isSidebarExpanded ? "p-6 lg:p-8" : "p-3"
                )}>
                    <div className="flex flex-col flex-1 min-h-0">
                        <header className={cn(
                            "flex items-center shrink-0 mb-10 relative w-full",
                            isSidebarExpanded ? "justify-between gap-4 lg:justify-start lg:gap-3" : "justify-center"
                        )}>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                                className="hidden lg:flex w-11 h-11 bg-[#94B4C1] text-[#213448] rounded-2xl shadow-xl hover:shadow-2xl transition-all border border-[#EAE0CF]/10 shrink-0 items-center justify-center z-20"
                            >
                                <Mail size={20} className="transition-transform duration-500" />
                            </motion.button>

                            {/* Mobile Close Button */}
                            <button
                                onClick={onMobileMenuToggle}
                                className="lg:hidden w-11 h-11 bg-[#94B4C1] text-[#213448] rounded-2xl flex items-center justify-center shrink-0 mr-2"
                            >
                                <X size={20} />
                            </button>

                            <AnimatePresence mode="wait">
                                {isSidebarExpanded && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="flex-1 lg:flex-none flex items-center justify-end lg:justify-start min-w-0"
                                    >
                                        {senderEmail ? (
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <div
                                                    className={cn(
                                                        "flex items-center gap-2.5 bg-[#547792]/30 p-1.5 pr-4 rounded-full border border-[#547792] transition-all flex-1 min-w-0 text-left group"
                                                    )}
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-[#94B4C1] border border-[#EAE0CF]/10 overflow-hidden flex items-center justify-center shrink-0 shadow-lg">
                                                        {profilePicture ? (
                                                            <img
                                                                src={profilePicture}
                                                                alt=""
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <User size={14} className="text-[#213448]" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col min-w-0 flex-1">
                                                        <span className="text-[10px] font-black text-[#EAE0CF] truncate uppercase tracking-tight leading-none mb-0.5">
                                                            {displayName}
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-[8px] text-[#94B4C1] font-black uppercase tracking-widest truncate">
                                                                {activeAccount ? 'Auth' : 'Account'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleLogout()}
                                                    className="w-10 h-10 rounded-full bg-[#547792]/30 border border-[#547792] flex items-center justify-center text-[#94B4C1] hover:text-white hover:bg-red-500/10 transition-all shrink-0 group"
                                                    title="Logout"
                                                >
                                                    <LogOut size={16} className="group-hover:rotate-12 transition-transform" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-0 px-2 min-w-0">
                                                <span className="text-lg font-black tracking-tighter text-[#EAE0CF] truncate">EMAIL SEEDER</span>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </header>

                        <nav className="space-y-8">
                            {/* Templates Mode Toggle (Always Available) */}
                            <div className={cn(
                                "flex items-center gap-6 group cursor-pointer shrink-0 transition-all duration-300",
                                !isSidebarExpanded && "justify-center gap-0"
                            )} onClick={() => setView('templates')}>
                                <div className="relative">
                                    <motion.div
                                        animate={{
                                            scale: view === 'templates' ? 1.1 : 1,
                                            backgroundColor: view === 'templates' ? "#94B4C1" : "transparent",
                                            borderColor: view === 'templates' ? "#94B4C1" : "#547792"
                                        }}
                                        className={cn(
                                            "w-11 h-11 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 shrink-0",
                                            view === 'templates' ? "text-[#213448]" : "text-[#94B4C1]"
                                        )}
                                    >
                                        <LayoutDashboard size={20} strokeWidth={view === 'templates' ? 2.5 : 2} />
                                    </motion.div>
                                </div>
                                <AnimatePresence>
                                    {isSidebarExpanded && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            className="flex flex-col min-w-0"
                                        >
                                            <span className={cn(
                                                "font-bold text-sm tracking-tight transition-colors truncate",
                                                view === 'templates' ? "text-[#EAE0CF]" : "text-[#94B4C1] group-hover:text-[#EAE0CF]"
                                            )}>
                                                Templates
                                            </span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="w-full h-[1px] bg-[#547792]/50 my-4 shrink-0" />

                            {/* Recipient List Module */}
                            <div className="space-y-3 shrink-0">
                                {isSidebarExpanded && <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#94B4C1] ml-1">Recipient List</label>}
                                <div
                                    className={cn(
                                        "group flex items-center gap-4 p-3 rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden",
                                        view === 'wizard' && step === 1 ? "bg-[#94B4C1] border-[#94B4C1] text-[#213448]" : "bg-transparent border-[#547792] text-[#94B4C1] hover:border-[#94B4C1]/50",
                                        !isSidebarExpanded && "justify-center p-2.5"
                                    )}
                                    onClick={() => { setView('wizard'); setStep(1); }}
                                >
                                    <LayoutDashboard size={20} className={cn("shrink-0", view === 'wizard' && step === 1 ? "text-[#213448]" : "text-[#94B4C1]")} />
                                    {isSidebarExpanded && (
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <span className={cn("text-xs font-black uppercase tracking-tight truncate", view === 'wizard' && step === 1 ? "text-[#213448]" : "text-[#EAE0CF]")}>
                                                {file ? file.name : "No File Uploaded"}
                                            </span>
                                            <span className="text-[10px] font-bold opacity-70 italic truncate">
                                                {excelData ? `${excelData.data.length} Contacts` : "Awaiting Excel"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                {isSidebarExpanded && (
                                    <div className="px-1 flex gap-3">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); document.getElementById('sidebar-file-upload')?.click(); }}
                                            className="text-[9px] font-black uppercase tracking-widest text-[#94B4C1] hover:text-[#EAE0CF] transition-colors flex items-center gap-1.5"
                                        >
                                            <Paperclip size={10} />
                                            {file ? "Change File" : "Upload Excel"}
                                        </button>
                                        <input
                                            id="sidebar-file-upload"
                                            type="file"
                                            accept=".xlsx,.xls,.csv"
                                            className="hidden"
                                            onChange={handleSidebarFileSelect}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Compose Module */}
                            <div className="space-y-3 shrink-0">
                                {isSidebarExpanded && <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#94B4C1] ml-1">Compose</label>}
                                <div
                                    className={cn(
                                        "group flex items-center gap-4 p-3 rounded-2xl border-2 transition-all duration-500 cursor-pointer",
                                        view === 'wizard' && step === 2 ? "bg-[#94B4C1] border-[#94B4C1] text-[#213448]" : "bg-transparent border-[#547792] text-[#94B4C1] hover:border-[#94B4C1]/50",
                                        !file && "opacity-40 cursor-not-allowed",
                                        !isSidebarExpanded && "justify-center p-2.5"
                                    )}
                                    onClick={() => { if (file) { setView('wizard'); setStep(2); } }}
                                >
                                    <Mail size={20} className={cn("shrink-0", view === 'wizard' && step === 2 ? "text-[#213448]" : "text-[#94B4C1]")} />
                                    {isSidebarExpanded && (
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <span className={cn("text-xs font-black uppercase tracking-tight truncate", view === 'wizard' && step === 2 ? "text-[#213448]" : "text-[#EAE0CF]")}>
                                                Message Editor
                                            </span>
                                            <span className="text-[10px] font-bold opacity-70 italic truncate">
                                                Write your email
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Review & Send Module */}
                            <div className="space-y-3 shrink-0">
                                {isSidebarExpanded && <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#94B4C1] ml-1">Final Review</label>}
                                <div
                                    className={cn(
                                        "group flex items-center gap-4 p-3 rounded-2xl border-2 transition-all duration-500 cursor-pointer",
                                        view === 'wizard' && step === 3 ? "bg-[#94B4C1] border-[#94B4C1] text-[#213448]" : "bg-transparent border-[#547792] text-[#94B4C1] hover:border-[#94B4C1]/50",
                                        (!file || !subject || !body) && "opacity-40 cursor-not-allowed",
                                        !isSidebarExpanded && "justify-center p-2.5"
                                    )}
                                    onClick={() => { if (file && subject && body) { setView('wizard'); setStep(3); } }}
                                >
                                    <Send size={20} className={cn("shrink-0", view === 'wizard' && step === 3 ? "text-[#213448]" : "text-[#94B4C1]")} />
                                    {isSidebarExpanded && (
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <span className={cn("text-xs font-black uppercase tracking-tight truncate", view === 'wizard' && step === 3 ? "text-[#213448]" : "text-[#EAE0CF]")}>
                                                Review & Send
                                            </span>
                                            <span className="text-[10px] font-bold opacity-70 italic truncate">
                                                Final Preview
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </nav>
                    </div>
                </div>
            </motion.aside>
        </>
    );
};

export default Sidebar;
