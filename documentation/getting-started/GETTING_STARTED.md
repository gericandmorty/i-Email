# Getting Started with iEmail

This guide explains how to configure, run, and develop the iEmail application locally.

---

## 1. Prerequisites

- **Node.js**: `v18.18+` or `v20+`
- **npm** or **bun**
- **Google Cloud Console Account**: With Gmail API enabled.
- **Firebase Project**: With Authentication (Google Provider) and Cloud Firestore enabled.

---

## 2. Environment Variables

### 2.1. Frontend (`frontend/.env.local`)
Create a file at `frontend/.env.local`:

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

### 2.2. Backend (`backend/.env`)
Create a file at `backend/.env`:

```env
PORT=3001
FRONTEND_URL=http://localhost:3000

# Google OAuth Credentials (for server-side token refresh)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback

# Firebase Admin Service Account Credentials (preferred over service.json)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
```

---

## 3. Running Locally

### Step 1: Start the Backend
```bash
cd backend
npm install
npm run start:dev
```
The NestJS backend will start listening at `http://localhost:3001`.

### Step 2: Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
The Next.js frontend will be accessible at `http://localhost:3000`.

---

## 4. Google Cloud Console Configuration

1. Visit [Google Cloud Console](https://console.cloud.google.com/).
2. Enable the **Gmail API**:
   - Go to **APIs & Services** > **Library** > Search for **Gmail API** > Click **Enable**.
3. Configure the **OAuth Consent Screen**:
   - User Type: **External**
   - Scopes: Add `https://www.googleapis.com/auth/gmail.send`, `userinfo.email`, and `userinfo.profile`.
4. Create **OAuth 2.0 Client IDs**:
   - Application Type: **Web application**
   - Authorized JavaScript Origins:
     - `http://localhost:3000`
     - `https://i-email.vercel.app` (production)
   - Authorized Redirect URIs:
     - `http://localhost:3001/auth/google/callback`
     - `https://your-backend.vercel.app/auth/google/callback` (production)

---

## 5. Building for Production

### Frontend:
```bash
cd frontend
npm run build
npm run start
```

### Backend:
```bash
cd backend
npm run build
npm run start:prod
```
