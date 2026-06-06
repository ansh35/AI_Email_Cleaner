# System Design

## 1. Problem Statement
Users face overwhelming inbox clutter, but delegating deletion authority to an autonomous AI presents unacceptable risks. The system must process thousands of emails rapidly, classify them accurately using LLMs, and present the data to the user for safe, one-click bulk remediation, all while managing strict rate limits from third-party APIs (Google & Groq).

## 2. Design Decisions & Tradeoffs

### Database: SQLite vs. PostgreSQL
* **Decision:** SQLite via Prisma ORM.
* **Reasoning:** For the MVP and portfolio demonstration, SQLite allows zero-configuration deployments. Because the Prisma schema abstracts the underlying engine, switching to PostgreSQL for multi-tenant horizontal scaling requires changing only the provider connection string. 
* **Tradeoff:** SQLite locks the entire database during writes (e.g., during the concurrent AI batch classification). This is mitigated by Prisma's connection pooling and short-lived transactions.

### AI Inferencing: Groq vs. OpenAI
* **Decision:** Groq API running `llama-3.1-8b-instant`.
* **Reasoning:** Processing hundreds of emails requires massive concurrency and low latency. Groq provides ultra-fast inference (LPU architecture) resulting in ~0.5s response times for classification payloads, vastly outperforming standard OpenAI endpoints for this specific classification task.
* **Tradeoff:** LLaMA-3.1-8b is a smaller model than GPT-4. To ensure high accuracy, we heavily engineer the system prompt, specifically instructing the model to output strict JSON schemas and providing detailed exclusionary rules (e.g., "If an email contains an invoice, it is NEVER spam").

### Architecture: Client-Side Orchestration vs. Background Workers
* **Decision:** Client-side batch orchestration.
* **Reasoning:** Instead of utilizing heavy background task queues (Redis/BullMQ), the client orchestrates the classification loop. The client fetches unclassified IDs, chunks them into batches of 5, and sequentially calls the `/api/emails/classify-batch` route using `Promise.all`.
* **Tradeoff:** If the user closes the browser tab during a sync, classification halts. However, this ensures the user is present and engaged, allows for real-time progress bar UI updates (e.g., `50/133`), and prevents the server from being overwhelmed or hitting rate limits autonomously.

## 3. Core System Workflows

### Classification Flow
1. **Sanitization:** Before sending to the AI, email bodies are stripped of HTML tags and truncated to a strict token limit to save bandwidth and prevent context window overflow.
2. **Prompting:** The AI receives the `Sender`, `Subject`, and `Snippet`. 
3. **Structured Output:** The LLM is forced to return a JSON object:
   ```json
   {
     "category": "Newsletter",
     "confidence": 0.95,
     "reason": "Contains unsubscribe links and marketing language."
   }
   ```
4. **Resilience:** If the JSON parsing fails or the API times out, the classification status is marked `FAILED` rather than halting the batch loop. It will be retried on the next sync.

### Recommendation Flow & Preference Learning
When rendering the dashboard, the system doesn't just assume "Spam" should be deleted. 
1. The server queries the `CategoryPreference` table.
2. If the user previously selected "Archive" for Newsletters and clicked "Remember My Preference", the database saves this state.
3. The next time the dashboard loads, the Recommendation Engine defaults the Newsletter dropdown to "Archive", seamlessly adapting to the user's specific workflow.

## 4. Scalability Considerations
* **Stateless API:** Next.js API routes are entirely stateless, allowing infinite horizontal scaling.
* **Rate Limiting:** The classification engine processes batches concurrently but enforces a hard `500ms` delay between batches to respect Groq API rate limits.
* **Pagination:** The Gmail API fetcher relies on `pageToken`s to prevent memory overflow when pulling large inboxes.
