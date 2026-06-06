"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SyncButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSync = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/emails", { method: "POST" });
      if (!res.ok) throw new Error("Sync failed");
      
      toast.success("Sync triggered successfully. Emails are being fetched in the background.");
      router.refresh();
    } catch (error) {
      toast.error("Failed to sync emails.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleSync} disabled={loading} variant="outline">
      <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Syncing..." : "Sync Emails"}
    </Button>
  );
}
