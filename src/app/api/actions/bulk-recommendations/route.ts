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
    const { actions, rememberPreference } = body;

    if (!actions) {
      return NextResponse.json({ error: "No actions provided" }, { status: 400 });
    }

    // Save preferences if requested
    if (rememberPreference) {
      for (const [category, action] of Object.entries(actions)) {
        await prisma.categoryPreference.upsert({
          where: {
            userId_category: {
              userId: user.id,
              category: category,
            }
          },
          update: { action: action as string },
          create: {
            userId: user.id,
            category: category,
            action: action as string
          }
        });
      }
    }

    let archivedCount = 0;
    let trashedCount = 0;

    // Process each category
    for (const [category, action] of Object.entries(actions)) {
      if (action === "KEEP") continue;

      const emailsToProcess = await prisma.email.findMany({
        where: {
          userId: user.id,
          isArchived: false,
          isTrashed: false,
          category: category
        }
      });

      for (const email of emailsToProcess) {
        try {
          if (action === "ARCHIVE") {
            await archiveEmail(user.id, email.gmailId);
            await logAction(user.id, "BULK_ARCHIVE", email.id);
            await prisma.email.update({
              where: { id: email.id },
              data: { isArchived: true }
            });
            archivedCount++;
          } else if (action === "DELETE") {
            await trashEmail(user.id, email.gmailId);
            await logAction(user.id, "BULK_TRASH", email.id);
            await prisma.email.update({
              where: { id: email.id },
              data: { isTrashed: true }
            });
            trashedCount++;
          }
        } catch (e) {
          console.error(`Failed to ${action} email ${email.id}:`, e);
        }
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
