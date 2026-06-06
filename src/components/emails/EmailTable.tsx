"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Archive, Trash2, Search, Filter, AlertTriangle, ShieldAlert, Star, Sparkles, CheckSquare, Square } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

export function EmailTable({ initialEmails }: { initialEmails: any[] }) {
  const [emails, setEmails] = useState(initialEmails);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  
  // Safety Layer States
  const [showWarning, setShowWarning] = useState(false);
  const [pendingAction, setPendingAction] = useState<{action: string, ids: string[]} | null>(null);

  const filteredEmails = emails.filter(e => {
    const matchesSearch = 
      e.subject.toLowerCase().includes(search.toLowerCase()) || 
      e.sender.toLowerCase().includes(search.toLowerCase()) ||
      (e.category && e.category.toLowerCase().includes(search.toLowerCase()));
      
    const matchesCategory = categoryFilter ? 
      (categoryFilter === "Unclassified" ? (!e.category || e.classificationStatus !== "CLASSIFIED") : e.category === categoryFilter)
      : true;

    return matchesSearch && matchesCategory;
  });

  const checkSafety = (action: string, ids: string[]) => {
    if (action !== "trash") return false;
    const keywords = ["invoice", "receipt", "recruiter", "interview", "banking", "statement", "offer"];
    const riskyEmails = emails.filter(e => ids.includes(e.id)).filter(e => {
      if (e.category === "Important") return true;
      const textToSearch = (e.subject + " " + e.snippet).toLowerCase();
      return keywords.some(kw => textToSearch.includes(kw));
    });
    return riskyEmails.length > 0;
  };

  const requestAction = (action: string, ids: string[]) => {
    if (checkSafety(action, ids)) {
      setPendingAction({ action, ids });
      setShowWarning(true);
    } else {
      executeAction(action, ids);
    }
  };

  const executeAction = async (action: string, ids: string[]) => {
    setShowWarning(false);
    if (action === "mark_important") {
      setEmails(emails.map(e => ids.includes(e.id) ? { ...e, category: "Important" } : e));
      setSelectedIds([]);
      toast.success(`Marked ${ids.length} emails as Important.`);
      return;
    }
    try {
      const res = await fetch("/api/actions", {
        method: "POST",
        body: JSON.stringify({ action, emailIds: ids })
      });
      if (!res.ok) throw new Error("Action failed");
      setEmails(emails.filter(e => !ids.includes(e.id)));
      setSelectedIds([]);
      toast.success(`Successfully moved ${ids.length} emails to ${action}.`);
    } catch (error) {
      toast.error(`Failed to ${action} emails.`);
    }
  };

  const getCategoryBadge = (category: string | null) => {
    switch (category) {
      case "Important": return <Badge variant="destructive" className="shadow-sm">Important</Badge>;
      case "Promotion": return <Badge variant="secondary" className="bg-green-100/80 text-green-800 dark:bg-green-900/40 dark:text-green-400 backdrop-blur-sm shadow-sm border border-green-200 dark:border-green-800/50">Promotion</Badge>;
      case "Newsletter": return <Badge variant="outline" className="border-blue-200/50 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 backdrop-blur-sm shadow-sm">Newsletter</Badge>;
      case "Spam": return <Badge variant="destructive" className="bg-orange-500/90 backdrop-blur-sm shadow-sm">Spam</Badge>;
      case "Personal": return <Badge variant="default" className="bg-purple-500/90 hover:bg-purple-600/90 backdrop-blur-sm shadow-sm">Personal</Badge>;
      default: return <Badge variant="outline" className="bg-white/40 dark:bg-black/40 backdrop-blur-sm shadow-sm">Unclassified</Badge>;
    }
  };

  const getConfidenceBadge = (confidence: number | null) => {
    if (!confidence) return null;
    const val = Math.round(confidence * 100);
    if (val >= 90) return <Badge variant="outline" className="border-green-500/50 bg-green-50/30 dark:bg-green-900/20 text-green-600 ml-2 backdrop-blur-sm shadow-sm">{val}%</Badge>;
    if (val >= 75) return <Badge variant="outline" className="border-yellow-500/50 bg-yellow-50/30 dark:bg-yellow-900/20 text-yellow-600 ml-2 backdrop-blur-sm shadow-sm">{val}%</Badge>;
    return <Badge variant="outline" className="border-red-500/50 bg-red-50/30 dark:bg-red-900/20 text-red-600 ml-2 backdrop-blur-sm shadow-sm">{val}%</Badge>;
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredEmails.length && filteredEmails.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEmails.map(e => e.id));
    }
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters with Glassmorphism */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white/30 dark:bg-black/20 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)]"
      >
        <div className="flex flex-1 items-center space-x-3">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/70" />
            <Input 
              placeholder="Search sender, subject, category..." 
              className="pl-10 bg-white/40 dark:bg-black/40 border-white/30 dark:border-white/10 backdrop-blur-md rounded-xl shadow-sm focus-visible:ring-primary/50 transition-all duration-300 h-10" 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-10 w-10 items-center justify-center whitespace-nowrap rounded-xl border border-white/40 dark:border-white/10 bg-white/40 dark:bg-black/40 text-sm font-medium shadow-sm transition-all duration-300 hover:bg-white/60 dark:hover:bg-white/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 backdrop-blur-md">
              <Filter className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-xl border border-white/20 bg-white/80 dark:bg-black/80 backdrop-blur-xl">
              <DropdownMenuItem onClick={() => setCategoryFilter(null)} className="rounded-lg">All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCategoryFilter("Important")} className="rounded-lg">Important</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCategoryFilter("Promotion")} className="rounded-lg">Promotion</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCategoryFilter("Newsletter")} className="rounded-lg">Newsletter</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCategoryFilter("Spam")} className="rounded-lg">Spam</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCategoryFilter("Personal")} className="rounded-lg">Personal</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCategoryFilter("Unclassified")} className="rounded-lg">Unclassified</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {categoryFilter && (
            <Badge variant="secondary" className="cursor-pointer bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 shadow-sm backdrop-blur-md" onClick={() => setCategoryFilter(null)}>
              {categoryFilter} ✕
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleSelectAll}
            className="rounded-xl bg-white/40 dark:bg-black/40 border border-white/40 dark:border-white/10 backdrop-blur-md shadow-sm hover:bg-white/60 dark:hover:bg-white/10"
          >
            {selectedIds.length === filteredEmails.length && filteredEmails.length > 0 ? (
              <CheckSquare className="h-4 w-4 mr-2" />
            ) : (
              <Square className="h-4 w-4 mr-2" />
            )}
            Select All
          </Button>

          <AnimatePresence>
            {selectedIds.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, width: 0 }}
                animate={{ opacity: 1, scale: 1, width: "auto" }}
                exit={{ opacity: 0, scale: 0.9, width: 0 }}
                className="flex items-center space-x-2 bg-primary/5 dark:bg-primary/10 p-1.5 rounded-xl border border-primary/20 backdrop-blur-md overflow-hidden whitespace-nowrap shadow-sm"
              >
                <span className="text-sm font-semibold px-2 text-primary">{selectedIds.length} selected</span>
                <Button variant="ghost" size="sm" className="h-8 rounded-lg hover:bg-primary/10" onClick={() => requestAction("mark_important", selectedIds)}>
                  <Star className="mr-2 h-4 w-4 text-yellow-500" /> Important
                </Button>
                <Button variant="ghost" size="sm" className="h-8 rounded-lg hover:bg-primary/10" onClick={() => requestAction("archive", selectedIds)}>
                  <Archive className="mr-2 h-4 w-4 text-blue-500" /> Archive
                </Button>
                <Button variant="destructive" size="sm" className="h-8 rounded-lg" onClick={() => requestAction("trash", selectedIds)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Trash
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Glassmorphism Cards Grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        <AnimatePresence mode="popLayout">
          {filteredEmails.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full flex flex-col items-center justify-center h-64 rounded-3xl bg-white/20 dark:bg-black/10 backdrop-blur-xl border border-white/30 dark:border-white/5 shadow-inner"
            >
              <Search className="h-12 w-12 mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground font-medium text-lg">No emails found.</p>
              <p className="text-muted-foreground/60 text-sm mt-1">Try adjusting your filters or search.</p>
            </motion.div>
          ) : (
            filteredEmails.map((email, index) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                transition={{ 
                  duration: 0.4, 
                  delay: Math.min(index * 0.05, 0.5),
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }}
                whileHover={{ 
                  y: -5, 
                  scale: 1.02, 
                  boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)",
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
                key={email.id}
                onClick={() => setSelectedEmail(email)}
                className={`group relative flex flex-col p-5 cursor-pointer rounded-3xl backdrop-blur-xl border transition-all duration-300 ${
                  selectedIds.includes(email.id) 
                    ? "bg-primary/10 dark:bg-primary/20 border-primary/40 shadow-[0_8px_30px_rgb(0,0,0,0.12)] ring-1 ring-primary/50" 
                    : "bg-white/40 dark:bg-black/30 border-white/50 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:bg-white/60 dark:hover:bg-white/5 hover:border-white/80 dark:hover:border-white/20"
                }`}
              >
                {/* Decorative blob in background */}
                <div className="absolute -z-10 top-0 left-0 w-full h-full overflow-hidden rounded-3xl opacity-20 pointer-events-none">
                  <div className="absolute top-[-50%] left-[-50%] w-full h-full rounded-full bg-gradient-to-br from-primary/30 to-transparent blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                </div>

                <div className="flex justify-between items-start mb-4">
                  <div 
                    className={`h-6 w-6 rounded-md flex items-center justify-center transition-colors border ${
                      selectedIds.includes(email.id) 
                        ? "bg-primary border-primary text-primary-foreground" 
                        : "bg-white/50 dark:bg-black/50 border-muted-foreground/30 group-hover:border-primary/50"
                    }`}
                    onClick={(e) => toggleSelect(email.id, e)}
                  >
                    {selectedIds.includes(email.id) && <CheckSquare className="h-4 w-4" />}
                  </div>
                  <div className="flex gap-1.5 flex-wrap justify-end">
                    {getCategoryBadge(email.category)}
                    {getConfidenceBadge(email.confidence)}
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-foreground/90 line-clamp-2 leading-tight mb-2 group-hover:text-primary transition-colors">
                    {email.subject}
                  </h3>
                  <p className="text-sm font-medium text-muted-foreground/80 truncate mb-1">
                    {email.sender.replace(/<.*>/, "")}
                  </p>
                  <p className="text-xs text-muted-foreground/60 line-clamp-2 leading-relaxed">
                    {email.snippet}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs font-medium text-muted-foreground/60">
                  <span>{new Date(email.receivedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full bg-white/50 hover:bg-white dark:bg-black/50 dark:hover:bg-black" onClick={(e) => { e.stopPropagation(); requestAction("archive", [email.id]); }}>
                      <Archive className="h-3.5 w-3.5 text-blue-500" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full bg-white/50 hover:bg-red-50 dark:bg-black/50 dark:hover:bg-red-900/20 text-red-500" onClick={(e) => { e.stopPropagation(); requestAction("trash", [email.id]); }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>

      {/* Safety Layer Modal - styled with glassmorphism */}
      <Dialog open={showWarning} onOpenChange={setShowWarning}>
        <DialogContent className="bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-white/20 dark:border-white/10 rounded-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600 text-xl">
              <ShieldAlert className="mr-3 h-6 w-6" />
              Potential Important Email Detected
            </DialogTitle>
            <DialogDescription className="pt-3 text-base text-muted-foreground">
              Our AI Safety Layer detected that you are about to delete emails that may contain invoices, receipts, interview details, or are marked as Important.
              <br /><br />
              <strong className="text-foreground">Recommended Action:</strong> Review these emails before permanent deletion.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 gap-3">
            <Button variant="outline" className="rounded-xl border-white/30 backdrop-blur-md" onClick={() => setShowWarning(false)}>Cancel</Button>
            <Button variant="destructive" className="rounded-xl shadow-lg shadow-red-500/20" onClick={() => pendingAction && executeAction(pendingAction.action, pendingAction.ids)}>
              Delete Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Explainable AI Details Drawer */}
      <Drawer open={!!selectedEmail} onOpenChange={(o) => !o && setSelectedEmail(null)}>
        <DrawerContent className="max-w-4xl mx-auto h-[85vh] bg-white/90 dark:bg-black/90 backdrop-blur-2xl border-white/20 rounded-t-[2.5rem]">
          {selectedEmail && (
            <>
              <DrawerHeader className="border-b border-black/5 dark:border-white/5 pb-6 pt-8 px-8">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                  <div className="text-left flex-1">
                    <DrawerTitle className="text-2xl md:text-3xl font-bold break-words tracking-tight leading-tight">{selectedEmail.subject}</DrawerTitle>
                    <DrawerDescription className="text-base mt-4 flex flex-col space-y-1">
                      <span className="flex items-center gap-2">From: <span className="font-semibold text-foreground px-3 py-1 bg-black/5 dark:bg-white/10 rounded-full">{selectedEmail.sender}</span></span>
                      <span className="text-muted-foreground/80 mt-2 block">Date: {new Date(selectedEmail.receivedAt).toLocaleString()}</span>
                    </DrawerDescription>
                  </div>
                  <div className="flex flex-col items-end gap-3 flex-shrink-0 bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-black/5 dark:border-white/5">
                    {getCategoryBadge(selectedEmail.category)}
                    {getConfidenceBadge(selectedEmail.confidence)}
                  </div>
                </div>
              </DrawerHeader>
              
              <div className="flex-1 overflow-y-auto p-6 md:p-8">
                {/* AI Reasoning Section */}
                {selectedEmail.category && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8 p-6 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-3xl relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Sparkles className="w-32 h-32 text-primary" />
                    </div>
                    <h4 className="font-bold flex items-center text-primary mb-3 text-lg">
                      <Sparkles className="mr-2 h-5 w-5" />
                      AI Reasoning
                    </h4>
                    <p className="text-base text-foreground/90 leading-relaxed relative z-10">
                      {selectedEmail.aiReason || "No detailed reasoning was provided by the model for this classification."}
                    </p>
                  </motion.div>
                )}
                
                <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-4 px-2">Email Content Preview</h4>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="whitespace-pre-wrap text-base leading-relaxed border border-black/10 dark:border-white/10 rounded-3xl p-6 md:p-8 bg-white/50 dark:bg-black/50 shadow-inner"
                >
                  {selectedEmail.snippet}
                  <div className="mt-8 text-sm font-medium text-muted-foreground/70 border-t border-black/10 dark:border-white/10 pt-4 flex items-center justify-center">
                    Note: Showing preview snippet. Full body is not fetched to save bandwidth.
                  </div>
                </motion.div>
              </div>
              
              <DrawerFooter className="border-t border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/50 backdrop-blur-xl flex flex-row justify-end space-x-3 p-6 rounded-b-[2.5rem]">
                <Button variant="outline" className="rounded-xl border-white/20 bg-white/50 dark:bg-black/50 hover:bg-white dark:hover:bg-white/10" onClick={() => {
                  requestAction("archive", [selectedEmail.id]);
                  setSelectedEmail(null);
                }}>
                  <Archive className="mr-2 h-4 w-4" /> Archive
                </Button>
                <Button variant="destructive" className="rounded-xl shadow-lg shadow-red-500/20" onClick={() => {
                  requestAction("trash", [selectedEmail.id]);
                  setSelectedEmail(null);
                }}>
                  <Trash2 className="mr-2 h-4 w-4" /> Trash
                </Button>
                <DrawerClose>
                  <Button variant="ghost" className="rounded-xl">Close</Button>
                </DrawerClose>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
