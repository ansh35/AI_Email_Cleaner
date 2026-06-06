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

  // Use prisma.$transaction to run all queries over a SINGLE database connection. 
  // This prevents the Supabase connection pool from crashing!
  const [
    total,
    important,
    promotions,
    newsletters,
    spam,
    personal,
    unclassified,
    emailsProcessed,
    averageConfidenceResult,
    preferences,
    aggSpam,
    sampleSpam,
    aggNewsletter,
    sampleNewsletter,
    aggPromotion,
    samplePromotion
  ] = await prisma.$transaction([
    prisma.email.count({ where: { userId: user.id, isArchived: false, isTrashed: false } }),
    prisma.email.count({ where: { userId: user.id, isArchived: false, isTrashed: false, category: "Important" } }),
    prisma.email.count({ where: { userId: user.id, isArchived: false, isTrashed: false, category: "Promotion" } }),
    prisma.email.count({ where: { userId: user.id, isArchived: false, isTrashed: false, category: "Newsletter" } }),
    prisma.email.count({ where: { userId: user.id, isArchived: false, isTrashed: false, category: "Spam" } }),
    prisma.email.count({ where: { userId: user.id, isArchived: false, isTrashed: false, category: "Personal" } }),
    prisma.email.count({ 
      where: { 
        userId: user.id, 
        isArchived: false, 
        isTrashed: false, 
        OR: [{ category: null }, { classificationStatus: "PENDING" }, { classificationStatus: "FAILED" }] 
      } 
    }),
    prisma.email.count({ where: { userId: user.id, classificationStatus: "CLASSIFIED" } }),
    prisma.email.aggregate({
      where: { userId: user.id, classificationStatus: "CLASSIFIED" },
      _avg: { confidence: true }
    }),
    prisma.categoryPreference.findMany({ where: { userId: user.id } }),
    
    // AI Stats Spam
    prisma.email.aggregate({ where: { userId: user.id, category: "Spam", isArchived: false, isTrashed: false, classificationStatus: "CLASSIFIED" }, _avg: { confidence: true } }),
    prisma.email.findFirst({ where: { userId: user.id, category: "Spam", isArchived: false, isTrashed: false, aiReason: { not: null } }, select: { aiReason: true } }),
    
    // AI Stats Newsletter
    prisma.email.aggregate({ where: { userId: user.id, category: "Newsletter", isArchived: false, isTrashed: false, classificationStatus: "CLASSIFIED" }, _avg: { confidence: true } }),
    prisma.email.findFirst({ where: { userId: user.id, category: "Newsletter", isArchived: false, isTrashed: false, aiReason: { not: null } }, select: { aiReason: true } }),
    
    // AI Stats Promotion
    prisma.email.aggregate({ where: { userId: user.id, category: "Promotion", isArchived: false, isTrashed: false, classificationStatus: "CLASSIFIED" }, _avg: { confidence: true } }),
    prisma.email.findFirst({ where: { userId: user.id, category: "Promotion", isArchived: false, isTrashed: false, aiReason: { not: null } }, select: { aiReason: true } })
  ]);

  const cleanupCandidates = promotions + newsletters + spam;
  const reductionPercentage = total > 0 ? Math.round((cleanupCandidates / total) * 100) : 0;
  const avgConfidence = averageConfidenceResult._avg.confidence ? Math.round(averageConfidenceResult._avg.confidence * 100) : 0;

  const stats = { total, important, promotions, newsletters, spam, personal, unclassified, cleanupCandidates };

  const prefsMap = {
    Spam: preferences.find(p => p.category === "Spam")?.action,
    Newsletter: preferences.find(p => p.category === "Newsletter")?.action,
    Promotion: preferences.find(p => p.category === "Promotion")?.action,
  };

  const aiDetails = {
    Spam: { 
      avgConfidence: aggSpam._avg.confidence ? Math.round(aggSpam._avg.confidence * 100) : 0, 
      reason: sampleSpam?.aiReason || "Identified based on typical patterns." 
    },
    Newsletter: { 
      avgConfidence: aggNewsletter._avg.confidence ? Math.round(aggNewsletter._avg.confidence * 100) : 0, 
      reason: sampleNewsletter?.aiReason || "Identified based on typical patterns." 
    },
    Promotion: { 
      avgConfidence: aggPromotion._avg.confidence ? Math.round(aggPromotion._avg.confidence * 100) : 0, 
      reason: samplePromotion?.aiReason || "Identified based on typical patterns." 
    },
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
