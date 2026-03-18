import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, X, FileText, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from './ui-components';
import { cn } from '@/lib/utils';
import { Button } from './ui-components';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    selectedFile: File | null;
    onClear: () => void;
    data?: { headers: string[]; data: any[] } | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, selectedFile, onClear, data }) => {
    const [searchQuery, setSearchQuery] = React.useState('');
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
        return (
            <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col sm:flex-row items-center justify-between p-6 sm:p-8 border-2 rounded-[32px] sm:rounded-[40px] bg-white border-[#213448]/5 shadow-xl shadow-[#213448]/5 transition-all hover:border-[#547792]/20">
                    <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4 sm:gap-6">
                        <div className="p-4 sm:p-5 bg-[#EAE0CF] rounded-2xl sm:rounded-3xl text-[#547792] border-2 border-[#547792]/10">
                            <FileSpreadsheet size={28} className="sm:w-8 sm:h-8" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-lg sm:text-xl font-black text-[#213448] tracking-tight truncate max-w-[200px] sm:max-w-none">{selectedFile.name}</p>
                            <p className="text-[9px] sm:text-[10px] text-[#94B4C1] font-black uppercase tracking-[0.2em] mt-1">
                                {(selectedFile.size / 1024).toFixed(2)} KB • Registry Loaded
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClear} className="mt-4 sm:mt-0 rounded-full hover:bg-red-50 text-red-500 shrink-0">
                        <X size={20} />
                    </Button>
                </div>

                {data && (
                    <div className="relative group">
                        {/* Technical Border/Glow */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#213448]/5 via-[#94B4C1]/10 to-[#213448]/5 rounded-[32px] blur opacity-50 transition duration-1000 group-hover:opacity-100" />

                        <div className="relative bg-white border-2 border-[#213448]/5 rounded-[32px] overflow-hidden shadow-2xl shadow-[#213448]/5">
                            <div className="bg-[#213448] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[9px] font-black text-[#94B4C1] uppercase tracking-[0.3em]">Data Preview • Secure Parse</span>
                                </div>

                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                    <div className="relative flex-1 sm:w-64">
                                        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#697565]" />
                                        <Input
                                            placeholder="FILTER RECORDS..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="bg-white/5 border-none h-8 pl-9 text-[9px] font-black tracking-widest text-[#EAE0CF] placeholder:text-[#94B4C1]/40 rounded-xl"
                                        />
                                    </div>
                                    <span className="text-[8px] font-black text-[#94B4C1] uppercase tracking-widest shrink-0">{data.data.length} Records Detected</span>
                                </div>
                            </div>

                            <div className="overflow-x-auto overflow-y-auto max-h-[400px] custom-scrollbar">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-[#F5F5F5] border-b border-[#547792]/5 sticky top-0 z-10">
                                            {data.headers.map((header, i) => (
                                                <th key={header} className="px-6 py-4 text-left bg-[#F5F5F5]">
                                                    <span className="text-[10px] font-black text-[#213448] uppercase tracking-widest block opacity-70">
                                                        {header}
                                                    </span>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.data
                                            .filter(row =>
                                                Object.values(row).some(val =>
                                                    String(val).toLowerCase().includes(searchQuery.toLowerCase())
                                                )
                                            )
                                            .map((row, idx) => (
                                                <tr key={idx} className="border-b border-[#547792]/5 hover:bg-[#EAE0CF]/10 transition-colors">
                                                    {data.headers.map((header) => (
                                                        <td key={header} className="px-6 py-4">
                                                            <span className="text-[11px] font-bold text-[#547792] truncate max-w-[150px] block">
                                                                {String(row[header] || '-')}
                                                            </span>
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="bg-[#F5F5F5] p-4 text-center border-t border-[#547792]/5">
                                <p className="text-[9px] font-black text-[#94B4C1] uppercase tracking-[0.2em]">
                                    {searchQuery ? `Showing filtered results` : `Showing full system archive`}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div
            {...getRootProps()}
            className={cn(
                "border-2 border-dashed rounded-[32px] sm:rounded-[44px] p-12 sm:p-24 flex flex-col items-center justify-center transition-all duration-500 cursor-pointer group relative overflow-hidden",
                isDragActive
                    ? "border-[#94B4C1] bg-[#94B4C1]/5 scale-[1.01] shadow-2xl shadow-[#94B4C1]/10"
                    : "border-[#547792]/20 hover:border-[#94B4C1]/50 bg-white hover:bg-zinc-50/50"
            )}
        >
            <input {...getInputProps()} />

            {/* Background Decor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-96 sm:h-96 bg-[#EAE0CF]/50 blur-[80px] sm:blur-[120px] pointer-events-none" />

            <div className={cn(
                "p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] mb-6 sm:mb-10 transition-all duration-700 shadow-sm",
                isDragActive ? "bg-[#213448] text-[#EAE0CF] shadow-2xl shadow-[#213448]/30 rotate-6 scale-110" : "bg-[#EAE0CF] border-2 border-[#547792]/5 text-[#547792] group-hover:text-[#94B4C1] group-hover:border-[#94B4C1]/20 group-hover:shadow-lg"
            )}>
                <Upload size={36} className="sm:w-12 sm:h-12" strokeWidth={1.5} />
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-[#213448] mb-3 sm:mb-4 tracking-tighter uppercase text-center">Source Registry</h3>
            <p className="text-[#94B4C1] text-center max-w-[280px] sm:max-w-[320px] text-base font-bold leading-relaxed uppercase tracking-widest text-[9px] sm:text-[11px]">
                Drop your recipient archive <br className="hidden sm:block" />(.xlsx or .csv) or click to browse
            </p>

            <div className="mt-10 sm:mt-14 flex flex-wrap justify-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-white border-2 border-[#213448]/5 rounded-xl sm:rounded-2xl shadow-sm">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#547792]" />
                    <span className="text-[8px] sm:text-[10px] font-black text-[#213448] uppercase tracking-[0.2em]">Format .XLSX</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-white border-2 border-[#213448]/5 rounded-xl sm:rounded-2xl shadow-sm">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#94B4C1]" />
                    <span className="text-[8px] sm:text-[10px] font-black text-[#213448] uppercase tracking-[0.2em]">Format .CSV</span>
                </div>
            </div>
        </div>
    );
};
