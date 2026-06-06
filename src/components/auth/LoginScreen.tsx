"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { motion } from "framer-motion";

export function LoginScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 relative overflow-hidden text-foreground">
      {/* Background Orbs */}
      <div className="absolute -z-10 top-0 left-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] translate-x-[-20%] translate-y-[-20%] pointer-events-none"></div>
      <div className="absolute -z-10 bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] translate-x-[20%] translate-y-[20%] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="w-full max-w-md shadow-2xl bg-white/40 dark:bg-black/20 backdrop-blur-xl border-white/40 dark:border-white/10 relative overflow-hidden">
          <div className="absolute -z-10 inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
          <CardHeader className="space-y-1 items-center text-center">
            <div className="bg-white/50 dark:bg-white/10 p-4 rounded-2xl mb-4 shadow-inner border border-white/20 dark:border-white/5">
              <Mail className="w-8 h-8 text-primary drop-shadow-md" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/60 pb-1">AI Email Cleaner</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Login with your Google account to manage your inbox
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4 pt-4">
          <Button 
            variant="outline" 
            className="w-full h-14 rounded-xl text-base font-medium transition-all duration-300 hover:scale-[1.02] bg-white/50 dark:bg-black/30 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-sm hover:shadow-md" 
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>
          <div className="text-center text-xs text-muted-foreground/80 mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </div>
        </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
