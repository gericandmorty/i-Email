import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    Upload,
    FileSpreadsheet,
    X,
    Search,
    RefreshCw,
    Info
} from 'lucide-react';
import { Card, Button, Input, Badge } from './ui-components';
import { cn } from '@/lib/utils';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    selectedFile: File | null;
    onClear: () => void;
    data?: { headers: string[]; data: any[] } | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({
    onFileSelect,
    selectedFile,
    onClear,
    data
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            onFileSelect(acceptedFiles[0]);
        }
    }, [onFileSelect]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls'],
            'text/csv': ['.csv'],
        },
        multiple: false,
    });

    if (selectedFile) {
        const filteredData = data?.data.filter(row =>
            Object.values(row).some(val =>
                String(val || '').toLowerCase().includes(searchQuery.toLowerCase())
            )
        ) || [];

        return (
            <div className="space-y-6">
                {/* File Summary Card */}
                <Card className="p-4 sm:p-5 bg-[#161B22] border-[#30363D] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-md bg-[#21262D] border border-[#30363D] flex items-center justify-center text-[#3FB950] shrink-0">
                            <FileSpreadsheet size={20} />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold text-[#E6EDF3] truncate">
                                    {selectedFile.name}
                                </h3>
                                <Badge variant="success" className="shrink-0 text-[10px]">
                                    Ready
                                </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-[#8B949E] mt-0.5">
                                <span>{(selectedFile.size / 1024).toFixed(1)} KB</span>
                                <span>•</span>
                                <span>{data ? `${data.data.length} contacts found` : 'Reading file...'}</span>
                                <span>•</span>
                                <span>{data?.headers.length || 0} columns</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-[#30363D]">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = '.xlsx,.xls,.csv';
                                input.onchange = (e) => {
                                    const file = (e.target as HTMLInputElement).files?.[0];
                                    if (file) onFileSelect(file);
                                };
                                input.click();
                            }}
                            className="text-xs"
                        >
                            <RefreshCw size={12} className="mr-1.5" /> Choose different file
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={onClear}
                            className="text-xs"
                        >
                            <X size={12} className="mr-1.5" /> Remove
                        </Button>
                    </div>
                </Card>

                {/* Parsed Data Table */}
                {data && (
                    <Card className="overflow-hidden bg-[#161B22] border-[#30363D]">
                        {/* Table Header Bar */}
                        <div className="px-4 py-3 bg-[#161B22] border-b border-[#30363D] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-[#E6EDF3]">Contacts List Preview</span>
                                <span className="text-[11px] font-mono text-[#8B949E] px-2 py-0.5 rounded bg-[#21262D] border border-[#30363D]">
                                    {data.data.length} contacts
                                </span>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <div className="relative flex-1 sm:w-64">
                                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8B949E]" />
                                    <Input
                                        placeholder="Search contacts..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="h-8 pl-8 text-xs bg-[#0D1117] border-[#30363D]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Table View */}
                        <div className="overflow-x-auto max-h-[460px] custom-scrollbar">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-[#21262D] text-[#8B949E] border-b border-[#30363D] sticky top-0 z-10 text-[11px]">
                                        <th className="px-4 py-2 font-medium w-12 text-[#8B949E]">#</th>
                                        {data.headers.map((header) => (
                                            <th key={header} className="px-4 py-2 font-medium text-[#E6EDF3]">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#30363D]/60 font-sans">
                                    {filteredData.length === 0 ? (
                                        <tr>
                                            <td colSpan={data.headers.length + 1} className="px-4 py-8 text-center text-xs text-[#8B949E]">
                                                No contacts match "{searchQuery}"
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredData.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-[#21262D]/50 transition-colors">
                                                <td className="px-4 py-2 font-mono text-[11px] text-[#8B949E]">
                                                    {idx + 1}
                                                </td>
                                                {data.headers.map((header) => {
                                                    const val = String(row[header] || '');
                                                    const isEmailField = header.toLowerCase().includes('email');
                                                    return (
                                                        <td key={header} className="px-4 py-2 truncate max-w-[220px]">
                                                            {isEmailField ? (
                                                                <span className="font-mono text-[#58A6FF] text-[11px]">
                                                                    {val || '-'}
                                                                </span>
                                                            ) : (
                                                                <span className="text-[#E6EDF3]">
                                                                    {val || '-'}
                                                                </span>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Table Footer Bar */}
                        <div className="px-4 py-2.5 bg-[#161B22] border-t border-[#30363D] flex items-center justify-between text-[11px] text-[#8B949E]">
                            <span>
                                Showing {filteredData.length} of {data.data.length} contacts
                            </span>
                            <span>Processed safely on your computer</span>
                        </div>
                    </Card>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="border-b border-[#30363D] pb-4 space-y-1">
                <h2 className="text-base font-semibold text-[#E6EDF3]">Upload Your Contact List</h2>
                <p className="text-xs text-[#8B949E]">
                    Upload an Excel or CSV file with the people you want to email.
                </p>
            </div>

            {/* Drag & Drop Box */}
            <div
                {...getRootProps()}
                className={cn(
                    "border border-dashed rounded-lg p-10 sm:p-14 flex flex-col items-center justify-center transition-all cursor-pointer bg-[#161B22]",
                    isDragActive
                        ? "border-[#58A6FF] bg-[#21262D]/60 scale-[1.005]"
                        : "border-[#30363D] hover:border-[#58A6FF]/60 hover:bg-[#161B22]/80"
                )}
            >
                <input {...getInputProps()} />

                <div className="w-12 h-12 rounded-lg bg-[#21262D] border border-[#30363D] flex items-center justify-center text-[#58A6FF] mb-4 shadow-sm">
                    <Upload size={22} />
                </div>

                <h3 className="text-sm font-semibold text-[#E6EDF3] mb-1">
                    {isDragActive ? "Drop your file here..." : "Drop your Excel or CSV file here, or click to browse"}
                </h3>
                <p className="text-xs text-[#8B949E] text-center max-w-sm mb-6">
                    Your file stays private and is read directly in your browser. Nothing is saved to external servers.
                </p>

                <Button variant="secondary" size="sm" className="pointer-events-none mb-6">
                    Choose file from computer
                </Button>

                {/* Formats */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-4 border-t border-[#30363D]/60 w-full max-w-md">
                    <span className="text-[11px] text-[#8B949E]">Supported files:</span>
                    <span className="px-2 py-0.5 rounded bg-[#21262D] border border-[#30363D] text-[11px] font-mono text-[#E6EDF3]">.xlsx</span>
                    <span className="px-2 py-0.5 rounded bg-[#21262D] border border-[#30363D] text-[11px] font-mono text-[#E6EDF3]">.xls</span>
                    <span className="px-2 py-0.5 rounded bg-[#21262D] border border-[#30363D] text-[11px] font-mono text-[#E6EDF3]">.csv</span>
                </div>
            </div>

            {/* Helper Card */}
            <Card className="p-4 bg-[#161B22] border-[#30363D] flex items-start gap-3">
                <Info size={16} className="text-[#58A6FF] shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                    <span className="font-semibold text-[#E6EDF3] block">Tips for Your Contact File</span>
                    <p className="text-[#8B949E] leading-relaxed">
                        Make sure your spreadsheet includes columns for <strong className="text-[#E6EDF3]">Email</strong> and <strong className="text-[#E6EDF3]">Name</strong>. Any extra columns you have (like <strong className="text-[#E6EDF3]">Company</strong> or <strong className="text-[#E6EDF3]">Role</strong>) can also be used as custom tags in your email message.
                    </p>
                </div>
            </Card>
        </div>
    );
};
