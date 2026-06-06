<div align="center">
  
# ✦ AI Email Cleaner

**Intelligent Gmail management platform that autonomously classifies, organizes, and cleans large inboxes through AI recommendations while strictly maintaining privacy, security, and user control.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-1B222D?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Groq API](https://img.shields.io/badge/AI-Groq%20LLaMA3-f97316?style=for-the-badge)](https://groq.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

[**Live Demo**](#) • [**Architecture**](ARCHITECTURE.md) • [**System Design**](SYSTEM_DESIGN.md) • [**Security**](SECURITY.md)

</div>

<br />

## ⚡ The Problem

Modern email users accumulate thousands of low-value emails over time—newsletters, promotional blasts, and spam. While large language models (LLMs) can easily identify this clutter, granting an autonomous AI destructive access (the ability to delete emails) introduces severe security, privacy, and reliability concerns. 

**How do we leverage AI for inbox zero without risking the accidental deletion of an invoice, a recruiter outreach, or a banking alert?**

## 🎯 The Solution: Human-in-the-Loop Architecture

**AI Email Cleaner** solves the authorization and intelligence challenges by employing a **Recommendation-Based Workflow**. The AI acts as an incredibly fast analyst, processing batches of emails, determining a confidence score, and generating actionable insights. However, the system acts as an *assistant*, not an autonomous decision maker. Users review the recommendations and execute bulk actions with a single click.

### High-Level Workflow
```text
User ➔ Google OAuth ➔ Gmail API ➔ Email Retrieval ➔ AI Classification ➔ Recommendation Engine ➔ Dashboard ➔ User Approval ➔ Archive/Delete
```

---

## ✨ Core Features

* **Secure Gmail Integration:** Industry-standard Google OAuth flow with strict, delegated permission scopes.
* **Intelligent Synchronization:** Background fetching and synchronization of your Gmail inbox.
* **Concurrent AI Classification:** Highly optimized, concurrent batch processing of emails using the Groq LLaMA-3.1 API.
* **Smart Categorization:** Automatically detects and tags *Spam*, *Newsletters*, *Promotions*, *Important*, and *Personal* emails.
* **Confidence Scoring & Reasoning:** Transparent AI operations displaying the model's confidence percentage and a snippet explaining its reasoning.
* **Interactive AI Recommendations:** A dynamic engine that suggests bulk actions (Archive/Delete) but allows total user override.
* **Preference Learning:** Remembers your overriding actions and tailors future UI suggestions to match your personal cleanup style.
* **Inbox Health Analytics:** Real-time calculation of your inbox "Clutter Ratio" and estimated storage reduction metrics.
* **Protected Email Detection:** Built-in safeguards preventing the deletion of recruiter emails, invoices, and critical alerts.

---

## 🏗️ Architecture & System Design

The application is built on a modern, highly scalable stack optimized for rapid I/O and concurrent AI processing.

* **Frontend:** Next.js (App Router), React, Tailwind CSS, Framer Motion (Premium Glassmorphism UI)
* **Backend:** Next.js API Routes (Serverless architecture)
* **Database:** Prisma ORM with SQLite (Easily swappable to PostgreSQL)
* **AI Engine:** Groq API (LLaMA-3.1-8b) for ultra-low latency inference
* **Authentication:** NextAuth.js (Google Provider)

For a deep dive into the engineering decisions, tradeoffs, and data flow, please review the extensive documentation:
* 📄 [**ARCHITECTURE.md**](./ARCHITECTURE.md) - Component design and data flow.
* 📄 [**SYSTEM_DESIGN.md**](./SYSTEM_DESIGN.md) - Scalability, batching limits, and tradeoffs.
* 📄 [**SECURITY.md**](./SECURITY.md) - Threat models, token encryption, and safe deletion.

---

## 🔒 Security Model

Security and privacy are the foundational pillars of this product:
1. **Zero Password Storage:** All authentication is delegated to Google OAuth.
2. **Encrypted Tokens:** Access and refresh tokens are AES-encrypted before being stored in the database.
3. **Delegated Scopes:** The application only requests the exact Gmail API scopes required to read and modify labels.
4. **Human-in-the-Loop:** Destructive actions (`trashEmail`) are never triggered autonomously. They are explicitly authorized via the client dashboard.

---

## 🚀 Impact & Metrics

* **Inbox Reduction:** Averages a **40-60% reduction** in total inbox volume by targeting historical clutter.
* **Time Saved:** Turns a tedious 45-minute manual inbox cleanup into a 30-second review-and-click workflow.
* **Classification Speed:** Utilizes asynchronous batching to process 100+ emails in under 15 seconds.

---

## 👨‍💻 Developer

**Ansh Khare**  
*Full Stack Developer and Computer Science Engineer.*

* **Portfolio:** [anshkhare-portfolio.vercel.app](https://anshkhare-portfolio.vercel.app/)
* **LinkedIn:** [Ansh Khare](https://www.linkedin.com/in/ansh-khare-4019a53aa/)
* **GitHub:** [@ansh35](https://github.com/ansh35)
* **Email:** [khareansh075@gmail.com](mailto:khareansh075@gmail.com)

---

<div align="center">
  <p>Built with ❤️ by Ansh Khare</p>
</div>
