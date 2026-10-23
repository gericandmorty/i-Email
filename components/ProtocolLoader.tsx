"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ProtocolLoaderProps {
    label?: string;
    variant?: 'inline' | 'overlay';
    className?: string;
}

export const ProtocolLoader: React.FC<ProtocolLoaderProps> = ({
    label = "Loading...",
    variant = "inline",
    className
}) => {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center transition-all",
            variant === 'overlay' ? "fixed inset-0 bg-[#0D1117]/80 backdrop-blur-sm z-[9999]" : "w-full py-8",
            className
        )}>
            <div className="relative flex items-center justify-center w-12 h-12 rounded-lg bg-[#161B22] border border-[#30363D] shadow-sm">
                <Loader2 className="w-5 h-5 text-[#58A6FF] animate-spin" />
            </div>

            <div className="mt-4 flex flex-col items-center gap-1.5">
                <span className="text-xs font-mono font-medium text-[#E6EDF3] tracking-wide">
                    {label}
                </span>
                <span className="text-[11px] font-mono text-[#8B949E]">
                    iEmail system service
                </span>
            </div>
        </div>
    );
};
