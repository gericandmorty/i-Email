import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Bold, Italic, List, ListOrdered, Type, Loader2, Paperclip, ImagePlus } from 'lucide-react';
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
            if (editorRef.current.innerHTML !== value) {
                editorRef.current.innerHTML = value;
            }
        }
    }, [value]);

    // Deselect image when clicking outside editor or on text
    useEffect(() => {
        const handleGlobalClick = (e: MouseEvent) => {
            if (isResizing) return;
            const target = e.target as HTMLElement;

            // If clicking on the overlay handles, don't deselect
            if (overlayRef.current && overlayRef.current.contains(target)) return;

            // If clicking an image inside the editor, select it for resizing
            if (target.tagName === 'IMG' && editorRef.current?.contains(target)) {
                setSelectedImg(target as HTMLImageElement);
                return;
            }

            // Otherwise deselect
            if (selectedImg) {
                setSelectedImg(null);
            }
        };

        // Use 'click' instead of 'mousedown' so native drag still works
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
            const imgHtml = `<img src='${dataUrl}' data-filename='${processedImg.name}' draggable='true' style='max-width: 100%; border-radius: 8px; margin: 8px 0; display: block; cursor: grab;' />`;

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

        // If no external files and HTML is being dragged (internal image move),
        // let the browser handle it natively for repositioning
        if (files.length === 0 && hasHTML) {
            // Deselect any selected image during drag reposition
            setSelectedImg(null);
            // Allow a tick for the browser to complete the drop, then sync state
            setTimeout(() => handleInput(), 50);
            return;
        }

        // Handle text drop (e.g. from mapping tags)
        const textData = e.dataTransfer.getData('text/plain');
        if (textData && files.length === 0) {
            return;
        }

        e.preventDefault();

        const images = files.filter(f => f.type.startsWith('image/'));
        const others = files.filter(f => !f.type.startsWith('image/'));

        // Process images inline
        if (images.length > 0) {
            for (const img of images) {
                await insertInlineImage(img);
            }
        }

        // Pass other files to attachment handler
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
        e.target.value = ''; // Reset
    };

    const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            for (const file of Array.from(e.target.files)) {
                if (file.type.startsWith('image/')) {
                    await insertInlineImage(file);
                }
            }
        }
        e.target.value = ''; // Reset
    };

    // Calculate overlay position for selected image
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
        <div className={cn("space-y-4", className)}>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-20">
                <div className="flex items-center gap-1 bg-[#EAE0CF]/50 p-1 sm:p-1.5 rounded-2xl border-2 border-[#547792]/10 w-fit">
                    <button onClick={() => executeCommand('bold')} className="p-2 sm:p-2.5 hover:bg-[#213448] rounded-xl transition-all text-[#547792] hover:text-[#EAE0CF]" title="Bold"><Bold size={14} strokeWidth={3} className="sm:w-4 sm:h-4" /></button>
                    <button onClick={() => executeCommand('italic')} className="p-2 sm:p-2.5 hover:bg-[#213448] rounded-xl transition-all text-[#547792] hover:text-[#EAE0CF]" title="Italic"><Italic size={14} strokeWidth={3} className="sm:w-4 sm:h-4" /></button>
                    <div className="w-[1px] sm:w-[2px] h-5 sm:h-6 bg-[#547792]/10 mx-1 sm:mx-2" />
                    <button onClick={() => executeCommand('insertUnorderedList')} className="p-2 sm:p-2.5 hover:bg-[#213448] rounded-xl transition-all text-[#547792] hover:text-[#EAE0CF]" title="Bullet List"><List size={14} strokeWidth={3} className="sm:w-4 sm:h-4" /></button>
                    <button onClick={() => executeCommand('insertOrderedList')} className="p-2 sm:p-2.5 hover:bg-[#213448] rounded-xl transition-all text-[#547792] hover:text-[#EAE0CF]" title="Numbered List"><ListOrdered size={14} strokeWidth={3} className="sm:w-4 sm:h-4" /></button>

                    {/* Image Upload Button */}
                    <div className="w-[1px] sm:w-[2px] h-5 sm:h-6 bg-[#547792]/10 mx-1 sm:mx-2" />
                    <button onClick={handleImageUploadClick} className="p-2 sm:p-2.5 hover:bg-[#213448] rounded-xl transition-all text-[#547792] hover:text-[#EAE0CF]" title="Insert Image"><ImagePlus size={14} strokeWidth={3} className="sm:w-4 sm:h-4" /></button>

                    {onAttach && (
                        <>
                            <div className="w-[1px] sm:w-[2px] h-5 sm:h-6 bg-[#547792]/10 mx-1 sm:mx-2" />
                            <button onClick={handleAttachClick} className="p-2 sm:p-2.5 hover:bg-[#213448] rounded-xl transition-all text-[#547792] hover:text-[#EAE0CF]" title="Attach Files"><Paperclip size={14} strokeWidth={3} className="sm:w-4 sm:h-4" /></button>
                        </>
                    )}

                    {/* Mapping Dropdown */}
                    {placeholders.length > 0 && (
                        <>
                            <div className="w-[1px] sm:w-[2px] h-5 sm:h-6 bg-[#547792]/10 mx-1 sm:mx-2" />
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsMappingOpen(!isMappingOpen)}
                                    className={cn(
                                        "flex items-center gap-2 p-2 sm:p-2.5 rounded-xl transition-all text-[10px] uppercase font-black tracking-widest",
                                        isMappingOpen ? "bg-[#213448] text-[#EAE0CF]" : "hover:bg-[#213448] text-[#547792] hover:text-[#EAE0CF]"
                                    )}
                                >
                                    <Type size={14} strokeWidth={3} className="sm:w-4 sm:h-4" />
                                    <span className="hidden sm:inline">Mapping</span>
                                </button>
                                {isMappingOpen && (
                                    <div className="absolute top-full left-0 mt-2 w-56 max-h-64 overflow-y-auto bg-white rounded-xl shadow-xl border-2 border-[#547792]/10 p-2 z-50 flex flex-col gap-1">
                                        <p className="px-2 py-1 text-[9px] uppercase tracking-widest font-black text-[#94B4C1]/50 mb-1">Drag or Click to Insert</p>
                                        {placeholders.map((header) => {
                                            const tag = `{{${header}}}`;
                                            return (
                                                <div
                                                    key={header}
                                                    draggable
                                                    onDragStart={(e) => handleDragStartTag(e, tag)}
                                                    onClick={() => insertText(tag)}
                                                    className="px-3 py-2 hover:bg-[#EAE0CF] hover:text-[#213448] rounded-lg text-xs font-bold text-[#547792] cursor-pointer transition-colors flex items-center gap-2 select-none"
                                                >
                                                    <div className="w-1.5 h-1.5 bg-[#94B4C1] rounded-full opacity-50" />
                                                    {tag}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
                {isUploading && (
                    <div className="flex items-center gap-2 text-[#94B4C1] text-xs font-bold uppercase tracking-widest animate-pulse">
                        <Loader2 size={14} className="animate-spin" />
                        Processing Assets...
                    </div>
                )}
            </div>

            <div className="relative z-10">
                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    spellCheck={false}
                    onInput={handleInput}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="min-h-[300px] w-full rounded-[24px] border-2 border-[#547792]/10 bg-[#EAE0CF]/20 px-6 sm:px-10 py-8 text-sm sm:text-base text-[#213448] placeholder:text-[#94B4C1]/40 focus-visible:outline-none focus:ring-4 focus:ring-[#94B4C1]/10 hover:border-[#94B4C1]/30 transition-all font-sans leading-relaxed outline-none overflow-y-auto block shadow-inner"
                    style={{ position: 'relative' }}
                />
                {!value && (
                    <div className="absolute top-8 left-6 sm:left-10 text-[#94B4C1]/40 pointer-events-none">
                        {placeholder}
                    </div>
                )}

                {/* Image Resize Overlay */}
                {selectedImg && overlayStyle && (
                    <div ref={overlayRef} style={overlayStyle}>
                        {/* Selection border */}
                        <div style={{
                            position: 'absolute',
                            inset: -2,
                            border: '2px solid #547792',
                            borderRadius: 8,
                            pointerEvents: 'none',
                        }} />

                        {/* Size label */}
                        <div style={{
                            position: 'absolute',
                            bottom: -28,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: '#213448',
                            color: '#EAE0CF',
                            fontSize: 10,
                            fontWeight: 800,
                            padding: '3px 10px',
                            borderRadius: 8,
                            whiteSpace: 'nowrap',
                            letterSpacing: '0.05em',
                            pointerEvents: 'none',
                        }}>
                            {Math.round(selectedImg.getBoundingClientRect().width)} × {Math.round(selectedImg.getBoundingClientRect().height)}
                        </div>

                        {/* Corner handles */}
                        {['nw', 'ne', 'sw', 'se'].map((corner) => {
                            const posStyle: React.CSSProperties = {
                                position: 'absolute',
                                width: 14,
                                height: 14,
                                background: '#547792',
                                border: '2px solid #EAE0CF',
                                borderRadius: 4,
                                cursor: `${corner}-resize`,
                                pointerEvents: 'all',
                                zIndex: 51,
                            };

                            if (corner.includes('n')) posStyle.top = -7;
                            if (corner.includes('s')) posStyle.bottom = -7;
                            if (corner.includes('w')) posStyle.left = -7;
                            if (corner.includes('e')) posStyle.right = -7;

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
