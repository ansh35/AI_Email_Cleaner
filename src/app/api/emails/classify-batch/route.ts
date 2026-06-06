import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { classifyEmail } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { ids } = body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "No email IDs provided" }, { status: 400 });
  }

  // Fetch the emails from DB
  const emails = await prisma.email.findMany({
    where: {
      id: { in: ids },
      userId: user.id
    }
  });

  // Filter out emails that are already successfully classified
  const emailsToProcess = emails.filter(
    (e) => e.classificationStatus !== "CLASSIFIED" || !e.category || e.category === "Unclassified"
  );

  if (emailsToProcess.length === 0) {
    return NextResponse.json({ success: true, processed: 0 });
  }

  // Process concurrently using Promise.all
  const classificationPromises = emailsToProcess.map(async (email) => {
    try {
      const result = await classifyEmail(email.subject, email.snippet, email.sender);
      
      if (result && result.category) {
        return prisma.email.update({
          where: { id: email.id },
          data: {
            category: result.category,
            confidence: result.confidence || 0,
            aiReason: result.reason || "Classified by AI",
            classificationStatus: "CLASSIFIED"
          }
        });
      } else {
        return prisma.email.update({
          where: { id: email.id },
          data: { classificationStatus: "FAILED" }
        });
      }
    } catch (err) {
      console.error(`Failed to classify email ${email.id}:`, err);
      return prisma.email.update({
        where: { id: email.id },
        data: { classificationStatus: "FAILED" }
      });
    }
  });

  await Promise.all(classificationPromises);

  return NextResponse.json({ success: true, processed: emailsToProcess.length });
}
