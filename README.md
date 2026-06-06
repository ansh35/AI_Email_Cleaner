# AI Email Cleaner

A modern, high-performance web application designed to help users instantly clean up and organize their inboxes using advanced AI categorization. 

Built with Next.js, Prisma, NextAuth, and Tailwind CSS, this app securely connects to your Gmail inbox, analyzes the content, and categorizes emails into actionable groups (Important, Newsletters, Promotions, Spam) to drastically reduce clutter and save time.

## 🌟 Features

- **OAuth2 Gmail Integration:** Securely authenticate and fetch emails directly from your Gmail account without storing raw passwords.
- **Smart Categorization:** Automatically processes emails into standard categories like Important, Promotions, and Newsletters.
- **Premium Dashboard:** A luxurious, glassmorphic UI featuring a Gold & Silver dark theme to analyze your inbox health.
- **Bulk Cleanup Actions:** Archive or Trash dozens of low-priority emails with a single click.
- **AI Weekly Report:** Deep insights into your email habits, cleanup candidates, and estimated time saved.

## 🛠 Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS + custom CSS variables (oklch)
- **Database:** SQLite (managed via Prisma ORM)
- **Authentication:** NextAuth.js (Google Provider)
- **Icons & Animation:** Lucide-React & Framer Motion

## 🚀 Getting Started

### Prerequisites

You need a Google Cloud Project with the Gmail API enabled to run this locally.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project and enable the **Gmail API**.
3. Configure the OAuth Consent Screen.
4. Create **OAuth 2.0 Client IDs** and obtain your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/ai-email-cleaner.git
   cd ai-email-cleaner
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables by creating a `.env` file:
   ```env
   # Database URL for Prisma
   DATABASE_URL="file:./dev.db"

   # NextAuth Setup
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-random-secret-key-here"

   # Google OAuth Credentials
   GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your_google_client_secret"
   ```

4. Initialize the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📄 License

This project is open-source and available under the MIT License.
