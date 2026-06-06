import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Identify all emails where category === "Unclassified" OR category is null OR classificationStatus is PENDING/FAILED
  const unclassifiedEmails = await prisma.email.findMany({
    where: {
      userId: user.id,
      isArchived: false,
      isTrashed: false,
      OR: [
        { category: null },
        { category: "Unclassified" },
        { classificationStatus: "PENDING" },
        { classificationStatus: "FAILED" }
      ]
    },
    select: { id: true },
    orderBy: { receivedAt: "desc" }
  });

  const ids = unclassifiedEmails.map(email => email.id);

  return NextResponse.json({ ids });
}
