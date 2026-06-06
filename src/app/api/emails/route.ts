
import { NextRequest as Req, NextResponse as Res } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { syncRecentEmails } from "@/lib/gmail";
import { triggerBackgroundClassification } from "@/lib/queue";

export async function GET(req: Req) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return Res.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return Res.json({ error: "User not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  let where: any = { userId: user.id, isArchived: false, isTrashed: false };
  if (category) where.category = category;
  if (search) {
    where.OR = [
      { subject: { contains: search } },
      { sender: { contains: search } },
      { snippet: { contains: search } }
    ];
  }

  const emails = await prisma.email.findMany({
    where,
    orderBy: { receivedAt: "desc" },
    take: 100
  });

  return Res.json({ emails });
}

export async function POST(req: Req) {
  // Sync request
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return Res.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return Res.json({ error: "User not found" }, { status: 404 });

  try {
    await syncRecentEmails(user.id, 100);
    // Trigger background queue
    triggerBackgroundClassification();
    return Res.json({ success: true });
  } catch (error: any) {
    return Res.json({ error: error.message }, { status: 500 });
  }
}
