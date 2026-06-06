"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SyncButton() {
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const router = useRouter();

  const handleSync = async () => {
    setLoading(true);
    setProgressText("Fetching emails from Gmail...");
    const startTime = Date.now();

    try {
      // Step 1: Fetch emails from Gmail
      const syncRes = await fetch("/api/emails", { method: "POST" });
      if (!syncRes.ok) throw new Error("Sync failed to fetch from Gmail");
      const syncData = await syncRes.json();
      const fetchedCount = syncData.count || 0;

      // Step 2: Get unclassified email IDs
      setProgressText("Identifying unclassified emails...");
      const unclassifiedRes = await fetch("/api/emails/unclassified");
      if (!unclassifiedRes.ok) throw new Error("Failed to fetch unclassified emails");
      const { ids } = await unclassifiedRes.json();

      const totalToClassify = ids.length;

      if (totalToClassify === 0) {
        const timeTaken = Math.round((Date.now() - startTime) / 1000);
        toast.success(`Sync Complete`, {
          description: `${fetchedCount} emails retrieved. 0 remaining unclassified. Estimated time: ${timeTaken}s.`
        });
        setLoading(false);
        setProgressText("");
        router.refresh();
        return;
      }

      // Step 3: Classify in batches
      setProgressText(`Analyzing ${totalToClassify} emails... 0/${totalToClassify}`);
      
      const batchSize = 10;
      let classifiedCount = 0;

      for (let i = 0; i < totalToClassify; i += batchSize) {
        const chunk = ids.slice(i, i + batchSize);
        
        const classifyRes = await fetch("/api/emails/classify-batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: chunk })
        });

        if (!classifyRes.ok) {
          console.error(`Failed to classify batch ${i/batchSize + 1}`);
        } else {
          const { processed } = await classifyRes.json();
          classifiedCount += processed;
        }

        setProgressText(`Analyzing ${totalToClassify} emails... ${Math.min(i + batchSize, totalToClassify)}/${totalToClassify}`);
        
        // Artificial delay to prevent aggressive rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const timeTaken = Math.round((Date.now() - startTime) / 1000);
      
      // Final Statistics Toast
      toast.success("Sync Complete", {
        description: `${fetchedCount} Emails Retrieved\n${classifiedCount} Emails Classified\n0 Remaining Unclassified\nEstimated Processing Time: ${timeTaken} Seconds`,
        duration: 8000,
      });

    } catch (error) {
      console.error(error);
      toast.error("An error occurred during synchronization.");
    } finally {
      setLoading(false);
      setProgressText("");
      router.refresh();
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {loading && progressText && (
        <span className="text-sm text-muted-foreground animate-pulse">
          {progressText}
        </span>
      )}
      <Button onClick={handleSync} disabled={loading} variant="outline" className="border-primary/50 hover:bg-primary/10">
        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        {loading ? "Syncing..." : "Sync Emails"}
      </Button>
    </div>
  );
}
