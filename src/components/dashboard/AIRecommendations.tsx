"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Trash2, Archive, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function AIRecommendations({ stats, reductionPercentage }: { stats: any, reductionPercentage: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleApplyAll = async () => {
    setLoading(true);
    toast.info("Applying AI recommendations...", { description: "This might take a moment if you have many emails." });
    
    try {
      const res = await fetch("/api/actions/bulk-recommendations", {
        method: "POST"
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to apply recommendations");
      
      toast.success(`Success! Archived ${data.archived} and Trashed ${data.trashed} emails.`);
      router.refresh();
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApplySpecific = async (target: string) => {
    setLoading(true);
    toast.info(`Applying ${target} recommendations...`);
    
    try {
      const res = await fetch("/api/actions/bulk-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to apply recommendations");
      
      toast.success(`Success! Processed ${data.archived + data.trashed} ${target} emails.`);
      router.refresh();
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const hasRecommendations = stats.spam > 0 || stats.promotions > 0 || stats.newsletters > 0;

  return (
    <Card className="flex flex-col h-full bg-white/40 dark:bg-black/20 backdrop-blur-xl border-white/40 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
      <div className="absolute -z-10 top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <CardHeader>
        <CardTitle className="flex items-center text-primary">
          <Sparkles className="mr-2 h-5 w-5" />
          AI Recommendations
        </CardTitle>
        <CardDescription>
          Based on your inbox patterns, here is what our AI suggests.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4">
        {!hasRecommendations ? (
          <div className="flex flex-col items-center justify-center h-32 text-center space-y-2">
            <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
            <p className="text-muted-foreground">Your inbox is clean!</p>
            <p className="text-sm text-muted-foreground">No recommendations available at this time.</p>
          </div>
        ) : (
          <>
            {stats.spam > 0 && (
              <button 
                onClick={() => handleApplySpecific("Spam")}
                disabled={loading}
                className="w-full flex items-center justify-between p-3 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 rounded-lg border border-red-100 dark:border-red-900/30 transition-colors text-left disabled:opacity-50"
              >
                <div className="flex items-center space-x-3">
                  <Trash2 className="h-4 w-4 text-red-500" />
                  <span className="font-medium text-sm">Delete Spam</span>
                </div>
                <span className="font-bold text-red-600 dark:text-red-400">{stats.spam} Emails</span>
              </button>
            )}
            
            {stats.newsletters > 0 && (
              <button 
                onClick={() => handleApplySpecific("Newsletter")}
                disabled={loading}
                className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-950/40 rounded-lg border border-blue-100 dark:border-blue-900/30 transition-colors text-left disabled:opacity-50"
              >
                <div className="flex items-center space-x-3">
                  <Archive className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-sm">Archive Newsletters</span>
                </div>
                <span className="font-bold text-blue-600 dark:text-blue-400">{stats.newsletters} Emails</span>
              </button>
            )}

            {stats.promotions > 0 && (
              <button 
                onClick={() => handleApplySpecific("Promotion")}
                disabled={loading}
                className="w-full flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 dark:bg-green-950/20 dark:hover:bg-green-950/40 rounded-lg border border-green-100 dark:border-green-900/30 transition-colors text-left disabled:opacity-50"
              >
                <div className="flex items-center space-x-3">
                  <Archive className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-sm">Archive Promotions</span>
                </div>
                <span className="font-bold text-green-600 dark:text-green-400">{stats.promotions} Emails</span>
              </button>
            )}
            
            <div className="pt-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Estimated Inbox Reduction:</span>
                <span className="text-sm font-bold">{reductionPercentage}%</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
      
      <CardFooter className="flex gap-2">
        <Button 
          className="w-full" 
          onClick={handleApplyAll} 
          disabled={loading || !hasRecommendations}
        >
          {loading ? "Applying..." : "Apply All Recommendations"}
        </Button>
      </CardFooter>
    </Card>
  );
}
