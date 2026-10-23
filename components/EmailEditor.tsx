import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Bold, Italic, List, ListOrdered, Type, Loader2, Paperclip, ImagePlus, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui-components';

interface EmailEditorProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
    placeholder?: string;
    placeholders?: string[];
    onAttach?: (files: File[]) => void;
}

export const EmailEditor: React.FC<EmailEditorProps> = ({
    value,
    onChange,
    className,
    placeholder = "Start composing your email...",
    placeholders = [],
    onAttach
}) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isMappingOpen, setIsMappingOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    // Resize state
    const [selectedImg, setSelectedImg] = useState<HTMLImageElement | null>(null);
    const [isResizing, setIsResizing] = useState(false);
    const resizeStartRef = useRef<{ x: number; y: number; width: number; height: number; ratio: number } | null>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsMappingOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Sync external value changes to editor (only if different to prevent cursor jumps)
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value;
        }
    }, [value]);

    // Deselect image when clicking outside editor or on text
    useEffect(() => {
        const handleGlobalClick = (e: MouseEvent) => {
            if (isResizing) return;
            const target = e.target as HTMLElement;

            if (overlayRef.current && overlayRef.current.contains(target)) return;

            if (target.tagName === 'IMG' && editorRef.current?.contains(target)) {
                setSelectedImg(target as HTMLImageElement);
                return;
            }

            if (selectedImg) {
                setSelectedImg(null);
            }
        };

        document.addEventListener('click', handleGlobalClick);
        return () => document.removeEventListener('click', handleGlobalClick);
    }, [selectedImg, isResizing]);

    // Handle resize mouse events
    const handleResizeStart = useCallback((e: React.MouseEvent, _corner: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (!selectedImg) return;

        const rect = selectedImg.getBoundingClientRect();
        resizeStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            width: rect.width,
            height: rect.height,
            ratio: rect.width / rect.height,
        };
        setIsResizing(true);
    }, [selectedImg]);

    useEffect(() => {
        if (!isResizing || !selectedImg) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (!resizeStartRef.current) return;
            const { x: startX, width: startWidth, ratio } = resizeStartRef.current;

            const dx = e.clientX - startX;
            const newWidth = Math.max(50, startWidth + dx);
            const newHeight = newWidth / ratio;

            selectedImg.style.width = `${Math.round(newWidth)}px`;
            selectedImg.style.height = `${Math.round(newHeight)}px`;
            selectedImg.style.maxWidth = 'none';
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            resizeStartRef.current = null;
            handleInput();
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, selectedImg]);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const executeCommand = (command: string) => {
        document.execCommand(command, false);
        handleInput();
        editorRef.current?.focus();
    };

    const insertText = (text: string) => {
        editorRef.current?.focus();
        document.execCommand('insertText', false, text);
        handleInput();
        setIsMappingOpen(false);
    };

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
                    }, 'image/jpeg', 0.6);
                };
            };
        });
    };

    const insertInlineImage = async (file: File) => {
        setIsUploading(true);
        const processedImg = file.size > 1024 * 1024 ? await compressImage(file) : file;
        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            const imgHtml = `<img src='${dataUrl}' data-filename='${processedImg.name}' draggable='true' style='max-width: 100%; border-radius: 6px; margin: 8px 0; display: block; cursor: grab; border: 1px solid #30363D;' />`;

            editorRef.current?.focus();
            if (document.queryCommandSupported('insertHTML')) {
                document.execCommand('insertHTML', false, imgHtml);
            } else if (editorRef.current) {
                editorRef.current.innerHTML += imgHtml;
            }
            handleInput();
            setIsUploading(false);
        };
        reader.readAsDataURL(processedImg);
    };

    const handleDrop = async (e: React.DragEvent) => {
        const files = Array.from(e.dataTransfer.files);
        const hasHTML = e.dataTransfer.types.includes('text/html');

        if (files.length === 0 && hasHTML) {
            setSelectedImg(null);
            setTimeout(() => handleInput(), 50);
            return;
        }

        const textData = e.dataTransfer.getData('text/plain');
        if (textData && files.length === 0) {
            return;
        }

        e.preventDefault();

        const images = files.filter(f => f.type.startsWith('image/'));
        const others = files.filter(f => !f.type.startsWith('image/'));

        if (images.length > 0) {
            for (const img of images) {
                await insertInlineImage(img);
            }
        }

        if (others.length > 0 && onAttach) {
            onAttach(others);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDragStartTag = (e: React.DragEvent, tag: string) => {
        e.dataTransfer.setData('text/plain', tag);
        e.dataTransfer.effectAllowed = 'copy';
    };

    const handleAttachClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageUploadClick = () => {
        imageInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && onAttach) {
            onAttach(Array.from(e.target.files));
        }
        e.target.value = '';
    };

    const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            for (const file of Array.from(e.target.files)) {
                if (file.type.startsWith('image/')) {
                    await insertInlineImage(file);
                }
            }
        }
        e.target.value = '';
    };

    const getImageOverlayStyle = (): React.CSSProperties | null => {
        if (!selectedImg || !editorRef.current) return null;

        const editorRect = editorRef.current.getBoundingClientRect();
        const imgRect = selectedImg.getBoundingClientRect();

        return {
            position: 'absolute',
            left: imgRect.left - editorRect.left,
            top: imgRect.top - editorRect.top,
            width: imgRect.width,
            height: imgRect.height,
            pointerEvents: 'none',
            zIndex: 50,
        };
    };

    const overlayStyle = selectedImg ? getImageOverlayStyle() : null;

    return (
        <div className={cn("space-y-2.5", className)}>
            <input
                type="file"
                multiple
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
            />
            <input
                type="file"
                multiple
                accept="image/*"
                ref={imageInputRef}
                className="hidden"
                onChange={handleImageFileChange}
            />

            {/* GitHub-Styled Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 rounded-md bg-[#161B22] border border-[#30363D] relative z-20">
                <div className="flex items-center gap-0.5">
                    <button
                        onClick={() => executeCommand('bold')}
                        className="p-1.5 rounded hover:bg-[#21262D] text-[#8B949E] hover:text-[#E6EDF3] transition-colors"
                        title="Bold (Ctrl+B)"
                    >
                        <Bold size={14} />
                    </button>
                    <button
                        onClick={() => executeCommand('italic')}
                        className="p-1.5 rounded hover:bg-[#21262D] text-[#8B949E] hover:text-[#E6EDF3] transition-colors"
                        title="Italic (Ctrl+I)"
                    >
                        <Italic size={14} />
                    </button>

                    <div className="w-px h-4 bg-[#30363D] mx-1" />

                    <button
                        onClick={() => executeCommand('insertUnorderedList')}
                        className="p-1.5 rounded hover:bg-[#21262D] text-[#8B949E] hover:text-[#E6EDF3] transition-colors"
                        title="Bullet List"
                    >
                        <List size={14} />
                    </button>
                    <button
                        onClick={() => executeCommand('insertOrderedList')}
                        className="p-1.5 rounded hover:bg-[#21262D] text-[#8B949E] hover:text-[#E6EDF3] transition-colors"
                        title="Numbered List"
                    >
                        <ListOrdered size={14} />
                    </button>

                    <div className="w-px h-4 bg-[#30363D] mx-1" />

                    <button
                        onClick={handleImageUploadClick}
                        className="p-1.5 rounded hover:bg-[#21262D] text-[#8B949E] hover:text-[#E6EDF3] transition-colors"
                        title="Insert Image"
                    >
                        <ImagePlus size={14} />
                    </button>

                    {onAttach && (
                        <button
                            onClick={handleAttachClick}
                            className="p-1.5 rounded hover:bg-[#21262D] text-[#8B949E] hover:text-[#E6EDF3] transition-colors"
                            title="Attach File"
                        >
                            <Paperclip size={14} />
                        </button>
                    )}

                    {/* Mapping Dropdown */}
                    {placeholders.length > 0 && (
                        <>
                            <div className="w-px h-4 bg-[#30363D] mx-1" />
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsMappingOpen(!isMappingOpen)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors",
                                        isMappingOpen
                                            ? "bg-[#21262D] text-[#58A6FF]"
                                            : "text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D]"
                                    )}
                                >
                                    <Type size={13} />
                                    <span>Insert Tag</span>
                                    <ChevronDown size={11} />
                                </button>
                                {isMappingOpen && (
                                    <div className="absolute top-full left-0 mt-1 w-52 max-h-56 overflow-y-auto bg-[#161B22] rounded-md shadow-xl border border-[#30363D] p-1 z-50 flex flex-col gap-0.5 custom-scrollbar">
                                        <p className="px-2 py-1 text-[10px] text-[#8B949E] border-b border-[#30363D] mb-0.5">
                                            Choose from your contacts
                                        </p>
                                        {placeholders.map((header) => {
                                            const tag = `{{${header}}}`;
                                            return (
                                                <button
                                                    key={header}
                                                    draggable
                                                    onDragStart={(e) => handleDragStartTag(e, tag)}
                                                    onClick={() => insertText(tag)}
                                                    className="px-2.5 py-1.5 hover:bg-[#21262D] rounded text-xs font-mono text-[#58A6FF] text-left transition-colors flex items-center justify-between"
                                                >
                                                    <span>{tag}</span>
                                                    <span className="text-[10px] text-[#8B949E]">column</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {isUploading && (
                    <div className="flex items-center gap-1.5 text-[#58A6FF] text-xs font-mono">
                        <Loader2 size={12} className="animate-spin" />
                        <span>Compressing image...</span>
                    </div>
                )}
            </div>

            {/* Editor Area */}
            <div className="relative z-10">
                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    spellCheck={false}
                    onInput={handleInput}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="min-h-[320px] w-full rounded-md border border-[#30363D] bg-[#0D1117] p-4 text-xs text-[#E6EDF3] focus-visible:outline-none focus:border-[#58A6FF] focus:ring-1 focus:ring-[#58A6FF] hover:border-[#8B949E]/40 transition-colors font-sans leading-relaxed outline-none overflow-y-auto block custom-scrollbar"
                    style={{ position: 'relative' }}
                />
                {!value && (
                    <div className="absolute top-4 left-4 text-[#8B949E]/50 text-xs pointer-events-none font-sans">
                        {placeholder}
                    </div>
                )}

                {/* Image Resize Overlay */}
                {selectedImg && overlayStyle && (
                    <div ref={overlayRef} style={overlayStyle}>
                        <div style={{
                            position: 'absolute',
                            inset: -2,
                            border: '2px solid #58A6FF',
                            borderRadius: 4,
                            pointerEvents: 'none',
                        }} />

                        <div style={{
                            position: 'absolute',
                            bottom: -24,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: '#161B22',
                            color: '#58A6FF',
                            border: '1px solid #30363D',
                            fontSize: 10,
                            fontFamily: 'monospace',
                            padding: '2px 6px',
                            borderRadius: 4,
                            whiteSpace: 'nowrap',
                            pointerEvents: 'none',
                        }}>
                            {Math.round(selectedImg.getBoundingClientRect().width)} × {Math.round(selectedImg.getBoundingClientRect().height)}
                        </div>

                        {['nw', 'ne', 'sw', 'se'].map((corner) => {
                            const posStyle: React.CSSProperties = {
                                position: 'absolute',
                                width: 10,
                                height: 10,
                                background: '#58A6FF',
                                border: '1px solid #0D1117',
                                borderRadius: 2,
                                cursor: `${corner}-resize`,
                                pointerEvents: 'all',
                                zIndex: 51,
                            };

                            if (corner.includes('n')) posStyle.top = -5;
                            if (corner.includes('s')) posStyle.bottom = -5;
                            if (corner.includes('w')) posStyle.left = -5;
                            if (corner.includes('e')) posStyle.right = -5;

                            return (
                                <div
                                    key={corner}
                                    style={posStyle}
                                    onMouseDown={(e) => handleResizeStart(e, corner)}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
