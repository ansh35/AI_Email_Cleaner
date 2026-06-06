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

  const body = await req.json();
  const { action, emailIds } = body; // action: "archive" | "trash"

  if (!action || !emailIds || !Array.isArray(emailIds)) {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }

  try {
    for (const emailId of emailIds) {
      const email = await prisma.email.findUnique({ where: { id: emailId } });
      if (!email || email.userId !== user.id) continue;

      if (action === "archive") {
        await archiveEmail(user.id, email.gmailId);
        await logAction(user.id, "ARCHIVE", email.id);
        await prisma.email.update({
          where: { id: email.id },
          data: { isArchived: true }
        });
      } else if (action === "trash") {
        await trashEmail(user.id, email.gmailId);
        await logAction(user.id, "TRASH", email.id);
        await prisma.email.update({
          where: { id: email.id },
          data: { isTrashed: true }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Action failed:", error);
    return NextResponse.json({ error: "Failed to perform action" }, { status: 500 });
  }
}
