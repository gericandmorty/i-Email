import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button, Input, Label } from './ui-components';
import { EmailEditor } from './EmailEditor';
import { LayoutDashboard, Plus, Trash2, Search, FileText, Loader2, Save, Sparkles, ChevronDown, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Template {
    id: string;
    name: string;
    subject: string;
    body: string;
    created_at: string;
}

interface TemplatesViewProps {
    senderEmail: string;
    onUseTemplate?: (template: Template) => void;
    placeholders?: string[];
    mapping?: { email: string; name: string };
    onMappingChange?: (mapping: { email: string; name: string }) => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({
    senderEmail,
    onUseTemplate,
    placeholders = [],
    mapping = { email: '', name: '' },
    onMappingChange
}) => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

    // Draft State for In-line Editing
    const [draftTemplate, setDraftTemplate] = useState<Template | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [attachments, setAttachments] = useState<File[]>([]);
    const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);

    // Initial Fetch
    const fetchTemplates = async () => {
        if (!senderEmail) return;
        setIsLoading(true);
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
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, [senderEmail]);

    // Sync selected template to draft when selection changes
    useEffect(() => {
        if (selectedTemplate) {
            setDraftTemplate({ ...selectedTemplate });
            setHasUnsavedChanges(false);
        } else {
            setDraftTemplate(null);
        }
    }, [selectedTemplate]);

    // Handle Draft Field Changes
    const updateDraft = (field: keyof Template, value: string) => {
        if (!draftTemplate) return;
        setDraftTemplate(prev => prev ? ({ ...prev, [field]: value }) : null);
        setHasUnsavedChanges(true);
    };

    // Save Changes (Update Existing)
    const handleSaveChanges = async () => {
        if (!draftTemplate || !senderEmail) return;
        setIsSaving(true);
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
        try {
            const url = `${baseUrl}/templates/${draftTemplate.id}`;
            const res = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: senderEmail,
                    name: draftTemplate.name,
                    subject: draftTemplate.subject,
                    body: draftTemplate.body
                })
            });

            if (res.ok) {
                // Update local list
                setTemplates(prev => prev.map(t => t.id === draftTemplate.id ? draftTemplate : t));
                setSelectedTemplate(draftTemplate); // Re-sync
                setHasUnsavedChanges(false);
            } else {
                const err = await res.text();
                alert(`Error saving: ${err}`);
            }
        } catch (error) {
            alert(`Failed to save: ${error}`);
        } finally {
            setIsSaving(false);
        }
    };

    // Create New Template (Create Placeholder -> Select it)
    const handleCreateNew = async () => {
        if (!senderEmail) return;
        setIsLoading(true);
        try {
            const newTemp = {
                name: "Untitled Blueprint",
                subject: "New Subject",
                body: "<p>Start writing...</p>"
            };

            const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
            const res = await fetch(`${baseUrl}/templates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: senderEmail,
                    ...newTemp
                })
            });

            if (res.ok) {
                const data = await res.json();
                await fetchTemplates(); // Refresh list to get the new one including ID
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = (template: Template, e: React.MouseEvent) => {
        e.stopPropagation();
        setTemplateToDelete(template);
        setShowDeleteModal(true);
    };

    const performDelete = async () => {
        if (!templateToDelete || !senderEmail) return;

        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
        try {
            await fetch(`${baseUrl}/templates/${templateToDelete.id}?email=${senderEmail}`, { method: 'DELETE' });
            setTemplates(prev => prev.filter(t => t.id !== templateToDelete.id));
            if (selectedTemplate?.id === templateToDelete.id) setSelectedTemplate(null);
            setShowDeleteModal(false);
            setTemplateToDelete(null);
        } catch (error) {
            console.error("Failed to delete template", error);
            alert("Failed to delete template. Please try again.");
        }
    };

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-[#213448] uppercase tracking-tighter flex items-center gap-3">
                        <LayoutDashboard size={32} className="text-[#94B4C1]" />
                        Template Library
                    </h2>
                    <p className="text-xs text-[#94B4C1] font-bold uppercase tracking-widest mt-1">
                        Manage your email blueprints for {senderEmail || 'Guest'}
                    </p>
                </div>
                <Button
                    onClick={handleCreateNew}
                    className="bg-[#213448] text-[#EAE0CF] hover:bg-[#547792] rounded-2xl h-12 shadow-xl"
                    disabled={!senderEmail || isLoading}
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : <Plus size={20} className="mr-2" />}
                    CREATE NEW
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full min-h-0">
                {/* List Column */}
                <div className="lg:col-span-4 flex flex-col gap-4 min-h-0 h-full">
                    <div className="relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94B4C1]" />
                        <Input
                            placeholder="SEARCH TEMPLATES..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white pl-12 h-12 rounded-2xl border-none shadow-sm focus:ring-1 focus:ring-[#94B4C1]"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {isLoading ? (
                            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#94B4C1]" /></div>
                        ) : filteredTemplates.length === 0 ? (
                            <div className="p-8 text-center border-2 border-dashed border-[#547792]/10 rounded-2xl text-[#94B4C1] font-bold text-xs uppercase tracking-widest bg-white/50">
                                No templates found.
                            </div>
                        ) : (
                            filteredTemplates.map(t => (
                                <motion.div
                                    key={t.id}
                                    layoutId={t.id}
                                    onClick={() => setSelectedTemplate(t)}
                                    className={cn(
                                        "p-5 rounded-2xl cursor-pointer transition-all border-2 group relative",
                                        selectedTemplate?.id === t.id
                                            ? "bg-[#213448] border-[#213448] text-[#EAE0CF] shadow-xl"
                                            : "bg-white border-transparent hover:border-[#94B4C1]/20 text-[#213448] hover:shadow-lg"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-black text-sm uppercase tracking-tight truncate pr-8">{t.name}</h3>
                                    </div>
                                    <p className={cn("text-[10px] uppercase tracking-widest truncate", selectedTemplate?.id === t.id ? "text-[#94B4C1]" : "text-[#94B4C1]")}>
                                        {t.subject}
                                    </p>
                                    <button
                                        onClick={(e) => handleDelete(t, e)}
                                        className={cn(
                                            "absolute top-4 right-4 p-2 rounded-xl transition-all",
                                            selectedTemplate?.id === t.id
                                                ? "bg-[#94B4C1]/20 text-[#EAE0CF] hover:bg-red-500/40"
                                                : "bg-[#213448]/5 text-[#94B4C1] hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100"
                                        )}
                                        title="Delete Blueprint"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Editor Column (Right Pane) */}
                <div className="lg:col-span-8 h-full min-h-0">
                    <AnimatePresence mode="wait">
                        {draftTemplate ? (
                            <motion.div
                                key={draftTemplate.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="h-full bg-white rounded-[32px] shadow-xl flex flex-col border border-[#213448]/5 overflow-hidden"
                            >
                                {/* Header / Controls */}
                                <div className="p-6 border-b border-[#547792]/5 bg-gradient-to-r from-white to-[#EAE0CF]/20 flex flex-col gap-4">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div className="flex-1 w-full sm:w-auto">
                                            <Input
                                                value={draftTemplate.name}
                                                onChange={(e) => updateDraft('name', e.target.value)}
                                                className="text-2xl font-black text-[#213448] uppercase tracking-tighter border-none bg-transparent h-auto p-0 focus-visible:ring-0 placeholder:text-[#213448]/20"
                                                placeholder="UNTITLED BLUEPRINT"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {hasUnsavedChanges && (
                                                <Button
                                                    onClick={handleSaveChanges}
                                                    disabled={isSaving}
                                                    className="bg-[#213448] text-[#EAE0CF] hover:bg-[#547792] rounded-xl h-10 px-4 shadow-lg"
                                                >
                                                    {isSaving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Save Changes</span>
                                                </Button>
                                            )}
                                            {onUseTemplate && (
                                                <Button
                                                    onClick={() => onUseTemplate(draftTemplate)}
                                                    className="bg-[#94B4C1] text-[#EAE0CF] hover:bg-[#94B4C1]/90 rounded-xl h-10 px-4 shadow-lg shadow-[#94B4C1]/20"
                                                >
                                                    <span className="font-black uppercase tracking-widest text-[10px] flex items-center">
                                                        Use This <ChevronRight size={14} className="ml-1" />
                                                    </span>
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Subject and Metadata */}
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-3">
                                            <span className="bg-[#213448] text-[#EAE0CF] px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest shrink-0">Subject</span>
                                            <Input
                                                value={draftTemplate.subject}
                                                onChange={(e) => updateDraft('subject', e.target.value)}
                                                className="flex-1 font-bold text-[#547792] border-0 border-b-2 border-[#547792]/10 bg-transparent rounded-none px-0 h-8 focus-visible:ring-0 focus-visible:border-[#94B4C1]"
                                                placeholder="Email Subject Line"
                                            />
                                        </div>

                                        {/* Mapping Selector */}
                                        {onMappingChange && (
                                            <div className="flex flex-col sm:flex-row gap-4">
                                                <div className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity flex-1">
                                                    <Label htmlFor="to-email-view" className="text-[#94B4C1] font-black uppercase tracking-[0.2em] text-[8px] whitespace-nowrap shrink-0">Recipient Email:</Label>
                                                    <div className="relative flex-1 max-w-xs">
                                                        <select
                                                            id="to-email-view"
                                                            value={mapping.email}
                                                            onChange={(e) => onMappingChange({ ...mapping, email: e.target.value })}
                                                            className="w-full pl-2 pr-6 h-6 text-[10px] font-bold bg-transparent border-none outline-none text-[#213448] cursor-pointer hover:text-[#94B4C1]"
                                                        >
                                                            <option value="" disabled>Select Column</option>
                                                            {placeholders.map((header) => (
                                                                <option key={header} value={header}>{header}</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[#213448] pointer-events-none">
                                                            <ChevronDown size={12} />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity flex-1">
                                                    <Label htmlFor="to-name-view" className="text-[#94B4C1] font-black uppercase tracking-[0.2em] text-[8px] whitespace-nowrap shrink-0">Recipient Name:</Label>
                                                    <div className="relative flex-1 max-w-xs">
                                                        <select
                                                            id="to-name-view"
                                                            value={mapping.name}
                                                            onChange={(e) => onMappingChange({ ...mapping, name: e.target.value })}
                                                            className="w-full pl-2 pr-6 h-6 text-[10px] font-bold bg-transparent border-none outline-none text-[#213448] cursor-pointer hover:text-[#94B4C1]"
                                                        >
                                                            <option value="" disabled>Select Column</option>
                                                            {placeholders.map((header) => (
                                                                <option key={header} value={header}>{header}</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[#213448] pointer-events-none">
                                                            <ChevronDown size={12} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Editor Area */}
                                <div className="flex-1 overflow-hidden flex flex-col">
                                    <EmailEditor
                                        value={draftTemplate.body}
                                        onChange={(val) => updateDraft('body', val)}
                                        className="h-full border-none rounded-none p-8"
                                        placeholder="Craft your message..."
                                        placeholders={placeholders}
                                        onAttach={(files) => setAttachments(prev => [...prev, ...files])}
                                    />
                                    {attachments.length > 0 && (
                                        <div className="flex flex-wrap gap-2 px-8 pb-6 border-t border-[#547792]/5 pt-4">
                                            {attachments.map((file, index) => (
                                                <div key={index} className="flex items-center gap-2 pl-3 pr-2 py-1.5 bg-[#213448] text-[#EAE0CF] rounded-lg text-[9px] font-black uppercase tracking-widest">
                                                    <span className="truncate max-w-[120px]">{file.name}</span>
                                                    <button onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))} className="hover:text-red-400">
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-[#94B4C1] opacity-40 bg-white/50 rounded-[32px] border-2 border-dashed border-[#547792]/10">
                                <FileText size={80} className="mb-6" />
                                <h3 className="font-black uppercase tracking-widest text-lg mb-2">No Selection</h3>
                                <p className="font-bold text-xs uppercase tracking-widest opacity-70">Select a template to configure & edit</p>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Delete Confirmation Modal */}
                    <AnimatePresence>
                        {showDeleteModal && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setShowDeleteModal(false)}
                                    className="absolute inset-0 bg-[#213448]/80 backdrop-blur-sm"
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                    className="relative w-full max-w-md bg-white rounded-[44px] shadow-2xl overflow-hidden border border-[#213448]/10"
                                >
                                    {/* Decorative Background Elements matching LoginModal */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#EAE0CF]/30 blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-500/5 blur-[60px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                                    <div className="p-10 relative z-10 flex flex-col items-center text-center">
                                        <div className="w-20 h-20 bg-[#213448] text-red-400 rounded-[28px] flex items-center justify-center mb-8 shadow-2xl shadow-red-500/20 rotate-3">
                                            <Trash2 size={36} />
                                        </div>
                                        <h3 className="text-3xl font-black text-[#213448] uppercase tracking-tighter mb-3 leading-none">Delete Template</h3>
                                        <p className="text-[11px] text-[#94B4C1] font-black uppercase tracking-[0.2em] mb-10 leading-relaxed max-w-[280px]">
                                            Are you sure you want to delete <span className="text-[#213448]">"{templateToDelete?.name}"</span>?
                                        </p>

                                        <div className="flex w-full gap-4">
                                            <Button
                                                onClick={() => setShowDeleteModal(false)}
                                                className="flex-1 h-16 rounded-[24px] bg-[#EAE0CF] text-[#213448] hover:bg-[#DED0BB] font-black uppercase tracking-widest text-[10px] border-2 border-[#213448]/5"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={performDelete}
                                                className="flex-1 h-16 rounded-[24px] bg-[#213448] text-[#EAE0CF] hover:bg-[#547792] font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-[#213448]/20 border-2 border-white/10"
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="bg-[#213448] py-4 px-8 text-center relative z-10">
                                        <span className="text-[8px] text-[#94B4C1] font-black uppercase tracking-[0.4em]">This action cannot be undone</span>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
