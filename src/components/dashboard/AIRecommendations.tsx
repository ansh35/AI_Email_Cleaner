"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Trash2, Archive, CheckCircle, Brain, Target, Info } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

type ActionType = "DELETE" | "ARCHIVE" | "KEEP";

interface AIRecommendationsProps {
  stats: any;
  reductionPercentage: number;
  prefsMap: Record<string, string | undefined>;
  aiDetails: Record<string, { avgConfidence: number, reason: string }>;
}

export function AIRecommendations({ stats, reductionPercentage, prefsMap, aiDetails }: AIRecommendationsProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // State for selections
  const [selections, setSelections] = useState<Record<string, ActionType>>({
    Spam: (prefsMap.Spam as ActionType) || "DELETE",
    Newsletter: (prefsMap.Newsletter as ActionType) || "ARCHIVE",
    Promotion: (prefsMap.Promotion as ActionType) || "ARCHIVE",
  });

  const [rememberPreference, setRememberPreference] = useState(false);

  const handleApplyActions = async () => {
    setLoading(true);
    toast.info("Processing selections...");
    
    try {
      const res = await fetch("/api/actions/bulk-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          actions: selections,
          rememberPreference
        })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to apply recommendations");
      
      toast.success(`Success! Archived ${data.archived} and Trashed ${data.trashed} emails.`);
      if (rememberPreference) {
        toast.success("Preferences saved for future recommendations.");
      }
      router.refresh();
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const hasRecommendations = stats.spam > 0 || stats.promotions > 0 || stats.newsletters > 0;

  const renderCategory = (category: string, count: number, defaultActionStr: string, icon: any, colorClass: string) => {
    if (count === 0) return null;
    
    const details = aiDetails[category];
    const isOverridden = prefsMap[category] && prefsMap[category] !== defaultActionStr.toUpperCase();

    return (
      <div className={`p-4 rounded-xl border transition-colors ${colorClass} mb-4 relative`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {icon}
            <span className="font-semibold text-base">{category}</span>
            <span className="px-2 py-0.5 rounded-full bg-background/50 text-xs font-bold">{count}</span>
          </div>
          <Select 
            value={selections[category]} 
            onValueChange={(val) => setSelections(s => ({ ...s, [category]: val as ActionType }))}
          >
            <SelectTrigger className="w-[120px] h-8 text-xs bg-background/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DELETE">Delete</SelectItem>
              <SelectItem value="ARCHIVE">Archive</SelectItem>
              <SelectItem value="KEEP">Keep</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col space-y-2 mt-2">
          <div className="flex items-center text-xs text-muted-foreground">
            <Target className="w-3.5 h-3.5 mr-1" />
            <span>AI Suggested Action: <strong className="text-foreground">{defaultActionStr}</strong></span>
            {isOverridden && (
              <span className="ml-2 px-1.5 py-0.5 rounded bg-primary/20 text-[10px] font-medium text-primary">
                Overridden by Preference
              </span>
            )}
          </div>
          
          <div className="flex items-start text-xs text-muted-foreground bg-background/30 p-2 rounded-md">
            <Brain className="w-3.5 h-3.5 mr-1.5 mt-0.5 shrink-0 text-primary" />
            <div>
              <p className="font-medium text-foreground mb-0.5">AI Reasoning ({details.avgConfidence}% Confidence)</p>
              <p className="line-clamp-2">{details.reason}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="flex flex-col h-full bg-card/60 backdrop-blur-xl border-border shadow-sm relative overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-primary">
          <Sparkles className="mr-2 h-5 w-5" />
          AI Recommendations
        </CardTitle>
        <CardDescription>
          Review and override the AI's cleanup suggestions.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto">
        {!hasRecommendations ? (
          <div className="flex flex-col items-center justify-center h-40 text-center space-y-2">
            <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
            <p className="text-muted-foreground">Your inbox is clean!</p>
            <p className="text-sm text-muted-foreground">No recommendations available at this time.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {renderCategory("Spam", stats.spam, "Delete", <Trash2 className="h-4 w-4 text-red-500" />, "bg-red-500/5 border-red-500/20")}
            {renderCategory("Newsletter", stats.newsletters, "Archive", <Archive className="h-4 w-4 text-blue-500" />, "bg-blue-500/5 border-blue-500/20")}
            {renderCategory("Promotion", stats.promotions, "Archive", <Archive className="h-4 w-4 text-green-500" />, "bg-green-500/5 border-green-500/20")}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col gap-4 pt-4 border-t border-border/50">
        {hasRecommendations && (
          <div className="flex items-center space-x-2 w-full px-1">
            <Checkbox 
              id="remember" 
              checked={rememberPreference} 
              onCheckedChange={(val) => setRememberPreference(!!val)} 
            />
            <label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Remember My Preference
            </label>
            <Info className="w-4 h-4 text-muted-foreground ml-auto" />
          </div>
        )}
        <Button 
          className="w-full font-semibold" 
          onClick={handleApplyActions} 
          disabled={loading || !hasRecommendations}
        >
          {loading ? "Applying..." : "Apply Selected Actions"}
        </Button>
      </CardFooter>
    </Card>
  );
}
