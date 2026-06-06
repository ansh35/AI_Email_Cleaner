# Future Roadmap

AI Email Cleaner is currently in a highly functional MVP state. The architecture was designed specifically with extensibility in mind. The following features represent the next phases of product development.

## Phase 1: Enhanced Intelligence & AI Workflows
* **AI Inbox Chat:** Integrate a ChatGPT-like interface where users can ask natural language questions about their inbox (e.g., "Did my landlord send the lease agreement?", "Summarize the emails from AWS this week").
* **Email Summaries:** Automatically generate 2-sentence bulleted summaries for long, thread-heavy "Important" emails, drastically reducing reading time.
* **Smart Cleanup Rules:** Transition from static Category Preferences to Dynamic Rules. If the user consistently archives a specific newsletter, the system will prompt: "Would you like to auto-archive all future emails from `newsletter@company.com`?"

## Phase 2: Search & Retrieval
* **Vector Search & RAG Integration:** Instead of simple keyword searches, implement a vector database (e.g., Pinecone or pgvector) to store email embeddings. This will allow for semantic, conceptual search across the entire inbox history using Retrieval-Augmented Generation (RAG).
* **Natural Language Querying:** Map queries like "Find the flight tickets for my trip to Japan" to complex GraphQL or Prisma queries against the metadata and vector stores.

## Phase 3: Platform Expansion
* **One-Click Unsubscribe:** Detect unsubscribe links inside marketing HTML payloads and execute HTTP GET/POST requests or send `mailto:` unsubscribe triggers in the background, permanently stopping the clutter at the source.
* **Multi-Account Support:** Allow users to link multiple Google accounts (Personal, Work, Side Hustle) and manage them from a unified dashboard.
* **Team Inbox Management:** Extend the architecture for B2B use cases, allowing Customer Support teams to use the AI to triage shared inboxes (e.g., `support@startup.com`) into Urgent, Feature Request, and Bug categories.

## Phase 4: Advanced Analytics & UX
* **Time-Saved Metrics:** Calculate and display the exact estimated hours saved based on historical read-times vs. bulk deletion actions.
* **Advanced Analytics:** Implement charting libraries (e.g., Recharts) to visualize email inflow over time, tracking which vendors send the most spam over a 30-day trailing period.
