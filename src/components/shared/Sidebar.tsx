"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, LayoutDashboard, Settings, LogOut, Inbox } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r border-white/40 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -z-10 top-0 left-0 w-full h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none translate-x-[-50%] translate-y-[-50%]"></div>
      
      <div className="flex h-14 items-center border-b border-white/40 dark:border-white/10 px-4">
        <Link className="flex items-center gap-2 font-semibold group" href="/">
          <div className="bg-primary/20 p-1.5 rounded-lg group-hover:bg-primary/30 transition-colors">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <span className="tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">AI Email Cleaner</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-2 px-3">
          <Link href="/dashboard">
            <span className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 hover:scale-[1.02] ${pathname === "/dashboard" ? "bg-white/60 dark:bg-white/10 text-foreground shadow-sm border border-white/40 dark:border-white/10 backdrop-blur-md" : "text-muted-foreground hover:bg-white/30 dark:hover:bg-white/5 hover:text-foreground"}`}>
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </span>
          </Link>
          <Link href="/dashboard/emails">
            <span className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 hover:scale-[1.02] ${pathname === "/dashboard/emails" ? "bg-white/60 dark:bg-white/10 text-foreground shadow-sm border border-white/40 dark:border-white/10 backdrop-blur-md" : "text-muted-foreground hover:bg-white/30 dark:hover:bg-white/5 hover:text-foreground"}`}>
              <Inbox className="h-4 w-4" />
              Emails
            </span>
          </Link>
          <Link href="/dashboard/settings">
            <span className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 hover:scale-[1.02] ${pathname === "/dashboard/settings" ? "bg-white/60 dark:bg-white/10 text-foreground shadow-sm border border-white/40 dark:border-white/10 backdrop-blur-md" : "text-muted-foreground hover:bg-white/30 dark:hover:bg-white/5 hover:text-foreground"}`}>
              <Settings className="h-4 w-4" />
              Settings
            </span>
          </Link>
        </nav>
      </div>
      <div className="mt-auto border-t border-white/40 dark:border-white/10 p-4">
        <Button variant="ghost" className="w-full justify-start rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/30 dark:hover:bg-white/5 transition-colors" onClick={() => signOut({ callbackUrl: "/" })}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
