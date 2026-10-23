# UI & Modal Architecture Audit Report

**Date**: October 2026  
**Component**: Frontend (Next.js 16 App Router / React 19)  
**Status**: All Findings Resolved & Implemented

---

## 1. Executive Summary

An audit of modal behavior, event management, and authentication/dispatch state was conducted across the iEmail frontend application. Prior to this remediation, multiple interactive modals exhibited critical user friction issues:
- Unresponsive backdrop clicks (users clicking outside a modal were unable to dismiss it).
- Premature modal closure during async Google authentication without feedback.
- Missing dispatch progress visibility during bulk email streaming.
- Unhandled popup dismissal throwing native browser `alert()` popups.
- Missing background scroll locks leading to disorienting page scrolling while modals were open.

All identified vulnerabilities and UX bottlenecks were resolved through a dedicated modal lifecycle architecture.

---

## 2. Issues Matrix & Resolutions

| Issue ID | Area | Severity | Root Cause | Resolution |
|---|---|---|---|---|
| **MOD-01** | `LoginModal` Backdrop Click | **High** | The outer dialog container at `z-[101]` overlapped the backdrop (`z-[100]`), intercepting clicks without an `onClick` handler. Clicking outside the modal had no effect. | Added `onClick={onClose}` on the backdrop wrapper with `e.stopPropagation()` on the modal dialog card. |
| **MOD-02** | `LoginModal` Premature Dismissal | **High** | Clicking "Continue with Google" immediately invoked `onClose()` before `signInWithPopup` completed or failed. | Added async loading state (`isBusy`), animated spinner (`Loader2`), disabled button during submission, and kept modal open until resolved. |
| **MOD-03** | Google Auth Cancellation Alert | **Medium** | Dismissing or switching Google OAuth popup (`auth/popup-closed-by-user`) threw an intrusive browser `alert()`. | Added graceful catch in `page.tsx` and `LoginModal` to ignore voluntary user dismissal without intrusive alerts. |
| **MOD-04** | Body Scroll Leak | **Medium** | Modals did not lock background scrolling on `document.body`. | Implemented `useEffect` body scroll lock (`overflow: hidden`) on `LoginModal`, `DispatchModal`, `TemplatesView`, and history deletion. |
| **MOD-05** | Send Email Confirmation & Progress | **High** | Confirmation modal dismissed immediately upon send confirmation; active SSE streaming progress was hidden in the left sidebar, with no modal protection against accidental tab closure. | Built unified [`DispatchModal.tsx`](file:///home/gericandmorty/Desktop/Projects/iEmail/frontend/components/DispatchModal.tsx) managing Pre-flight Confirmation, Live SSE Streaming Progress, Error Retry, and Completion Summary with `beforeunload` warning. |
| **MOD-06** | Native Alert on Send Failure | **Medium** | Network or backend errors during email dispatch called native blocking `alert()`. | Integrated clean in-modal GitHub Dark error banner with "Retry Sending" and "Close" actions. |
| **MOD-07** | Brand Identity & Site Icon | **Medium** | Icon lacked brand cohesion and was not aligned with GitHub Dark aesthetic. | Created custom GitHub Octocat-inspired Email icon (SVG, PNG, ICO) across all resolutions and built reusable [`BrandLogo`](file:///home/gericandmorty/Desktop/Projects/iEmail/frontend/components/BrandLogo.tsx) component. |
| **MOD-08** | Background Layout Shift & GPU Repaint Flicker | **High** | When modals opened or were clicked, locking `overflow: hidden` dropped the browser scrollbar, causing the whole page to expand/jump 8–15px. In addition, `backdrop-filter: blur` forced Chromium GPU compositor repaints on every click. | Added `scrollbar-gutter: stable` in `globals.css`, created [`lib/use-scroll-lock.ts`](file:///home/gericandmorty/Desktop/Projects/iEmail/frontend/lib/use-scroll-lock.ts) for padding compensation, applied `isolation: isolate` on modal roots, and replaced GPU-heavy backdrop blur with clean hardware-accelerated dark tint (`bg-[#04070A]/80`). |

---

## 3. Implementation Verification

- **Production Build**: Verified with `npm run build` (Next.js 16.1.6 Turbopack) — passed with 0 errors.
- **Type Safety**: Verified TypeScript strict mode across all modal components and event handlers.
