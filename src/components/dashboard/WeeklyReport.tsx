"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, BarChart, Clock, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

export function WeeklyReport({ stats }: { stats: any }) {
  const total = stats.total || 0;
  const reductionPercentage = total > 0 ? Math.round((stats.cleanupCandidates / total) * 100) : 0;
  const timeSaved = Math.round(stats.cleanupCandidates * 0.5); 

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants as any}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      className="space-y-6"
    >
      <div className="flex items-center space-x-2 mt-8 mb-4">
        <Sparkles className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold tracking-tight">AI Weekly Report</h2>
      </div>

      <motion.div variants={itemVariants as any}>
        <Card className="bg-white/40 dark:bg-black/20 backdrop-blur-xl border-white/40 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] relative overflow-hidden">
          <div className="absolute -z-10 top-0 left-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl -translate-x-1/2 pointer-events-none"></div>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <BarChart className="mr-2 h-5 w-5 text-primary" />
              Key Metrics
            </CardTitle>
            <CardDescription>Overview of your inbox analysis this week.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/40 dark:border-white/10">
                <div className="text-sm text-muted-foreground mb-1">Emails Processed</div>
                <div className="text-2xl font-bold">{total}</div>
              </div>
              <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/40 dark:border-white/10">
                <div className="text-sm text-muted-foreground mb-1">Cleanup Candidates</div>
                <div className="text-2xl font-bold text-red-500">{stats.cleanupCandidates}</div>
              </div>
              <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/40 dark:border-white/10">
                <div className="text-sm text-muted-foreground mb-1">Important Emails</div>
                <div className="text-2xl font-bold text-green-500">{stats.important}</div>
              </div>
              <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/40 dark:border-white/10">
                <div className="text-sm text-muted-foreground mb-1">Spam</div>
                <div className="text-2xl font-bold text-orange-500">{stats.spam}</div>
              </div>
              <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/40 dark:border-white/10">
                <div className="text-sm text-muted-foreground mb-1">Newsletters</div>
                <div className="text-2xl font-bold text-blue-500">{stats.newsletters}</div>
              </div>
              <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/40 dark:border-white/10">
                <div className="text-sm text-muted-foreground mb-1">Promotions</div>
                <div className="text-2xl font-bold text-teal-500">{stats.promotions}</div>
              </div>
              <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/40 dark:border-white/10">
                <div className="text-sm text-muted-foreground mb-1 flex items-center"><Clock className="w-3 h-3 mr-1"/> Time Saved</div>
                <div className="text-2xl font-bold text-primary">{timeSaved} Min</div>
              </div>
              <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/40 dark:border-white/10">
                <div className="text-sm text-muted-foreground mb-1 flex items-center"><TrendingDown className="w-3 h-3 mr-1"/> Reduction</div>
                <div className="text-2xl font-bold text-primary">{reductionPercentage}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
