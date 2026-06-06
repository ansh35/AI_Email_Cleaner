import prisma from "../prisma";

export async function logAction(userId: string, action: string, emailId?: string, metadata?: any) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        emailId,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
