"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
    id: string;
    type: ToastType;
    title?: string;
    message: string;
    duration?: number;
}

type ToastListener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
let listeners: ToastListener[] = [];

function notify() {
    const snapshot = [...toasts];
    listeners.forEach((listener) => {
        listener(snapshot);
    });
}

export const toast = {
    show: (item: Omit<ToastItem, 'id'>) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast: ToastItem = {
            ...item,
            id,
            duration: item.duration ?? 4000,
        };
        toasts = [newToast, ...toasts].slice(0, 5); // limit to 5 active toasts
        notify();
        return id;
    },

    success: (message: string, options?: { title?: string; duration?: number }) => {
        return toast.show({
            type: 'success',
            message,
            title: options?.title,
            duration: options?.duration,
        });
    },

    error: (message: string, options?: { title?: string; duration?: number }) => {
        return toast.show({
            type: 'error',
            message,
            title: options?.title,
            duration: options?.duration ?? 5000,
        });
    },

    info: (message: string, options?: { title?: string; duration?: number }) => {
        return toast.show({
            type: 'info',
            message,
            title: options?.title,
            duration: options?.duration,
        });
    },

    warning: (message: string, options?: { title?: string; duration?: number }) => {
        return toast.show({
            type: 'warning',
            message,
            title: options?.title,
            duration: options?.duration,
        });
    },

    dismiss: (id: string) => {
        toasts = toasts.filter((t) => t.id !== id);
        notify();
    },

    clear: () => {
        toasts = [];
        notify();
    },
};

export const ToastContainer: React.FC = () => {
    const [activeToasts, setActiveToasts] = useState<ToastItem[]>([]);

    useEffect(() => {
        const handler: ToastListener = (updated) => {
            setActiveToasts(updated);
        };
        listeners.push(handler);
        return () => {
            listeners = listeners.filter((l) => l !== handler);
        };
    }, []);

    return (
        <div
            className="fixed bottom-4 right-4 z-[200] flex flex-col-reverse gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
            aria-live="polite"
        >
            <AnimatePresence mode="popLayout">
                {activeToasts.map((item) => (
                    <ToastCard
                        key={item.id}
                        item={item}
                        onDismiss={() => toast.dismiss(item.id)}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

const ToastCard: React.FC<{ item: ToastItem; onDismiss: () => void }> = ({ item, onDismiss }) => {
    const duration = item.duration ?? 4000;

    // Safe timeout-based dismissal (no setState in render phase)
    useEffect(() => {
        if (duration <= 0) return;
        const timer = setTimeout(() => {
            onDismiss();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onDismiss]);

    const getTypeStyles = () => {
        switch (item.type) {
            case 'success':
                return {
                    borderColor: 'border-[#3FB950]/40',
                    barColor: 'bg-[#3FB950]',
                };
            case 'error':
                return {
                    borderColor: 'border-[#F85149]/40',
                    barColor: 'bg-[#F85149]',
                };
            case 'warning':
                return {
                    borderColor: 'border-[#D29922]/40',
                    barColor: 'bg-[#D29922]',
                };
            case 'info':
            default:
                return {
                    borderColor: 'border-[#58A6FF]/40',
                    barColor: 'bg-[#58A6FF]',
                };
        }
    };

    const styles = getTypeStyles();

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.94, transition: { duration: 0.15 } }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={`pointer-events-auto relative w-full bg-[#161B22] border ${styles.borderColor} rounded-xl shadow-2xl overflow-hidden flex flex-col`}
            role="status"
        >
            <div className="p-3.5 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0 pr-1">
                    {item.title && (
                        <h5 className="text-xs font-semibold text-[#E6EDF3] leading-tight mb-0.5">
                            {item.title}
                        </h5>
                    )}
                    <p className="text-xs text-[#C9D1D9] leading-snug break-words">
                        {item.message}
                    </p>
                </div>

                <button
                    onClick={onDismiss}
                    className="p-1 rounded-md text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D] transition-colors shrink-0 -mr-1 -mt-1 cursor-pointer"
                    aria-label="Close notification"
                >
                    <X size={14} />
                </button>
            </div>

            {/* Hardware-accelerated auto-dismiss progress bar */}
            {duration > 0 && (
                <div className="h-[2px] w-full bg-[#0D1117] overflow-hidden">
                    <motion.div
                        className={`h-full ${styles.barColor}`}
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: duration / 1000, ease: "linear" }}
                    />
                </div>
            )}
        </motion.div>
    );
};
