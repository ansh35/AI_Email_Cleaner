"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

export function InboxHealth({ stats }: { stats: any }) {
  const total = stats.total || 0;
  // Let's define Health Score. A good inbox has high important density and low clutter density.
  // Actually, health score = (Important / Total) * 100, but let's make it more friendly:
  // (Total - CleanupCandidates) / Total * 100
  const cleanEmails = total - stats.cleanupCandidates;
  const healthScore = total > 0 ? Math.round((cleanEmails / total) * 100) : 100;
  
  let status = "Excellent";
  let color = "text-green-500";
  let bgProgress = "bg-green-500";
  
  if (healthScore < 50) {
    status = "Needs Cleanup";
    color = "text-red-500";
    bgProgress = "bg-red-500";
  } else if (healthScore < 80) {
    status = "Good";
    color = "text-yellow-500";
    bgProgress = "bg-yellow-500";
  }

  return (
    <Card className="flex flex-col h-full bg-white/40 dark:bg-black/20 backdrop-blur-xl border-white/40 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
      <div className="absolute -z-10 bottom-0 left-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="mr-2 h-5 w-5" />
          Smart Cleanup Summary
        </CardTitle>
        <CardDescription>
          Overall health score of your inbox based on clutter ratio.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col justify-center space-y-6">
        <div className="flex flex-col items-center justify-center">
          <div className="text-5xl font-bold mb-2">
            {healthScore}<span className="text-2xl text-muted-foreground">%</span>
          </div>
          <div className={`text-lg font-semibold ${color}`}>
            {status}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Clutter</span>
            <span className="text-muted-foreground">Clean</span>
          </div>
          {/* Progress bar needs custom class for color depending on score */}
          <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
            <div 
              className={`h-full ${bgProgress} transition-all duration-500 ease-in-out`} 
              style={{ width: `${healthScore}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
