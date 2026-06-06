import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { EmailTable } from "@/components/emails/EmailTable";

export default async function EmailsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) redirect("/login");

  const emails = await prisma.email.findMany({
    where: { userId: user.id, isArchived: false, isTrashed: false },
    orderBy: { receivedAt: "desc" },
    take: 100
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Inbox</h2>
      </div>
      
      {/* We pass initial data to a client component for interactive filtering/bulk actions */}
      <EmailTable initialEmails={emails} />
    </div>
  );
}
