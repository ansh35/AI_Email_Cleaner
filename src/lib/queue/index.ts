import { classifyEmail } from "../ai";
import prisma from "../prisma";

// A very simple lightweight in-memory processor.
// In a true enterprise production environment, use a robust queue like BullMQ + Redis.
let isProcessing = false;

export async function processPendingEmails() {
  if (isProcessing) return; // Prevent concurrent processing loops
  isProcessing = true;

  try {
    // Process in batches of 10
    const batchSize = 10;
    while (true) {
      const pendingEmails = await prisma.email.findMany({
        where: { classificationStatus: "PENDING" },
        take: batchSize,
        orderBy: { receivedAt: "desc" }
      });

      if (pendingEmails.length === 0) break; // Queue empty

      for (const email of pendingEmails) {
        const result = await classifyEmail(email.subject, email.snippet, email.sender);
        
        if (result) {
          await prisma.email.update({
            where: { id: email.id },
            data: {
              category: result.category,
              confidence: result.confidence,
              aiReason: result.reason,
              classificationStatus: "CLASSIFIED"
            }
          });
        } else {
          await prisma.email.update({
            where: { id: email.id },
            data: { classificationStatus: "FAILED" }
          });
        }
      }
    }
  } catch (error) {
    console.error("Queue processing error:", error);
  } finally {
    isProcessing = false;
  }
}

// Kickoff function that doesn't await the result
export function triggerBackgroundClassification() {
  processPendingEmails().catch(console.error);
}
