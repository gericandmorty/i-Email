import { useEffect } from 'react';

/**
 * Custom hook to lock body scrolling without layout shift (flickering).
 * Automatically calculates scrollbar width and applies padding compensation.
 */
export function useScrollLock(lock: boolean) {
    useEffect(() => {
        if (!lock || typeof window === 'undefined') return;

        const body = document.body;
        const originalOverflow = body.style.overflow;
        const originalPaddingRight = body.style.paddingRight;

        // Calculate scrollbar width
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        if (scrollbarWidth > 0) {
            body.style.paddingRight = `${scrollbarWidth}px`;
        }
        body.style.overflow = 'hidden';

        return () => {
            body.style.overflow = originalOverflow;
            body.style.paddingRight = originalPaddingRight;
        };
    }, [lock]);
}
