import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { archiveEmail, trashEmail } from "@/lib/gmail";
import { logAction } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  try {
    const body = await req.json().catch(() => ({}));
    const { target } = body; // "Spam", "Promotion", "Newsletter", or undefined for all

    let emailsToArchive: any[] = [];
    let emailsToTrash: any[] = [];

    if (!target || target === "Promotion" || target === "Newsletter") {
      emailsToArchive = await prisma.email.findMany({
        where: {
          userId: user.id,
          isArchived: false,
          isTrashed: false,
          category: target ? target : { in: ["Promotion", "Newsletter"] }
        }
      });
    }

    if (!target || target === "Spam") {
      emailsToTrash = await prisma.email.findMany({
        where: {
          userId: user.id,
          isArchived: false,
          isTrashed: false,
          category: "Spam"
        }
      });
    }

    // We process them sequentially (or we could use Promise.all)
    // Note: If there are many, we might hit Google API limits, but for demo we do sequentially
    let archivedCount = 0;
    for (const email of emailsToArchive) {
      try {
        await archiveEmail(user.id, email.gmailId);
        await logAction(user.id, "BULK_ARCHIVE", email.id);
        await prisma.email.update({
          where: { id: email.id },
          data: { isArchived: true }
        });
        archivedCount++;
      } catch (e) {
        console.error(`Failed to archive email ${email.id}:`, e);
      }
    }

    let trashedCount = 0;
    for (const email of emailsToTrash) {
      try {
        await trashEmail(user.id, email.gmailId);
        await logAction(user.id, "BULK_TRASH", email.id);
        await prisma.email.update({
          where: { id: email.id },
          data: { isTrashed: true }
        });
        trashedCount++;
      } catch (e) {
        console.error(`Failed to trash email ${email.id}:`, e);
      }
    }

    return NextResponse.json({ 
      success: true, 
      archived: archivedCount, 
      trashed: trashedCount 
    });
  } catch (error: any) {
    console.error("Bulk action failed:", error);
    return NextResponse.json({ error: "Failed to perform bulk action" }, { status: 500 });
  }
}
