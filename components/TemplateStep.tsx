import React, { useState, useEffect } from 'react';
import { Card, Input, Button } from './ui-components';
import {
    Loader2,
    Plus,
    Search,
    ChevronLeft,
    ChevronRight,
    Clock,
    Sliders,
    FileCode,
    Paperclip,
    X,
    Save
} from 'lucide-react';
import { EmailEditor } from './EmailEditor';
import { cn } from '@/lib/utils';

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
    senderEmail,
    attachments,
    onAddAttachments,
    onRemoveAttachment,
    onClearAttachments,
    placeholders = [],
    mapping,
    onMappingChange,
    delayBetweenEmails,
    onDelayChange,
}) => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 4;

    const fetchTemplates = async () => {
        if (!senderEmail) return;
        setIsLoadingTemplates(true);
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
        try {
            const res = await fetch(`${baseUrl}/templates?email=${senderEmail}`);
            if (res.ok) {
                const data = await res.json();
                setTemplates(data.templates || []);
            }
        } catch (error) {
            console.error("Failed to fetch templates", error);
        } finally {
            setIsLoadingTemplates(false);
        }
    };

    const handleSaveTemplate = async (isNew: boolean = false) => {
        if (!senderEmail) return;

        const templateName = isNew
            ? (prompt("Enter a name for this template:") || "My Template")
            : (templates.find(t => t.id === selectedTemplateId)?.name || "My Template");

        const templateData = {
            email: senderEmail,
            name: templateName,
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

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Rail: Settings, Templates, Column Matching, Speed */}
            <div className="lg:col-span-4 space-y-4">
                {/* Saved Templates */}
                <Card className="bg-[#161B22] border-[#30363D]">
                    <div className="p-3.5 border-b border-[#30363D] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileCode size={15} className="text-[#58A6FF]" />
                            <span className="text-xs font-semibold text-[#E6EDF3]">Saved Templates</span>
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleSaveTemplate(true)}
                            disabled={!senderEmail}
                            className="text-xs h-7 px-2"
                        >
                            <Plus size={12} className="mr-1" /> New
                        </Button>
                    </div>

                    <div className="p-3 space-y-2">
                        {/* Search Input */}
                        <div className="relative">
                            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8B949E]" />
                            <Input
                                placeholder="Search templates..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-7 pl-7 text-xs bg-[#0D1117] border-[#30363D]"
                            />
                        </div>

                        {/* Templates List */}
                        <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar">
                            {isLoadingTemplates ? (
                                <div className="flex justify-center py-6">
                                    <Loader2 size={16} className="animate-spin text-[#58A6FF]" />
                                </div>
                            ) : filteredTemplates.length === 0 ? (
                                <div className="p-4 text-center border border-dashed border-[#30363D] rounded text-xs text-[#8B949E]">
                                    No saved templates yet.
                                </div>
                            ) : (
                                paginatedTemplates.map(t => (
                                    <div
                                        key={t.id}
                                        onClick={() => loadTemplate(t)}
                                        className={cn(
                                            "p-2.5 rounded-md cursor-pointer transition-colors border text-left",
                                            selectedTemplateId === t.id
                                                ? "bg-[#21262D] border-[#58A6FF]/40 text-[#E6EDF3]"
                                                : "bg-[#0D1117] border-[#30363D] hover:border-[#8B949E]/40 text-[#8B949E]"
                                        )}
                                    >
                                        <div className="text-xs font-medium text-[#E6EDF3] truncate">{t.name}</div>
                                        <div className="text-[11px] text-[#8B949E] truncate mt-0.5">{t.subject || 'No subject'}</div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pt-2 border-t border-[#30363D] flex items-center justify-between text-[11px] text-[#8B949E]">
                                <span>Page {currentPage} of {totalPages}</span>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="p-1 rounded hover:bg-[#21262D] disabled:opacity-30"
                                    >
                                        <ChevronLeft size={13} />
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-1 rounded hover:bg-[#21262D] disabled:opacity-30"
                                    >
                                        <ChevronRight size={13} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Match Columns Section */}
                <Card className="bg-[#161B22] border-[#30363D] p-3.5 space-y-3">
                    <div className="flex items-center gap-2">
                        <Sliders size={15} className="text-[#3FB950]" />
                        <span className="text-xs font-semibold text-[#E6EDF3]">Match Your File Columns</span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                        <div className="space-y-1">
                            <label className="text-[11px] font-medium text-[#8B949E]">Which column has email addresses? *</label>
                            <select
                                value={mapping.email}
                                onChange={(e) => onMappingChange({ ...mapping, email: e.target.value })}
                                className="w-full bg-[#0D1117] border border-[#30363D] rounded-md px-2.5 py-1.5 text-xs text-[#E6EDF3] focus:outline-none focus:border-[#58A6FF]"
                            >
                                <option value="" disabled>Select Email Column</option>
                                {placeholders.map((header) => (
                                    <option key={header} value={header}>{header}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-medium text-[#8B949E]">Which column has names? (optional)</label>
                            <select
                                value={mapping.name}
                                onChange={(e) => onMappingChange({ ...mapping, name: e.target.value })}
                                className="w-full bg-[#0D1117] border border-[#30363D] rounded-md px-2.5 py-1.5 text-xs text-[#E6EDF3] focus:outline-none focus:border-[#58A6FF]"
                            >
                                <option value="">None (generic greeting)</option>
                                {placeholders.map((header) => (
                                    <option key={header} value={header}>{header}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </Card>

                {/* Sending Speed / Throttle */}
                <Card className="bg-[#161B22] border-[#30363D] p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock size={15} className="text-[#D29922]" />
                            <span className="text-xs font-semibold text-[#E6EDF3]">Sending Speed</span>
                        </div>
                        <span className="text-xs font-mono text-[#58A6FF]">{delayBetweenEmails} seconds delay</span>
                    </div>

                    <div className="space-y-1">
                        <input
                            type="range"
                            min="0"
                            max="15"
                            step="1"
                            value={delayBetweenEmails}
                            onChange={(e) => onDelayChange(Number(e.target.value))}
                            className="w-full accent-[#58A6FF] cursor-pointer"
                        />
                        <p className="text-[11px] text-[#8B949E] leading-relaxed">
                            Pauses briefly between each email. This prevents Gmail from slowing down or blocking your account for sending too fast.
                        </p>
                    </div>
                </Card>
            </div>

            {/* Right Pane: Subject, Editor, Attachments */}
            <div className="lg:col-span-8 space-y-4">
                <Card className="bg-[#161B22] border-[#30363D] p-4 sm:p-5 space-y-4">
                    {/* Header bar: Title & Save */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#30363D]">
                        <div>
                            <h2 className="text-sm font-semibold text-[#E6EDF3]">Write Your Email</h2>
                            <p className="text-xs text-[#8B949E]">Draft your message and personalize it with tags</p>
                        </div>

                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleSaveTemplate(false)}
                            disabled={!senderEmail || !subject || isSavingTemplate}
                            className="text-xs flex items-center gap-1.5"
                        >
                            {isSavingTemplate ? (
                                <Loader2 size={12} className="animate-spin" />
                            ) : (
                                <Save size={12} />
                            )}
                            <span>Save Template</span>
                        </Button>
                    </div>

                    {/* Subject Line Input */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-[#E6EDF3]">Subject Line</label>
                            {placeholders.length > 0 && (
                                <div className="flex items-center gap-1 text-[11px] text-[#8B949E]">
                                    <span>Insert tag:</span>
                                    {placeholders.slice(0, 3).map((h) => (
                                        <button
                                            key={h}
                                            type="button"
                                            onClick={() => onSubjectChange(subject + ` {{${h}}}`)}
                                            className="px-1.5 py-0.5 rounded bg-[#21262D] border border-[#30363D] text-[10px] font-mono text-[#58A6FF] hover:border-[#58A6FF]/40"
                                        >
                                            +&#123;&#123;{h}&#125;&#125;
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <Input
                            placeholder="e.g. Quick question for {{name}}..."
                            value={subject}
                            onChange={(e) => onSubjectChange(e.target.value)}
                            className="text-xs h-9 bg-[#0D1117] border-[#30363D]"
                        />
                    </div>

                    {/* Rich Text Editor */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#E6EDF3]">Message Body</label>
                        <EmailEditor
                            value={body}
                            onChange={onBodyChange}
                            placeholders={placeholders}
                            placeholder="Write your email here. Use tags like {{name}} to insert information from your contact list..."
                            onAttach={(files) => onAddAttachments(files)}
                        />
                    </div>

                    {/* Attachments Section */}
                    {attachments.length > 0 && (
                        <div className="pt-3 border-t border-[#30363D] space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5 text-[#E6EDF3] font-medium">
                                    <Paperclip size={13} className="text-[#58A6FF]" />
                                    <span>Attached Files ({attachments.length})</span>
                                </div>
                                <button
                                    onClick={onClearAttachments}
                                    className="text-[11px] text-[#F85149] hover:underline"
                                >
                                    Remove all
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {attachments.map((file, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-2 pl-2.5 pr-1.5 py-1 rounded bg-[#21262D] border border-[#30363D] text-xs"
                                    >
                                        <span className="text-[11px] text-[#E6EDF3] max-w-[150px] truncate">
                                            {file.name}
                                        </span>
                                        <span className="text-[10px] text-[#8B949E] font-mono">
                                            ({(file.size / 1024).toFixed(0)} KB)
                                        </span>
                                        <button
                                            onClick={() => onRemoveAttachment(idx)}
                                            className="p-1 rounded text-[#8B949E] hover:text-[#F85149] hover:bg-[#30363D]"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};
