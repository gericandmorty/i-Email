import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail,
    Send,
    LogOut,
    User,
    ChevronDown,
    Plus,
    X,
    FileSpreadsheet,
    FileText,
    Check,
    PanelLeftClose,
    PanelLeft,
    CheckCircle2,
    Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BrandLogo } from './BrandLogo';

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

export const Sidebar: React.FC<SidebarProps> = ({
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
    const [isAccountPickerOpen, setIsAccountPickerOpen] = useState(false);
    const activeAccount = connectedAccounts.find(a => a.email?.toLowerCase() === senderEmail?.toLowerCase());
    const fullName = activeAccount?.name || senderName || 'Connected User';
    const profilePicture = activeAccount?.picture || senderPicture;

    const navItems = [
        {
            id: 'recipients',
            name: '1. Contact List',
            desc: file ? `${excelData ? excelData.data.length : 0} contacts` : 'Upload a file',
            icon: FileSpreadsheet,
            active: view === 'wizard' && step === 1,
            completed: !!file,
            disabled: false,
            onClick: () => {
                setView('wizard');
                setStep(1);
            }
        },
        {
            id: 'compose',
            name: '2. Write Email',
            desc: subject ? subject.slice(0, 18) + (subject.length > 18 ? '...' : '') : 'Draft message',
            icon: Mail,
            active: view === 'wizard' && step === 2,
            completed: !!file && !!subject && !!body,
            disabled: !file,
            onClick: () => {
                if (file) {
                    setView('wizard');
                    setStep(2);
                }
            }
        },
        {
            id: 'review',
            name: '3. Preview & Send',
            desc: 'Check and send',
            icon: Send,
            active: view === 'wizard' && step === 3,
            completed: false,
            disabled: !file || !subject || !body,
            onClick: () => {
                if (file && subject && body) {
                    setView('wizard');
                    setStep(3);
                }
            }
        }
    ];

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
                        className="fixed inset-0 bg-[#04070A]/80 z-[100] lg:hidden"
                    />
                )}
            </AnimatePresence>

            <aside
                className={cn(
                    "fixed lg:sticky top-0 inset-y-0 left-0 z-[101] bg-[#161B22] border-r border-[#30363D] flex flex-col transition-all duration-200 select-none",
                    isSidebarExpanded ? "w-64" : "w-16",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Header */}
                <div className="h-14 border-b border-[#30363D] flex items-center justify-between px-3.5 shrink-0">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                            <BrandLogo size={28} />
                        </div>
                        {isSidebarExpanded && (
                            <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-xs tracking-tight text-[#E6EDF3] truncate">
                                    iEmail
                                </span>
                                <span className="text-[10px] text-[#8B949E] truncate">
                                    Bulk email sender
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Toggle expand button (desktop) / close button (mobile) */}
                    <div className="flex items-center">
                        <button
                            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                            className="hidden lg:flex p-1.5 rounded-md text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D] transition-colors"
                            title={isSidebarExpanded ? "Collapse menu" : "Expand menu"}
                        >
                            {isSidebarExpanded ? <PanelLeftClose size={15} /> : <PanelLeft size={15} />}
                        </button>
                        <button
                            onClick={onMobileMenuToggle}
                            className="lg:hidden p-1.5 rounded-md text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D] transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Account & Profile Switcher */}
                <div className="p-3 border-b border-[#30363D] relative shrink-0">
                    <div
                        onClick={() => isSidebarExpanded && setIsAccountPickerOpen(!isAccountPickerOpen)}
                        className={cn(
                            "flex items-center gap-2.5 p-1.5 rounded-md border border-[#30363D] bg-[#0D1117] transition-colors",
                            isSidebarExpanded ? "cursor-pointer hover:border-[#58A6FF]/40" : "justify-center"
                        )}
                    >
                        <div className="w-6 h-6 rounded-full bg-[#21262D] border border-[#30363D] overflow-hidden flex items-center justify-center shrink-0">
                            {profilePicture ? (
                                <img src={profilePicture} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <User size={13} className="text-[#8B949E]" />
                            )}
                        </div>

                        {isSidebarExpanded && (
                            <>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium text-[#E6EDF3] truncate leading-tight">
                                        {fullName}
                                    </div>
                                    <div className="text-[10px] text-[#8B949E] font-mono truncate">
                                        {senderEmail || 'Not connected'}
                                    </div>
                                </div>
                                <ChevronDown size={13} className="text-[#8B949E] shrink-0" />
                            </>
                        )}
                    </div>

                    {/* Account picker dropdown */}
                    <AnimatePresence>
                        {isAccountPickerOpen && isSidebarExpanded && (
                            <motion.div
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 4 }}
                                className="absolute top-full left-3 right-3 mt-1 bg-[#161B22] border border-[#30363D] rounded-md shadow-xl py-1 z-50 text-xs"
                            >
                                <div className="px-3 py-1.5 text-[10px] font-semibold text-[#8B949E] uppercase tracking-wider border-b border-[#30363D]">
                                    Your Google Accounts
                                </div>

                                <div className="max-h-40 overflow-y-auto">
                                    {connectedAccounts.map((acc: any) => {
                                        const isCurrent = acc.email?.toLowerCase() === senderEmail?.toLowerCase();
                                        return (
                                            <button
                                                key={acc.email}
                                                onClick={() => {
                                                    onSenderEmailChange(acc.email);
                                                    if (acc.name) onSenderNameChange(acc.name);
                                                    setIsAccountPickerOpen(false);
                                                }}
                                                className={cn(
                                                    "w-full px-3 py-1.5 flex items-center justify-between text-left hover:bg-[#21262D] transition-colors",
                                                    isCurrent ? "text-[#58A6FF]" : "text-[#E6EDF3]"
                                                )}
                                            >
                                                <div className="truncate mr-2">
                                                    <span className="block truncate font-medium">{acc.name || acc.email}</span>
                                                    <span className="block text-[10px] text-[#8B949E] font-mono truncate">{acc.email}</span>
                                                </div>
                                                {isCurrent && <Check size={13} className="shrink-0" />}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="border-t border-[#30363D] pt-1 mt-1">
                                    <button
                                        onClick={() => {
                                            setIsAccountPickerOpen(false);
                                            onConnectGoogle();
                                        }}
                                        className="w-full px-3 py-1.5 text-left text-xs text-[#58A6FF] hover:bg-[#21262D] flex items-center gap-1.5"
                                    >
                                        <Plus size={13} />
                                        <span>Add another Google account</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            setIsAccountPickerOpen(false);
                                            handleLogout();
                                        }}
                                        className="w-full px-3 py-1.5 text-left text-xs text-[#F85149] hover:bg-[#21262D] flex items-center gap-1.5"
                                    >
                                        <LogOut size={13} />
                                        <span>Sign out</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto p-2 space-y-5 custom-scrollbar">
                    {/* Workflow section */}
                    <div className="space-y-1">
                        {isSidebarExpanded && (
                            <div className="px-2.5 py-1 text-[11px] font-semibold text-[#8B949E] tracking-wider uppercase">
                                Steps
                            </div>
                        )}

                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                disabled={item.disabled}
                                onClick={item.onClick}
                                className={cn(
                                    "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs transition-colors relative text-left",
                                    item.active
                                        ? "bg-[#21262D] text-[#E6EDF3] font-semibold"
                                        : "text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D]/50 font-normal",
                                    item.disabled && "opacity-40 cursor-not-allowed hover:bg-transparent hover:text-[#8B949E]"
                                )}
                                title={!isSidebarExpanded ? item.name : undefined}
                            >
                                {item.active && (
                                    <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#58A6FF] rounded-r" />
                                )}

                                <item.icon size={15} className={cn("shrink-0", item.active ? "text-[#58A6FF]" : "")} />

                                {isSidebarExpanded && (
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="truncate">{item.name}</span>
                                            {item.completed && !item.active && (
                                                <CheckCircle2 size={12} className="text-[#3FB950] shrink-0" />
                                            )}
                                        </div>
                                        <span className="text-[10px] text-[#8B949E] block truncate">
                                            {item.desc}
                                        </span>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Templates section */}
                    <div className="space-y-1">
                        {isSidebarExpanded && (
                            <div className="px-2.5 py-1 text-[11px] font-semibold text-[#8B949E] tracking-wider uppercase">
                                Saved Work
                            </div>
                        )}

                        <button
                            onClick={() => setView('templates')}
                            className={cn(
                                "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs transition-colors relative text-left",
                                view === 'templates'
                                    ? "bg-[#21262D] text-[#E6EDF3] font-semibold"
                                    : "text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D]/50 font-normal"
                            )}
                            title={!isSidebarExpanded ? "Templates" : undefined}
                        >
                            {view === 'templates' && (
                                <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#58A6FF] rounded-r" />
                            )}
                            <FileText size={15} className={cn("shrink-0", view === 'templates' ? "text-[#58A6FF]" : "")} />
                            {isSidebarExpanded && (
                                <div className="flex-1 min-w-0">
                                    <span className="block truncate">Templates</span>
                                    <span className="text-[10px] text-[#8B949E] block truncate">
                                        Saved email templates
                                    </span>
                                </div>
                            )}
                        </button>
                    </div>

                    {/* Quick Recipient File Action */}
                    {isSidebarExpanded && (
                        <div className="p-2.5 rounded-md bg-[#0D1117] border border-[#30363D] space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-medium text-[#E6EDF3]">Current File</span>
                                <span className="text-[10px] text-[#8B949E]">
                                    {file ? `${(file.size / 1024).toFixed(0)} KB` : 'None'}
                                </span>
                            </div>

                            <p className="text-[11px] text-[#8B949E] truncate">
                                {file ? file.name : "No file chosen"}
                            </p>

                            <button
                                onClick={() => document.getElementById('sidebar-file-upload')?.click()}
                                className="w-full h-7 px-2 bg-[#21262D] hover:bg-[#30363D] text-[#C9D1D9] hover:text-white border border-[#30363D] rounded text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                                <Upload size={12} />
                                <span>{file ? "Change file" : "Upload contacts"}</span>
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

                {/* Sidebar Bottom Footer */}
                <div className="p-3 border-t border-[#30363D] shrink-0">
                    {isSidebarExpanded ? (
                        <div className="flex items-center justify-between text-xs text-[#8B949E]">
                            <button
                                onClick={() => handleLogout()}
                                className="flex items-center gap-1.5 hover:text-[#F85149] transition-colors"
                            >
                                <LogOut size={13} />
                                <span>Sign out</span>
                            </button>
                            <span className="text-[10px] font-mono">iEmail</span>
                        </div>
                    ) : (
                        <button
                            onClick={() => handleLogout()}
                            className="w-full flex justify-center py-1 text-[#8B949E] hover:text-[#F85149] transition-colors"
                            title="Sign out"
                        >
                            <LogOut size={15} />
                        </button>
                    )}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
