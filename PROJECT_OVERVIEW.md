# Project Overview

**Developer:** Ansh Khare  
**Role:** Full Stack Developer  
**Contact:** [LinkedIn](https://www.linkedin.com/in/ansh-khare-4019a53aa/) | [Portfolio](https://anshkhare-portfolio.vercel.app/) | [GitHub](https://github.com/ansh35)  

## The Business Problem
Professionals and individuals alike suffer from "inbox bankruptcy." Over months and years, inboxes become paralyzed by thousands of promotional emails, newsletters, and spam. Manual cleanup is tedious, taking hours of scrolling and selecting. While existing AI tools can identify spam, users hesitate to grant autonomous AI full deletion rights to their primary communication channel due to the high risk of false positives (e.g., deleting a job offer or tax document).

## The Solution: AI Email Cleaner
AI Email Cleaner is a high-performance web application that leverages Large Language Models (LLMs) to perform the heavy lifting of categorizing inbox data, while keeping the user firmly in the driver's seat for execution.

It connects securely to Gmail via OAuth, syncs the user's inbox, and concurrently processes emails through the Groq LLaMA-3.1 API. The resulting dashboard provides a bird's-eye view of inbox health and presents a set of AI Recommendations (e.g., "Delete 26 Spam Emails", "Archive 40 Newsletters"). Users review the confidence scores and reasoning, optionally override the suggested actions, and apply bulk cleanup in a single click.

## Technical Architecture & Highlights
* **Modern Stack:** Built on Next.js 14 App Router, React, and Tailwind CSS.
* **Database:** Prisma ORM backed by SQLite for robust relational mapping of user preferences, OAuth sessions, and email metadata.
* **High-Concurrency Processing:** Implements a custom batching engine that processes unclassified emails concurrently (using `Promise.all` over the Groq API), allowing for rapid categorization of hundreds of emails while respecting strict third-party rate limits.
* **Smart UI/UX:** Features a premium "Glassmorphism" aesthetic, real-time sync progress bars, and an interactive pipeline visualizer.
* **Preference Persistence:** Includes a machine-learning-inspired feedback loop. When a user overrides an AI recommendation (e.g., changing "Delete" to "Archive" for Newsletters) and checks "Remember My Preference", the database saves this state, tailoring all future UI recommendations to that specific user's workflow.

## Impact & Results
* **Efficiency:** Reduces a 45-minute manual inbox sorting session into a 30-second review.
* **Accuracy & Transparency:** Instead of a "black box" algorithm, the system displays exact confidence percentages (e.g., `86%`) and the specific reasoning the LLM used to categorize the email.
* **Storage Reduction:** Successfully identifies cleanup candidates that account for, on average, 40-60% of an aged inbox's volume.

## Key Engineering Decisions
* **Human-in-the-Loop:** Designed explicitly to *prevent* autonomous deletion. The backend API requires explicit client-side POST requests triggered by human interaction to alter Gmail state.
* **Groq over OpenAI:** Selected Groq's LPU architecture for inference to achieve ~0.5s response times per payload, which is critical when processing large email arrays where standard API latency would cause unacceptable UX blocking. 
* **NextAuth Security:** Leveraged standard NextAuth.js for secure session management and CSRF protection, completely eliminating the need for custom password management.
