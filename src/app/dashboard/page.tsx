import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { OverviewCards } from "@/components/dashboard/OverviewCards";
import { SyncButton } from "@/components/dashboard/SyncButton";
import { AIRecommendations } from "@/components/dashboard/AIRecommendations";
import { InboxHealth } from "@/components/dashboard/InboxHealth";
import { AIStats } from "@/components/dashboard/AIStats";
import { WorkflowCard } from "@/components/dashboard/WorkflowCard";
import { WeeklyReport } from "@/components/dashboard/WeeklyReport";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) redirect("/login");

  // Aggregate stats
  const total = await prisma.email.count({ where: { userId: user.id, isArchived: false, isTrashed: false } });
  const important = await prisma.email.count({ where: { userId: user.id, isArchived: false, isTrashed: false, category: "Important" } });
  const promotions = await prisma.email.count({ where: { userId: user.id, isArchived: false, isTrashed: false, category: "Promotion" } });
  const newsletters = await prisma.email.count({ where: { userId: user.id, isArchived: false, isTrashed: false, category: "Newsletter" } });
  const spam = await prisma.email.count({ where: { userId: user.id, isArchived: false, isTrashed: false, category: "Spam" } });
  const personal = await prisma.email.count({ where: { userId: user.id, isArchived: false, isTrashed: false, category: "Personal" } });
  
  // Unclassified emails are those where category is null or classificationStatus is not CLASSIFIED
  const unclassified = await prisma.email.count({ 
    where: { 
      userId: user.id, 
      isArchived: false, 
      isTrashed: false, 
      OR: [{ category: null }, { classificationStatus: "PENDING" }, { classificationStatus: "FAILED" }] 
    } 
  });

  const cleanupCandidates = promotions + newsletters + spam;
  const reductionPercentage = total > 0 ? Math.round((cleanupCandidates / total) * 100) : 0;
  
  // Stats for AI Analytics
  const emailsProcessed = await prisma.email.count({ where: { userId: user.id, classificationStatus: "CLASSIFIED" } });
  const averageConfidenceResult = await prisma.email.aggregate({
    where: { userId: user.id, classificationStatus: "CLASSIFIED" },
    _avg: { confidence: true }
  });
  const avgConfidence = averageConfidenceResult._avg.confidence ? Math.round(averageConfidenceResult._avg.confidence * 100) : 0;

  const stats = { total, important, promotions, newsletters, spam, personal, unclassified, cleanupCandidates };

  // Fetch Preferences
  const preferences = await prisma.categoryPreference.findMany({
    where: { userId: user.id }
  });

  const prefsMap = {
    Spam: preferences.find(p => p.category === "Spam")?.action,
    Newsletter: preferences.find(p => p.category === "Newsletter")?.action,
    Promotion: preferences.find(p => p.category === "Promotion")?.action,
  };

  // Fetch AI Stats per category
  const getCategoryStats = async (categoryName: string) => {
    const agg = await prisma.email.aggregate({
      where: { userId: user.id, category: categoryName, isArchived: false, isTrashed: false, classificationStatus: "CLASSIFIED" },
      _avg: { confidence: true },
    });
    
    const sample = await prisma.email.findFirst({
      where: { userId: user.id, category: categoryName, isArchived: false, isTrashed: false, aiReason: { not: null } },
      select: { aiReason: true }
    });

    return {
      avgConfidence: agg._avg.confidence ? Math.round(agg._avg.confidence * 100) : 0,
      reason: sample?.aiReason || "Identified based on typical patterns."
    };
  };

  const aiDetails = {
    Spam: await getCategoryStats("Spam"),
    Newsletter: await getCategoryStats("Newsletter"),
    Promotion: await getCategoryStats("Promotion"),
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <SyncButton />
        </div>
      </div>

      <OverviewCards stats={stats} />
      
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-1 h-full">
          <AIRecommendations 
            stats={stats} 
            reductionPercentage={reductionPercentage} 
            prefsMap={prefsMap}
            aiDetails={aiDetails}
          />
        </div>
        <div className="lg:col-span-2 flex flex-col justify-start space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <InboxHealth stats={stats} />
            <AIStats 
              emailsProcessed={emailsProcessed} 
              avgConfidence={avgConfidence} 
              removable={stats.cleanupCandidates} 
            />
          </div>
          <WorkflowCard />
        </div>
      </div>

      
      {/* AI Weekly Report */}
      <WeeklyReport stats={stats} />
      
      <div className="mt-8">
        <Card className="bg-white/40 dark:bg-black/20 backdrop-blur-xl border-white/40 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)]">
          <div className="flex flex-col sm:flex-row items-center justify-between p-6">
            <div className="space-y-1.5 mb-4 sm:mb-0">
              <h3 className="text-xl font-semibold leading-none tracking-tight">Inbox Overview</h3>
              <p className="text-sm text-muted-foreground">
                View all your emails, filter by classification, and manage them effortlessly.
              </p>
            </div>
            <Link href="/dashboard/emails">
              <Button className="rounded-xl shadow-md hover:shadow-lg transition-all bg-primary text-primary-foreground">
                <Mail className="mr-2 h-4 w-4" />
                View Emails
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
