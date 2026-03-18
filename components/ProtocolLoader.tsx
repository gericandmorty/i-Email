"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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
            "flex flex-col items-center justify-center transition-all duration-700",
            variant === 'overlay' ? "fixed inset-0 bg-[#EAE0CF]/95 backdrop-blur-xl z-[9999]" : "w-full py-8",
            className
        )}>
            <div className="relative w-24 h-24">
                {/* Outer Rotating Square - Technical Frame */}
                <motion.div
                    className="absolute inset-0 border-2 border-[#213448]/10 rounded-2xl"
                    animate={{ rotate: 180 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />

                {/* Inner Scanning Bar */}
                <motion.div
                    className="absolute top-0 left-0 right-0 h-[2px] bg-[#94B4C1] shadow-[0_0_15px_rgba(148,180,193,0.5)] z-10"
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Geometric Core */}
                <div className="absolute inset-4 flex items-center justify-center">
                    <motion.div
                        className="w-12 h-12 border-4 border-[#213448] border-t-transparent rounded-full shadow-2xl"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                    />
                </div>

                {/* Corner Accents */}
                {[0, 90, 180, 270].map((deg) => (
                    <motion.div
                        key={deg}
                        className="absolute w-2 h-2 bg-[#213448]"
                        style={{
                            left: deg === 0 || deg === 270 ? -1 : 'auto',
                            right: deg === 90 || deg === 180 ? -1 : 'auto',
                            top: deg === 0 || deg === 90 ? -1 : 'auto',
                            bottom: deg === 180 || deg === 270 ? -1 : 'auto',
                        }}
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: deg / 360 }}
                    />
                ))}
            </div>

            <div className="mt-8 flex flex-col items-center gap-2">
                <motion.span
                    className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-[#213448] text-center px-4"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    {label}
                </motion.span>
                <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-1 h-1 bg-[#94B4C1] rounded-full"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        />
                    ))}
                </div>
            </div>

            {variant === 'overlay' && (
                <div className="absolute bottom-12 left-0 right-0 flex justify-center">
                    <div className="px-6 py-2 border border-[#213448]/10 rounded-full">
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#94B4C1]">
                            iEmail Engine
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};
