"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, CheckCircle2, Inbox, Percent } from "lucide-react";

export function AIStats({ 
  emailsProcessed, 
  successRate = 100, 
  avgConfidence, 
  removable 
}: { 
  emailsProcessed: number, 
  successRate?: number, 
  avgConfidence: number, 
  removable: number 
}) {
  return (
    <Card className="flex flex-col h-full bg-white/40 dark:bg-black/20 backdrop-blur-xl border-white/40 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
      <div className="absolute -z-10 top-1/2 left-1/2 w-full h-full bg-blue-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BrainCircuit className="mr-2 h-5 w-5" />
          AI Analytics
        </CardTitle>
        <CardDescription>
          Performance metrics for the classification engine.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/50 dark:bg-black/30 backdrop-blur-md border border-white/40 dark:border-white/10 p-3 rounded-xl flex flex-col justify-center shadow-sm hover:scale-105 transition-transform">
            <div className="flex items-center space-x-2 text-muted-foreground mb-1">
              <Inbox className="h-4 w-4 text-primary" />
              <span className="text-xs uppercase tracking-wider">Processed</span>
            </div>
            <div className="text-2xl font-bold">{emailsProcessed}</div>
          </div>
          
          <div className="bg-white/50 dark:bg-black/30 backdrop-blur-md border border-white/40 dark:border-white/10 p-3 rounded-xl flex flex-col justify-center shadow-sm hover:scale-105 transition-transform">
            <div className="flex items-center space-x-2 text-muted-foreground mb-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-xs uppercase tracking-wider">Success</span>
            </div>
            <div className="text-2xl font-bold">{successRate}%</div>
          </div>
          
          <div className="bg-white/50 dark:bg-black/30 backdrop-blur-md border border-white/40 dark:border-white/10 p-3 rounded-xl flex flex-col justify-center shadow-sm hover:scale-105 transition-transform">
            <div className="flex items-center space-x-2 text-muted-foreground mb-1">
              <Percent className="h-4 w-4 text-blue-500" />
              <span className="text-xs uppercase tracking-wider">Confidence</span>
            </div>
            <div className="text-2xl font-bold">{avgConfidence}%</div>
          </div>
          
          <div className="bg-white/50 dark:bg-black/30 backdrop-blur-md border border-white/40 dark:border-white/10 p-3 rounded-xl flex flex-col justify-center shadow-sm hover:scale-105 transition-transform">
            <div className="flex items-center space-x-2 text-muted-foreground mb-1">
              <Trash2Icon className="h-4 w-4 text-red-500" />
              <span className="text-xs uppercase tracking-wider">Removable</span>
            </div>
            <div className="text-2xl font-bold text-red-500">{removable}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Inline Icon to avoid extra imports
function Trash2Icon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}
