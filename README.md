# iEmail Frontend

iEmail is a high-efficiency bulk email dispatch and campaign management platform built with Next.js, React, and TypeScript. It provides a privacy-first workflow with client-side spreadsheet parsing, real-time Server-Sent Events (SSE) streaming, and a GitHub Dark design system.

## Key Features

- **Bulk Email Dispatch**: Streamlined email campaign delivery with real-time SSE progress streaming and configurable throttle delays.
- **Privacy-First Zero-Retention Parsing**: Contact lists (.xlsx, .xls, .csv) are parsed directly in the browser using SheetJS; raw spreadsheets are never stored on external servers or databases.
- **Campaign & Template Management**: Create, customize, and save email templates with dynamic recipient variable interpolation.
- **Dynamic Live Previews**: Verify exact rendering, formatting, and recipient assignments before triggering dispatch.
- **Secure Authentication**: Google OAuth integration via Firebase Auth for authorized Gmail API dispatch directly through authenticated accounts.
- **GitHub Dark Design System**: Cohesive, accessible dark interface engineered for productivity and visual focus.

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Icons & Motion**: Lucide React, Framer Motion
- **Spreadsheet Processing**: SheetJS (xlsx)
- **Authentication**: Firebase Authentication (Google OAuth provider)

## Prerequisites

- Node.js v18.18+ or v20+
- npm or pnpm / yarn / bun
- Running iEmail backend service (NestJS)

## Environment Configuration

Create a `.env.local` file in the `frontend` root directory with the following variables:

```env
# Backend API Base URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Getting Started

1. Install project dependencies:

```bash
npm install
```

2. Start the local development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev`: Starts the Next.js development server with hot reloading.
- `npm run build`: Compiles the application for production deployment.
- `npm run start`: Runs the compiled production build.
- `npm run lint`: Runs ESLint checks across the codebase.

## Documentation

Comprehensive architectural specifications, security guidelines, and API references are available in the documentation directory:

- [Documentation Hub](./documentation/README.md) - Master documentation index
- [Getting Started & Local Setup](./documentation/getting-started/GETTING_STARTED.md) - Environment and configuration guides
- [Architecture & System Design](./documentation/architecture/ARCHITECTURE.md) - Data flows, zero-retention model, and design tokens
- [API Documentation](./documentation/api/API_DOCUMENTATION.md) - Backend REST and SSE endpoint specifications
- [Security Audit Report](./documentation/security/SECURITY_AUDIT.md) - Security vulnerability analysis and token safety

## Contributing & Agent Guidelines

All AI coding assistants and contributors must read and follow the workspace rules in [AGENTS.md](./AGENTS.md) before making modifications to the codebase.

## Support & Contact

For support, questions, or backend repository access, contact:

- Email: [gericmorit.dev@gmail.com](mailto:gericmorit.dev@gmail.com)
