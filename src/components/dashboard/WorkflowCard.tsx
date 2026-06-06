"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Database, Mail, Sparkles, Trash } from "lucide-react";

export function WorkflowCard() {
  return (
    <Card className="flex flex-col h-full lg:col-span-3 bg-white/40 dark:bg-black/20 backdrop-blur-xl border-white/40 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] relative overflow-hidden">
      <div className="absolute -z-10 top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-green-500/5 pointer-events-none"></div>
      <CardHeader>
        <CardTitle className="flex items-center">
          How It Works
        </CardTitle>
        <CardDescription>
          The pipeline that keeps your inbox clean automatically.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex items-center justify-center p-6">
        <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-4xl space-y-4 md:space-y-0 text-center">
          
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-2">
              <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-medium">Email Sync</span>
            <span className="text-xs text-muted-foreground">Google OAuth</span>
          </div>
          
          <ArrowRight className="hidden md:block h-5 w-5 text-muted-foreground opacity-50" />
          
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mb-2">
              <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm font-medium">AI Classification</span>
            <span className="text-xs text-muted-foreground">LLaMA Analysis</span>
          </div>
          
          <ArrowRight className="hidden md:block h-5 w-5 text-muted-foreground opacity-50" />
          
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mb-2">
              <Database className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm font-medium">Recommendations</span>
            <span className="text-xs text-muted-foreground">Actionable Insights</span>
          </div>
          
          <ArrowRight className="hidden md:block h-5 w-5 text-muted-foreground opacity-50" />
          
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center mb-2">
              <Trash className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-sm font-medium">Archive/Delete</span>
            <span className="text-xs text-muted-foreground">Clean Inbox</span>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
