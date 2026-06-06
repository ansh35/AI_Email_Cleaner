# Architecture

The AI Email Cleaner is designed as a secure, full-stack web application optimized for asynchronous third-party API integration and concurrent AI inferencing. The architecture prioritizes data privacy, responsiveness, and safe fault tolerance.

## High-Level System Architecture

```text
+-------------------+       +-----------------------+       +------------------------+
|                   |       |                       |       |                        |
|   Client Device   | <---> |   Next.js App Server  | <---> |   Database (SQLite)    |
|   (Web Browser)   |       |   (Serverless/Node)   |       |   (Prisma ORM)         |
|                   |       |                       |       |                        |
+-------------------+       +-----------------------+       +------------------------+
        ^                               ^                               ^
        |                               |                               |
        v                               v                               v
+-------------------+       +-----------------------+       +------------------------+
|                   |       |                       |       |                        |
|   Google OAuth    |       |       Gmail API       |       |       Groq API         |
|   (NextAuth.js)   |       |   (googleapis SDK)    |       |     (LLaMA-3.1-8b)     |
|                   |       |                       |       |                        |
+-------------------+       +-----------------------+       +------------------------+
```

## Core Components

### 1. Frontend Layer (Next.js App Router)
* **Framework:** React 18, Next.js 14
* **Styling:** Tailwind CSS, Framer Motion
* **Responsibility:** Delivers the interactive "Glassmorphism" UI. Client components (`"use client"`) handle state (e.g., syncing progress, batching state) and user interactions (bulk actions, preference selections).
* **Communication Flow:** Makes asynchronous HTTP `POST` and `GET` calls to Next.js API Routes.

### 2. Authentication & Authorization Layer
* **Provider:** NextAuth.js
* **Responsibility:** Manages user sessions via Google OAuth. It requests restricted scopes (`https://mail.google.com/`) necessary for managing inbox states. 
* **Data Flow:** Captures OAuth `access_token` and `refresh_token`, encrypts them, and stores them in the database for secure offline access via the backend.

### 3. Backend Layer (Next.js API Routes)
* **Framework:** Node.js (V8)
* **Responsibility:** Acts as the secure orchestrator. It holds the logic for querying the Gmail API, communicating with the LLM, and manipulating the database.
* **Key Endpoints:**
  * `/api/emails`: Initiates background fetching of new emails from Gmail.
  * `/api/emails/unclassified`: Retrieves IDs of fetched emails awaiting classification.
  * `/api/emails/classify-batch`: Processes a chunk of emails by routing them to the Groq AI engine.
  * `/api/actions/bulk-recommendations`: Applies the user's approved cleanup actions back to the Gmail API (trash/archive).

### 4. Database Layer (Prisma ORM)
* **Provider:** SQLite (Configured for easy migration to PostgreSQL for horizontal scaling).
* **Responsibility:** Maintains state decoupled from Gmail.
* **Schemas:** 
  * `User`, `Account`, `Session` (Auth)
  * `Email` (Stores metadata, category, confidence score, AI reasoning, and sync status)
  * `CategoryPreference` (Stores user overrides for specific categories to personalize future recommendations).

### 5. AI Classification Engine
* **Provider:** Groq API running `llama-3.1-8b-instant`.
* **Responsibility:** Receives sanitized email payloads (Sender, Subject, Snippet) and returns structured JSON conforming to the schema: `{ category, confidence, reason }`.
* **Flow:** The engine strictly enforces system prompts that mandate safe categorization (e.g., preventing invoices or job offers from being flagged as Spam).

## Data & Communication Flow: The Sync Lifecycle

1. **Initiation:** The user clicks "Sync Emails" on the client.
2. **Retrieval:** Client POSTs to `/api/emails`. The server uses the stored Google OAuth token to fetch the latest 50-100 emails via the Gmail API, saving their metadata to the database with a `PENDING` classification status.
3. **Batching:** The client queries `/api/emails/unclassified` to get a list of unclassified email IDs.
4. **Concurrent Inferencing:** The client slices the IDs into manageable batches (e.g., 5 at a time) and sends them to `/api/emails/classify-batch`. 
5. **AI Processing:** The server resolves these concurrently using `Promise.all` against the Groq API. The prompt mandates JSON output. The database is updated with the results.
6. **Dashboard Refresh:** The UI updates, calculating the new "Clutter Ratio" and rendering actionable AI Recommendations based on the newly classified data and historical `CategoryPreferences`.
