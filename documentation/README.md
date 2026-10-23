# iEmail Technical Documentation Hub

Welcome to the **iEmail** documentation directory. This repository contains the complete technical specifications, architectural designs, API references, security audit reports, and developer setup guides for the iEmail platform.

---

## 📁 Segregated Documentation Structure

```
frontend/documentation/
├── README.md                          # Master documentation index & navigation hub (this file)
├── getting-started/
│   └── GETTING_STARTED.md             # Prerequisites, environment variables, local setup & cloud configuration
├── architecture/
│   └── ARCHITECTURE.md                # System design, data flows, SSE pipelines, design system tokens
├── api/
│   └── API_DOCUMENTATION.md           # Backend REST endpoints, OAuth routes, SSE streaming specs
└── security/
    └── SECURITY_AUDIT.md              # Vulnerability matrix, credential safeguards, remediation plan
```

---

## 🧭 Documentation Index

| Section | Document | Description |
|---|---|---|
| 🚀 **Getting Started** | [**Getting Started & Setup Guide**](./getting-started/GETTING_STARTED.md) | Prerequisites, environment variable setups (`.env.local` & `.env`), local dev commands, and Google Cloud Console OAuth configuration |
| 🏗️ **Architecture** | [**Architecture & System Design**](./architecture/ARCHITECTURE.md) | High-level architecture, client-side zero-retention Excel/CSV parser, SSE streaming email dispatch pipeline, and GitHub Dark theme tokens |
| 🪟 **UI & Modals** | [**UI & Modal Audit Report**](./architecture/UI_MODAL_AUDIT.md) | Audit of modal lifecycles, backdrop dismissal fixes, streaming progress modal, and auth state management |
| 🔌 **API Reference** | [**Backend API Reference**](./api/API_DOCUMENTATION.md) | Complete REST & SSE API specification (`/auth`, `/send-emails`, `/templates`, `/history`, and `/auth/sync`) |
| 🛡️ **Security** | [**Security Audit Report**](./security/SECURITY_AUDIT.md) | Vulnerability analysis (credential exposure, unauthenticated endpoints, XSS mitigations, key rotation, and audit matrix) |

---

## ⚡ Quick Reference

### Frontend Stack
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Theme**: GitHub Dark Theme (`#0D1117`, `#161B22`, `#21262D`, `#30363D`, `#238636`, `#58A6FF`)
- **Parsing**: Client-side XLSX & CSV parser (`xlsx`) with zero-retention guarantee (files parsed in browser memory only)
- **Icons & Motion**: Lucide React + Framer Motion

### Backend Stack
- **Framework**: NestJS 11 + Express + TypeScript
- **Integrations**: Google Gmail API (`googleapis`), Firebase Admin SDK (`firebase-admin`), Sharp
- **Streaming**: Server-Sent Events (SSE) via RxJS Observables

---

## 🤖 Instructions for AI Coding Agents

All AI assistants and automated coding agents modifying this project must adhere to [**AGENTS.md**](../AGENTS.md). 
**Rule #1**: Always read the corresponding documentation file before suggesting or implementing changes to authentication, APIs, architecture, or frontend components.

---

## 🚨 Critical Action Items

Please review the [Security Audit Report](./security/SECURITY_AUDIT.md) for urgent remediation tasks:
1. Revoke the Google service account key for `iemail-abe84`.
2. Ensure `backend/service.json` remains ignored and removed from git cache.
3. Enforce token verification guard on `POST /send-emails`.
