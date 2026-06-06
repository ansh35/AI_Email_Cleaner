import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, Shield, Zap } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col relative overflow-hidden bg-background text-foreground">
      {/* Background Orbs */}
      <div className="absolute -z-10 top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute -z-10 bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none"></div>
      <header className="px-4 lg:px-6 h-16 flex items-center border-b border-white/10 bg-white/5 dark:bg-black/10 backdrop-blur-xl z-50">
        <Link className="flex items-center justify-center gap-2 group" href="/">
          <div className="bg-primary/20 p-1.5 rounded-lg group-hover:bg-primary/30 transition-colors">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">AI Email Cleaner</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/login">
            <Button variant="ghost" className="hover:bg-white/10 rounded-xl transition-all">Login</Button>
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 flex justify-center">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/50 pb-2">
                  Take back control of your inbox
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Automatically categorize your emails with AI. Find what matters, archive the rest. Clean your inbox in seconds, not hours.
                </p>
              </div>
              <div className="space-x-4 pt-8">
                <Link href="/login">
                  <Button size="lg" className="h-14 px-8 text-lg rounded-2xl transition-all hover:scale-105 shadow-[0_0_40px_-10px_rgba(255,255,255,0.2)] dark:shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)]">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 flex justify-center border-t border-white/10 bg-white/5 dark:bg-black/5 backdrop-blur-sm relative">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center bg-white/10 dark:bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-md shadow-sm hover:scale-105 transition-transform duration-500">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 shadow-inner">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Lightning Fast</h3>
                <p className="text-muted-foreground">Powered by Groq AI, classify thousands of emails in seconds.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center bg-white/10 dark:bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-md shadow-sm hover:scale-105 transition-transform duration-500">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/20 shadow-inner">
                  <Shield className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold">Secure & Private</h3>
                <p className="text-muted-foreground">Tokens are encrypted. We only request read and modify permissions, no password sharing.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center bg-white/10 dark:bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-md shadow-sm hover:scale-105 transition-transform duration-500">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/20 shadow-inner">
                  <Mail className="h-8 w-8 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold">Bulk Actions</h3>
                <p className="text-muted-foreground">Archive or trash hundreds of promotional emails with a single click.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-white/10 bg-background/50 backdrop-blur-md">
        <p className="text-xs text-muted-foreground">© 2026 AI Email Cleaner. All rights reserved.</p>
      </footer>
    </div>
  );
}
