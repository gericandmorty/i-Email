# iEmail Backend API Documentation

This document describes all endpoints provided by the iEmail NestJS backend server.

---

## 1. General Information

- **Development Base URL**: `http://localhost:3001`
- **Production Base URL**: Configured via `NEXT_PUBLIC_BACKEND_URL` (e.g. `https://i-email-backend.vercel.app`)
- **Allowed Frontend Origins**: `http://localhost:3000`, `https://i-email.vercel.app`
- **Content-Type**:
  - Most endpoints: `application/json`
  - `/send-emails`: `multipart/form-data` (response: `text/event-stream`)

---

## 2. Authentication Endpoints (`/auth`)

### 2.1. Redirect to Google OAuth
Initiates the server-side OAuth2 flow with Google.

- **Method**: `GET`
- **Path**: `/auth/google`
- **Query Parameters**:
  - `deviceId` (string, optional): Unique client identifier passed into OAuth `state`.
- **Response**: HTTP 302 Redirect to Google's OAuth 2.0 consent page.

---

### 2.2. Google OAuth Callback
Handles Google's redirect after the user authorizes scopes.

- **Method**: `GET`
- **Path**: `/auth/google/callback`
- **Query Parameters**:
  - `code` (string, required): Authorization code from Google.
  - `state` (string, optional): Client `deviceId`.
- **Response**: HTTP 302 Redirect to `${FRONTEND_URL}?auth=success`.
- **Action**: Exchanges code for access & refresh tokens, saves them into Firestore (`user_tokens/{email}`).

---

### 2.3. Sync Client Authentication (`/auth/sync`)
Synchronizes client-side Firebase credentials to the backend.

- **Method**: `POST`
- **Path**: `/auth/sync`
- **Request Body** (`application/json`):
  ```json
  {
    "email": "user@example.com",
    "name": "Jane Doe",
    "picture": "https://lh3.googleusercontent.com/...",
    "token_json": "{\"token\":\"ya29...\",\"refresh_token\":\"1//...\"}",
    "deviceId": "dev_1729600000_abc123"
  }
  ```
- **Response** (HTTP 200):
  ```json
  {
    "status": "success"
  }
  ```

---

### 2.4. List Connected Accounts (`/auth/accounts`)
Returns Google accounts associated with the calling device.

- **Method**: `GET`
- **Path**: `/auth/accounts`
- **Query Parameters**:
  - `deviceId` (string, required for security): Filter accounts linked to this device.
- **Response** (HTTP 200):
  ```json
  {
    "accounts": [
      {
        "email": "user@example.com",
        "name": "Jane Doe",
        "picture": "https://lh3.googleusercontent.com/..."
      }
    ]
  }
  ```

---

## 3. Email Dispatch Endpoint (`/send-emails`)

Dispatches personalized bulk emails and streams live progress back via Server-Sent Events (SSE).

- **Method**: `POST`
- **Path**: `/send-emails`
- **Content-Type**: `multipart/form-data`
- **Response Content-Type**: `text/event-stream`

### Request Form Fields

| Field Name | Type | Description |
|---|---|---|
| `sender` | string | Email address of the authenticated sender |
| `subject` | string | Email subject line with template tags (e.g. `Hello {{Name}}`) |
| `body` | string | HTML email body with template tags |
| `recipients` | string (JSON array) | JSON-serialized array of recipient objects containing `email` and mapped columns |
| `delay` | string (number) | Pause in seconds between each email (e.g. `3`) |
| `attachments` | File[] (optional) | One or more binary files attached to all outgoing emails |

### SSE Stream Events

#### 1. Progress Event (`type: 'progress'`)
Sent after each individual email attempt:
```json
{
  "type": "progress",
  "index": 0,
  "email": "recipient1@example.com",
  "success": true,
  "current_success": 1,
  "current_fail": 0,
  "total": 50
}
```

#### 2. Completion Event (`type: 'complete'`)
Sent when all recipients in the batch have been processed:
```json
{
  "type": "complete",
  "total_sent": 48,
  "total_failed": 2,
  "history": [
    {
      "recipient_email": "recipient1@example.com",
      "subject": "Hello Alice",
      "success": true
    }
  ]
}
```

---

## 4. Templates Endpoints (`/templates`)

Stores and retrieves custom user templates in Firestore under `user_tokens/{email}/templates`.

### 4.1. List Saved Templates
- **Method**: `GET`
- **Path**: `/templates?email={userEmail}`
- **Response**:
  ```json
  {
    "templates": [
      {
        "id": "tpl_123",
        "name": "Welcome Note",
        "subject": "Welcome aboard {{Name}}!",
        "body": "<p>Hi {{Name}}, glad to have you...</p>",
        "updated_at": "2026-10-22T08:00:00.000Z"
      }
    ]
  }
  ```

### 4.2. Create Template
- **Method**: `POST`
- **Path**: `/templates`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "name": "Monthly Newsletter",
    "subject": "Updates for {{Month}}",
    "body": "<h1>Monthly News</h1>..."
  }
  ```

### 4.3. Update Template
- **Method**: `PUT`
- **Path**: `/templates/:id`
- **Body**: Same as Create Template.

### 4.4. Delete Template
- **Method**: `DELETE`
- **Path**: `/templates/:id?email={userEmail}`
- **Response**: `{ "status": "deleted", "id": "tpl_123" }`

---

## 5. History Endpoints (`/history`)

Tracks sent emails per sender in Firestore (`user_tokens/{email}/dispatch_history`).

### 5.1. List History
- **Method**: `GET`
- **Path**: `/history?email={userEmail}`
- **Response**:
  ```json
  {
    "history": [
      {
        "id": "hist_abc123",
        "recipient_email": "john@doe.com",
        "subject": "Hello John",
        "success": true,
        "timestamp": "2026-10-22T08:15:00.000Z"
      }
    ]
  }
  ```

### 5.2. Clear History
- **Method**: `DELETE`
- **Path**: `/history?email={userEmail}`
- **Response**: `{ "success": true }`
