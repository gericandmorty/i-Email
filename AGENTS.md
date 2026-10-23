# AI Agent Operating Guidelines & Rules (`AGENTS.md`)

Welcome to the **iEmail** codebase. This file establishes mandatory rules, operating workflows, architectural boundaries, and coding standards for all AI coding assistants (including Antigravity, Claude, Cursor, Windsurf, Copilot, and automated subagents).

---

## 🚨 MANDATORY DIRECTIVE: READ DOCUMENTATION FIRST

> **CRITICAL RULE**: Before proposing changes, generating code, refactoring logic, touching endpoints, or modifying authentication, **YOU MUST READ THE RELEVANT DOCUMENTATION** in [`frontend/documentation/`](./documentation/README.md).
>
> Making assumptions without consulting the project documentation is strictly prohibited.

### 📚 Documentation Lookup Guide

Refer to this index to identify which documentation file you must read before starting work on a task:

| Domain / Task | File to Read Before Touching Code |
|---|---|
| **API Endpoints, SSE Streams, REST Payloads** | [`documentation/api/API_DOCUMENTATION.md`](./documentation/api/API_DOCUMENTATION.md) |
| **System Design, Data Flows, UI Theme, Parsing** | [`documentation/architecture/ARCHITECTURE.md`](./documentation/architecture/ARCHITECTURE.md) |
| **Environment Variables, Google OAuth, Local Setup** | [`documentation/getting-started/GETTING_STARTED.md`](./documentation/getting-started/GETTING_STARTED.md) |
| **Security Audits, Secrets, CVEs, Token Handling** | [`documentation/security/SECURITY_AUDIT.md`](./documentation/security/SECURITY_AUDIT.md) |
| **General Overview & Quick Index** | [`documentation/README.md`](./documentation/README.md) |

---

## 🏛️ Project Architecture & Inviolable Guardrails

### 1. Privacy-First "Zero-Retention" Rule
- **Client-Side Parsing Only**: Recipient lists (`.xlsx`, `.xls`, `.csv`) must **always** be parsed inside the user's browser via [`frontend/lib/excel-utils.ts`](./lib/excel-utils.ts) using SheetJS (`xlsx`).
- **No Raw File Retention**: Never upload raw contact spreadsheets to external databases, S3 buckets, or the backend database.
- Email contents and contact lists are transmitted to the backend only at the instant of user-triggered dispatch via streaming SSE (`POST /send-emails`).

### 2. Design System & Aesthetics (GitHub Dark Theme)
- All frontend components must strictly adhere to the GitHub Dark visual language.
- Standard color tokens:
  - Background Canvas: `#0D1117`
  - Card & Surface: `#161B22`
  - Elevated Surface: `#21262D`
  - Borders: `#30363D`
  - Accent / Links / Active Highlights: `#58A6FF` (Hover: `#79B8FF`)
  - Primary Action / Send Button: `#238636` (Hover: `#2EA043`)
  - Typography: `#E6EDF3` (Headings & Primary Text), `#8B949E` (Secondary / Muted)
  - Danger / Error: `#F85149`
  - Warning: `#D29922`
  - Success: `#3FB950`
- Do not introduce arbitrary colors or bright white backgrounds. Maintain dark mode glassmorphism and subtle borders (`border-[#30363D]`).

### 3. Authentication & Secrets Safeguards
- **Service Account Protection**: Never track `service.json`, `.env`, or `.env.local` in Git. Always check `.gitignore`.
- **OAuth Scopes**: Google OAuth must strictly request:
  - `https://www.googleapis.com/auth/gmail.send`
  - `https://www.googleapis.com/auth/userinfo.email`
  - `https://www.googleapis.com/auth/userinfo.profile`
- **Session Identification**: A client `deviceId` stored in `localStorage` is used to pair browser sessions with backend token records. Always verify `deviceId` or Firebase Auth ID tokens on sensitive endpoints.

### 4. Real-time Dispatch Protocol (SSE)
- Email sending must always support real-time progress feedback via Server-Sent Events (`text/event-stream`).
- Do not convert batch sending to a blocking synchronous HTTP call.

---

## 🔄 AI Agent Operating Protocol

When responding to user requests, you must follow this 4-step sequence:

```
┌────────────────────────┐
│ 1. READ DOCUMENTATION  │  Inspect matching file(s) in frontend/documentation/
└───────────┬────────────┘
            │
┌───────────▼────────────┐
│ 2. VERIFY PATTERNS     │  Check existing components, hooks, or backend services
└───────────┬────────────┘
            │
┌───────────▼────────────┐
│ 3. IMPLEMENT SAFELY    │  Write modular TypeScript, enforce dark theme & zero-retention
└───────────┬────────────┘
            │
┌───────────▼────────────┐
│ 4. SYNC DOCUMENTATION  │  Update documentation files if APIs, schemas, or flows change
└────────────────────────┘
```

### Documentation Synchronization Requirement
Whenever you:
1. Add, modify, or remove an API endpoint: Update [`documentation/api/API_DOCUMENTATION.md`](./documentation/api/API_DOCUMENTATION.md).
2. Change environment variables or setup steps: Update [`documentation/getting-started/GETTING_STARTED.md`](./documentation/getting-started/GETTING_STARTED.md).
3. Introduce a architectural change or library: Update [`documentation/architecture/ARCHITECTURE.md`](./documentation/architecture/ARCHITECTURE.md).
4. Discover or patch a security vulnerability: Update [`documentation/security/SECURITY_AUDIT.md`](./documentation/security/SECURITY_AUDIT.md).
