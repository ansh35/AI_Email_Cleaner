import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { accounts: true }
  });

  if (!user) redirect("/login");

  const account = user.accounts.find(a => a.provider === "google");
  
  const emailsProcessed = await prisma.email.count({ where: { userId: user.id, classificationStatus: "CLASSIFIED" } });
  const lastEmail = await prisma.email.findFirst({
    where: { userId: user.id },
    orderBy: { lastSyncedAt: 'desc' }
  });
  
  const lastSync = lastEmail ? new Date(lastEmail.lastSyncedAt).toLocaleString() : "Never";

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white/40 dark:bg-black/20 backdrop-blur-xl border-white/40 dark:border-white/10 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md">
          <div className="absolute -z-10 top-[-50%] left-[-50%] w-full h-full rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-3xl pointer-events-none"></div>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.image || ""} />
                <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/40 dark:bg-black/20 backdrop-blur-xl border-white/40 dark:border-white/10 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md">
          <div className="absolute -z-10 bottom-[-50%] right-[-50%] w-full h-full rounded-full bg-gradient-to-tl from-blue-500/10 to-transparent blur-3xl pointer-events-none"></div>
          <CardHeader>
            <CardTitle>System Details</CardTitle>
            <CardDescription>Metrics and current configuration.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">Last Sync</span>
                <span className="font-medium">{lastSync}</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">Emails Processed</span>
                <span className="font-medium">{emailsProcessed}</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">AI Model</span>
                <span className="font-medium">Llama-3.1-8b-instant</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">OAuth Status</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {account ? "Connected" : "Disconnected"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 bg-white/40 dark:bg-black/20 backdrop-blur-xl border-white/40 dark:border-white/10 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md">
          <div className="absolute -z-10 top-0 left-1/2 w-full h-full rounded-full bg-gradient-to-b from-green-500/5 to-transparent blur-3xl -translate-x-1/2 pointer-events-none"></div>
          <CardHeader>
            <CardTitle>Connected Accounts</CardTitle>
            <CardDescription>Manage your connected email accounts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {account ? (
              <div className="flex items-center justify-between border border-white/30 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md p-4 rounded-xl shadow-sm transition-transform hover:scale-[1.01]">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">Google Workspace</p>
                    <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
                  </div>
                </div>
                <Button variant="outline" disabled>Revoke</Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No accounts connected.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
