import React, { useState, useEffect } from 'react';
import {
    Plus,
    Trash2,
    Search,
    FileText,
    Loader2,
    Save,
    Send
} from 'lucide-react';

import { Button, Input, Card, Badge } from './ui-components';
import { EmailEditor } from './EmailEditor';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollLock } from '@/lib/use-scroll-lock';

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
    placeholders = []
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
    const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);

    // Zero-shift body scroll lock for delete modal
    useScrollLock(showDeleteModal);

    // Escape listener for delete modal
    useEffect(() => {
        if (!showDeleteModal) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setShowDeleteModal(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showDeleteModal]);

    // Initial Fetch
    const fetchTemplates = async () => {
        if (!senderEmail) return;
        setIsLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
        try {
            const res = await fetch(`${baseUrl}/templates?email=${senderEmail}`);
            if (res.ok) {
                const data = await res.json();
                setTemplates(data.templates || []);
                if (!selectedTemplate && data.templates?.length > 0) {
                    setSelectedTemplate(data.templates[0]);
                }
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

    useEffect(() => {
        if (selectedTemplate) {
            setDraftTemplate({ ...selectedTemplate });
            setHasUnsavedChanges(false);
        } else {
            setDraftTemplate(null);
        }
    }, [selectedTemplate]);

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
                setTemplates(prev => prev.map(t => t.id === draftTemplate.id ? draftTemplate : t));
                setSelectedTemplate(draftTemplate);
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

    // Create New Template
    const handleCreateNew = async () => {
        if (!senderEmail) return;
        const newTemplateName = prompt("Enter a name for this template:", "My New Template") || "My New Template";
        const placeholder: Template = {
            id: '',
            name: newTemplateName,
            subject: 'New Email Subject',
            body: '<p>Hello {{name}},</p><p>Write your message here.</p>',
            created_at: new Date().toISOString()
        };

        setIsSaving(true);
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
        try {
            const res = await fetch(`${baseUrl}/templates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: senderEmail,
                    name: placeholder.name,
                    subject: placeholder.subject,
                    body: placeholder.body
                })
            });

            if (res.ok) {
                const data = await res.json();
                placeholder.id = data.id;
                setTemplates(prev => [placeholder, ...prev]);
                setSelectedTemplate(placeholder);
            }
        } catch (error) {
            console.error("Failed to create template", error);
        } finally {
            setIsSaving(false);
        }
    };

    // Delete Template
    const handleDeleteClick = (template: Template, e: React.MouseEvent) => {
        e.stopPropagation();
        setTemplateToDelete(template);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!templateToDelete || !senderEmail) return;
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
        try {
            const res = await fetch(`${baseUrl}/templates/${templateToDelete.id}?email=${senderEmail}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setTemplates(prev => prev.filter(t => t.id !== templateToDelete.id));
                if (selectedTemplate?.id === templateToDelete.id) {
                    const remaining = templates.filter(t => t.id !== templateToDelete.id);
                    setSelectedTemplate(remaining.length > 0 ? remaining[0] : null);
                }
            }
        } catch (error) {
            console.error("Failed to delete template", error);
        } finally {
            setShowDeleteModal(false);
            setTemplateToDelete(null);
        }
    };

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#30363D] pb-4">
                <div>
                    <h2 className="text-base font-semibold text-[#E6EDF3] flex items-center gap-2">
                        <span>Saved Templates</span>
                        <Badge variant="muted" className="text-[11px]">
                            {templates.length} templates
                        </Badge>
                    </h2>
                    <p className="text-xs text-[#8B949E]">
                        Create, save, and reuse email messages whenever you need them.
                    </p>
                </div>

                <Button
                    variant="primary"
                    size="sm"
                    onClick={handleCreateNew}
                    disabled={!senderEmail}
                    className="text-xs flex items-center gap-1.5 self-start sm:self-auto"
                >
                    <Plus size={13} />
                    <span>New Template</span>
                </Button>
            </div>

            {/* Split View: Left list, Right detail */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Template List */}
                <div className="lg:col-span-4 space-y-3">
                    <div className="relative">
                        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8B949E]" />
                        <Input
                            placeholder="Search templates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-8 pl-8 text-xs bg-[#161B22] border-[#30363D]"
                        />
                    </div>

                    <div className="space-y-2 max-h-[640px] overflow-y-auto custom-scrollbar">
                        {isLoading ? (
                            <div className="p-8 text-center text-xs text-[#8B949E]">
                                <Loader2 size={16} className="animate-spin mx-auto mb-2 text-[#58A6FF]" />
                                Loading templates...
                            </div>
                        ) : filteredTemplates.length === 0 ? (
                            <div className="p-8 text-center border border-dashed border-[#30363D] rounded-lg text-xs text-[#8B949E] bg-[#161B22]">
                                {searchQuery ? "No matching templates found" : "No templates saved yet. Click 'New Template' to create one."}
                            </div>
                        ) : (
                            filteredTemplates.map((template) => {
                                const isSelected = selectedTemplate?.id === template.id;
                                return (
                                    <div
                                        key={template.id}
                                        onClick={() => setSelectedTemplate(template)}
                                        className={cn(
                                            "p-3 rounded-md border text-left cursor-pointer transition-colors relative group",
                                            isSelected
                                                ? "bg-[#21262D] border-[#58A6FF]/50 text-[#E6EDF3]"
                                                : "bg-[#161B22] border-[#30363D] hover:border-[#8B949E]/40 text-[#8B949E]"
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <div className="text-xs font-semibold text-[#E6EDF3] truncate">
                                                    {template.name}
                                                </div>
                                                <div className="text-[11px] text-[#8B949E] truncate mt-0.5">
                                                    {template.subject || "No subject set"}
                                                </div>
                                            </div>

                                            <button
                                                onClick={(e) => handleDeleteClick(template, e)}
                                                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#30363D] text-[#8B949E] hover:text-[#F85149] transition-all"
                                                title="Delete template"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right: Template Detail & Editor */}
                <div className="lg:col-span-8">
                    {draftTemplate ? (
                        <Card className="p-4 sm:p-6 bg-[#161B22] border-[#30363D] space-y-4">
                            {/* Editor Header Bar */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#30363D]">
                                <div className="space-y-1 flex-1 min-w-0">
                                    <input
                                        type="text"
                                        value={draftTemplate.name}
                                        onChange={(e) => updateDraft('name', e.target.value)}
                                        className="text-sm font-semibold text-[#E6EDF3] bg-transparent border-none p-0 focus:outline-none focus:ring-0 w-full"
                                        placeholder="Template name..."
                                    />
                                    <div className="flex items-center gap-2 text-[11px] text-[#8B949E]">
                                        {hasUnsavedChanges ? (
                                            <span className="text-[#D29922]">● Unsaved changes</span>
                                        ) : (
                                            <span>Saved</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {onUseTemplate && (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => onUseTemplate(draftTemplate)}
                                            className="text-xs"
                                        >
                                            <Send size={12} className="mr-1.5 text-[#58A6FF]" />
                                            Use This Template
                                        </Button>
                                    )}

                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={handleSaveChanges}
                                        disabled={!hasUnsavedChanges || isSaving}
                                        className="text-xs"
                                    >
                                        {isSaving ? <Loader2 size={12} className="animate-spin mr-1.5" /> : <Save size={12} className="mr-1.5" />}
                                        Save Changes
                                    </Button>
                                </div>
                            </div>

                            {/* Subject */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-[#E6EDF3]">Email Subject</label>
                                <Input
                                    value={draftTemplate.subject}
                                    onChange={(e) => updateDraft('subject', e.target.value)}
                                    placeholder="Subject with {{name}}..."
                                    className="h-8 text-xs bg-[#0D1117] border-[#30363D]"
                                />
                            </div>

                            {/* Body Editor */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-[#E6EDF3]">Email Body</label>
                                <EmailEditor
                                    value={draftTemplate.body}
                                    onChange={(val) => updateDraft('body', val)}
                                    placeholders={placeholders}
                                    placeholder="Write your email template here..."
                                />
                            </div>
                        </Card>
                    ) : (
                        <div className="p-12 text-center rounded-lg border border-dashed border-[#30363D] bg-[#161B22] text-[#8B949E] space-y-2">
                            <FileText size={36} className="mx-auto text-[#8B949E]" />
                            <h3 className="text-sm font-semibold text-[#E6EDF3]">No template selected</h3>
                            <p className="text-xs text-[#8B949E] max-w-xs mx-auto">
                                Click a template on the left to view or edit it, or create a new one.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        key="delete-template-wrapper"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 z-[110] flex items-center justify-center p-4 isolate"
                        role="dialog"
                        aria-modal="true"
                    >
                        <div
                            className="absolute inset-0 bg-[#04070A]/80 cursor-pointer"
                            onClick={() => setShowDeleteModal(false)}
                            aria-hidden="true"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 6 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 6 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative z-10 w-full max-w-sm bg-[#161B22] border border-[#30363D] rounded-xl shadow-2xl p-5 space-y-4"
                        >
                            <div className="flex items-center gap-2.5 text-[#F85149]">
                                <Trash2 size={18} />
                                <h3 className="text-sm font-semibold text-[#E6EDF3]">Delete Template</h3>
                            </div>

                            <p className="text-xs text-[#8B949E] leading-relaxed">
                                Are you sure you want to delete <span className="text-[#E6EDF3] font-medium">&quot;{templateToDelete?.name}&quot;</span>? You won't be able to recover it.
                            </p>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={confirmDelete}
                                >
                                    Delete
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
