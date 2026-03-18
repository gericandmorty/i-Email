import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Button } from './ui-components';
import { Mail, Type, Paperclip, X, Image as ImageIcon, Loader2, Bold, Italic, List, ListOrdered, Sparkles, LayoutDashboard, ChevronDown, Save, Plus, Search, FileText, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { EmailEditor } from './EmailEditor';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface GoogleAccount {
    email: string;
    name: string | null;
    picture: string | null;
}

interface Template {
    id: string;
    name: string;
    subject: string;
    body: string;
    created_at: string;
}

interface TemplateStepProps {
    subject: string;
    body: string;
    onSubjectChange: (val: string) => void;
    onBodyChange: (val: string) => void;
    attachments: File[];
    senderName: string;
    onSenderNameChange: (val: string) => void;
    senderEmail: string;
    onSenderEmailChange: (val: string) => void;
    onAddAttachments: (files: File[]) => void;
    onRemoveAttachment: (index: number) => void;
    onClearAttachments: () => void;
    connectedAccounts: GoogleAccount[];
    onConnectGoogle: () => void;
    placeholders?: string[];
    mapping: { email: string; name: string };
    onMappingChange: (mapping: { email: string; name: string }) => void;
    delayBetweenEmails: number;
    onDelayChange: (delay: number) => void;
}

export const TemplateStep: React.FC<TemplateStepProps> = ({
    subject,
    body,
    onSubjectChange,
    onBodyChange,
    senderName,
    onSenderNameChange,
    senderEmail,
    onSenderEmailChange,
    attachments,
    onAddAttachments,
    onRemoveAttachment,
    onClearAttachments,
    connectedAccounts,
    onConnectGoogle,
    placeholders = [],
    mapping,
    onMappingChange,
    delayBetweenEmails,
    onDelayChange,
}) => {
    const [isUploading, setIsUploading] = useState(false);

    // Template Management State
    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const fetchTemplates = async () => {
        if (!senderEmail) return;
        setIsLoadingTemplates(true);
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
        try {
            const res = await fetch(`${baseUrl}/templates?email=${senderEmail}`);
            if (res.ok) {
                const data = await res.json();
                setTemplates(data.templates);
            }
        } catch (error) {
            console.error("Failed to fetch templates", error);
        } finally {
            setIsLoadingTemplates(false);
        }
    };

    const handleSaveTemplate = async (isNew: boolean = false) => {
        if (!senderEmail) return;

        const templateData = {
            email: senderEmail,
            name: isNew ? "Untitled Blueprint" : (templates.find(t => t.id === selectedTemplateId)?.name || "Untitled Blueprint"),
            subject: subject,
            body: body
        };

        setIsSavingTemplate(true);
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
        try {
            const method = (!isNew && selectedTemplateId) ? 'PUT' : 'POST';
            const url = (!isNew && selectedTemplateId)
                ? `${baseUrl}/templates/${selectedTemplateId}`
                : `${baseUrl}/templates`;

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(templateData)
            });

            if (res.ok) {
                if (method === 'POST') {
                    const data = await res.json();
                    if (data.id) setSelectedTemplateId(data.id);
                }
                fetchTemplates();
            }
        } catch (error) {
            console.error("Failed to save template", error);
        } finally {
            setIsSavingTemplate(false);
        }
    };


    const loadTemplate = (template: Template) => {
        onSubjectChange(template.subject);
        onBodyChange(template.body);
        setSelectedTemplateId(template.id);
        onClearAttachments();
    };

    useEffect(() => {
        if (senderEmail) {
            fetchTemplates();
        }
    }, [senderEmail]);

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredTemplates.length / ITEMS_PER_PAGE);
    const paginatedTemplates = filteredTemplates.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset to page 1 when search query changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);


    const compressImage = (file: File): Promise<File> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Max dimension 800px (aggressive for Gmail limits)
                    const MAX_DIM = 800;
                    if (width > height) {
                        if (width > MAX_DIM) {
                            height *= MAX_DIM / width;
                            width = MAX_DIM;
                        }
                    } else {
                        if (height > MAX_DIM) {
                            width *= MAX_DIM / height;
                            height = MAX_DIM;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                                type: 'image/jpeg',
                                lastModified: Date.now()
                            });
                            resolve(compressedFile);
                        } else {
                            resolve(file);
                        }
                    }, 'image/jpeg', 0.6); // 60% quality
                };
            };
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setIsUploading(true);
            const files = Array.from(e.target.files);
            const processedFiles = await Promise.all(
                files.map(async (f) => {
                    if (f.type.startsWith('image/') && f.size > 1024 * 1024) { // Only compress if > 1MB
                        return await compressImage(f);
                    }
                    return f;
                })
            );
            onAddAttachments(processedFiles);
            setIsUploading(false);
            e.target.value = '';
        }
    };


    const isImage = (file: File) => file.type.startsWith('image/');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 h-full min-h-[600px]">
            {/* Sidebar: Template Library */}
            <div className="lg:col-span-4 flex flex-col gap-4 min-h-[400px] lg:min-h-0 lg:h-fit">
                <Card className="border-none bg-white shadow-xl shadow-[#213448]/5 overflow-hidden rounded-[24px] flex flex-col h-fit transition-all duration-300">
                    <CardHeader className="p-6 border-b border-[#547792]/5">
                        <div className="flex items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-2">
                                <LayoutDashboard size={20} className="text-[#94B4C1]" />
                                <CardTitle className="tracking-tight text-lg font-black uppercase">Blueprints</CardTitle>
                            </div>
                            <Button
                                onClick={() => handleSaveTemplate(true)}
                                className="h-8 px-3 bg-[#213448] text-[#EAE0CF] hover:bg-[#547792] rounded-lg text-[9px] font-black uppercase tracking-widest"
                                disabled={!senderEmail}
                            >
                                <Plus size={14} className="mr-1" /> NEW
                            </Button>
                        </div>
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94B4C1]" />
                            <Input
                                placeholder="SEARCH..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-[#EAE0CF]/10 pl-9 h-9 rounded-xl border-none text-[10px] font-bold uppercase tracking-widest placeholder:text-[#94B4C1]/50"
                            />
                        </div>
                    </CardHeader>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                        {isLoadingTemplates ? (
                            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#94B4C1]" /></div>
                        ) : filteredTemplates.length === 0 ? (
                            <div className="p-8 text-center border-2 border-dashed border-[#547792]/10 rounded-2xl text-[#94B4C1] font-bold text-[10px] uppercase tracking-widest">
                                No blueprints found.
                            </div>
                        ) : (
                            <>
                                {paginatedTemplates.map(t => (
                                    <div
                                        key={t.id}
                                        onClick={() => loadTemplate(t)}
                                        className={cn(
                                            "p-4 rounded-xl cursor-pointer transition-all border-2 group relative",
                                            selectedTemplateId === t.id
                                                ? "bg-[#213448] border-[#213448] text-[#EAE0CF] shadow-lg"
                                                : "bg-white border-transparent hover:border-[#94B4C1]/20 text-[#213448]"
                                        )}
                                    >
                                        <h3 className="font-black text-xs uppercase tracking-tight truncate pr-6">{t.name}</h3>
                                        <p className={cn("text-[9px] uppercase tracking-widest truncate mt-1", selectedTemplateId === t.id ? "text-[#94B4C1]" : "text-[#94B4C1]")}>
                                            {t.subject}
                                        </p>
                                    </div>
                                ))}

                                {totalPages > 1 && (
                                    <div className="pt-4 mt-2 border-t border-[#547792]/5 flex items-center justify-between px-1">
                                        <div className="text-[8px] font-black text-[#94B4C1] uppercase tracking-widest">
                                            Page {currentPage} / {totalPages}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentPage === 1}
                                                className="h-7 w-7 rounded-lg hover:bg-[#EAE0CF] text-[#213448] disabled:opacity-30"
                                            >
                                                <ChevronLeft size={14} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                disabled={currentPage === totalPages}
                                                className="h-7 w-7 rounded-lg hover:bg-[#EAE0CF] text-[#213448] disabled:opacity-30"
                                            >
                                                <ChevronRight size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </Card>

                {/* Column Mapping Section */}
                <Card className="border-none bg-white shadow-xl shadow-[#213448]/5 overflow-hidden rounded-[24px] p-6 space-y-4 h-fit">
                    <div className="flex items-center gap-2 mb-2">
                        <User size={18} className="text-[#94B4C1]" />
                        <CardTitle className="tracking-tight text-sm font-black uppercase">Column Mapping</CardTitle>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-[#94B4C1] uppercase tracking-widest">Email Column</label>
                            <div className="relative">
                                <select
                                    value={mapping.email}
                                    onChange={(e) => onMappingChange({ ...mapping, email: e.target.value })}
                                    className="w-full bg-[#EAE0CF]/20 border-2 border-[#547792]/5 rounded-xl px-3 py-2 text-[10px] font-bold text-[#213448] appearance-none cursor-pointer focus:outline-none focus:border-[#94B4C1]/30 transition-all"
                                >
                                    <option value="" disabled>Select Email Field</option>
                                    {placeholders.map((header) => (
                                        <option key={header} value={header}>{header}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94B4C1] pointer-events-none" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-[#94B4C1] uppercase tracking-widest">Name Column (Optional)</label>
                            <div className="relative">
                                <select
                                    value={mapping.name}
                                    onChange={(e) => onMappingChange({ ...mapping, name: e.target.value })}
                                    className="w-full bg-[#EAE0CF]/20 border-2 border-[#547792]/5 rounded-xl px-3 py-2 text-[10px] font-bold text-[#213448] appearance-none cursor-pointer focus:outline-none focus:border-[#94B4C1]/30 transition-all"
                                >
                                    <option value="">None (Generic MR/MS)</option>
                                    {placeholders.map((header) => (
                                        <option key={header} value={header}>{header}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94B4C1] pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Dispatch Settings */}
                <Card className="border-none bg-white shadow-xl shadow-[#213448]/5 overflow-hidden rounded-[24px] p-6 space-y-4 h-fit">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles size={18} className="text-[#94B4C1]" />
                        <CardTitle className="tracking-tight text-sm font-black uppercase">Dispatch Settings</CardTitle>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-[9px] font-black text-[#94B4C1] uppercase tracking-widest">Anti-Spam Delay</label>
                            <span className="text-[10px] font-black text-[#213448] bg-[#EAE0CF] px-2 py-0.5 rounded-md">{delayBetweenEmails}s</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="10"
                            step="0.5"
                            value={delayBetweenEmails}
                            onChange={(e) => onDelayChange(parseFloat(e.target.value))}
                            className="w-full accent-[#94B4C1] h-1.5 bg-[#213448]/10 rounded-full appearance-none cursor-pointer"
                        />
                        <p className="text-[8px] font-bold text-[#94B4C1]/60 uppercase leading-tight">
                            Recommended: 2.0s - 5.0s to avoid triggering spam filters.
                        </p>
                    </div>
                </Card>
            </div>

            {/* Main: Composer Area */}
            <div className="lg:col-span-8 flex flex-col h-full gap-6">
                <Card className="border-none bg-white shadow-xl shadow-[#213448]/5 overflow-hidden rounded-[24px] sm:rounded-[32px] flex-1 flex flex-col">
                    <CardHeader className="p-5 sm:p-8 pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-[#EAE0CF] text-[#547792] rounded-2xl border-2 border-[#547792]/10 w-fit">
                                    <Mail size={24} className="sm:w-6 sm:h-6" />
                                </div>
                                <div>
                                    <CardTitle className="tracking-tighter text-2xl sm:text-3xl font-black uppercase">Email Architect</CardTitle>
                                    <CardDescription className="text-[9px] sm:text-[10px] uppercase tracking-widest font-black text-[#94B4C1]">
                                        Constructing {selectedTemplateId ? templates.find(t => t.id === selectedTemplateId)?.name : 'Fresh Campaign'}
                                    </CardDescription>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={() => handleSaveTemplate(false)}
                                    disabled={!subject || !body || isSavingTemplate}
                                    className="bg-[#213448] text-[#EAE0CF] hover:bg-[#547792] rounded-xl h-10 px-4 font-black uppercase tracking-widest text-[10px]"
                                >
                                    {isSavingTemplate ? <Loader2 size={14} className="animate-spin mr-2" /> : <Save size={14} className="mr-2" />}
                                    {selectedTemplateId ? "Update" : "Save"}
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 p-5 sm:p-8 pt-0 flex-1 flex flex-col">

                        <div className="space-y-2">
                            <Label className="text-[#547792] font-black uppercase tracking-widest text-[8px]">Subject</Label>
                            <Input
                                value={subject}
                                onChange={(e) => onSubjectChange(e.target.value)}
                                className="h-10 text-xs font-bold bg-[#EAE0CF]/10 border-none rounded-xl"
                                placeholder="Enter subject line..."
                            />
                        </div>

                        <div className="flex-1 min-h-[300px] flex flex-col">
                            <EmailEditor
                                value={body}
                                onChange={onBodyChange}
                                placeholder="Message..."
                                placeholders={placeholders}
                                className="flex-1"
                                onAttach={onAddAttachments}
                            />
                        </div>

                        {/* Attachments */}
                        <AnimatePresence>
                            {attachments.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="flex flex-wrap gap-2 pt-4 border-t border-[#547792]/5"
                                >
                                    {attachments.map((file, index) => (
                                        <div key={index} className="flex items-center gap-2 pl-3 pr-2 py-1.5 bg-[#213448] text-[#EAE0CF] rounded-lg text-[9px] font-black uppercase tracking-widest">
                                            <span className="truncate max-w-[120px]">{file.name}</span>
                                            <button onClick={() => onRemoveAttachment(index)} className="hover:text-red-400">
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
