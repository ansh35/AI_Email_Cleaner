import { google } from "googleapis";
import { decryptToken } from "../auth/encryption";
import prisma from "../prisma";

/**
 * Creates an authenticated Gmail API client for a specific user.
 */
async function getGmailClient(userId: string) {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" }
  });

  if (!account || !account.access_token) {
    throw new Error("No Google account linked or access token missing");
  }

  const accessToken = decryptToken(account.access_token);
  const refreshToken = account.refresh_token ? decryptToken(account.refresh_token) : null;

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  auth.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
    // We would ideally handle token refresh logic here and update the DB if refreshed
  });

  return google.gmail({ version: "v1", auth });
}

export async function syncRecentEmails(userId: string, limit = 50) {
  const gmail = await getGmailClient(userId);
  
  // Fetch message IDs
  const res = await gmail.users.messages.list({
    userId: "me",
    maxResults: limit,
    q: "in:inbox", // Only fetch inbox initially
  });

  const messages = res.data.messages || [];
  let syncedCount = 0;
  
  for (const msg of messages) {
    if (!msg.id) continue;
    
    // Check if email already exists in DB
    const existing = await prisma.email.findUnique({
      where: { gmailId: msg.id }
    });

    if (existing) continue; // Skip if already synced

    await syncSingleEmail(userId, msg.id, gmail);
    syncedCount++;
  }

  return syncedCount;
}

async function syncSingleEmail(userId: string, messageId: string, gmailClient?: any) {
  const gmail = gmailClient || await getGmailClient(userId);
  
  const msgData = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full"
  });

  const payload = msgData.data.payload;
  const headers = payload?.headers || [];
  
  const subjectHeader = headers.find((h: any) => h.name.toLowerCase() === "subject");
  const senderHeader = headers.find((h: any) => h.name.toLowerCase() === "from");
  const dateHeader = headers.find((h: any) => h.name.toLowerCase() === "date");

  const subject = subjectHeader ? subjectHeader.value || "(No Subject)" : "(No Subject)";
  const sender = senderHeader ? senderHeader.value || "Unknown" : "Unknown";
  const receivedAt = dateHeader ? new Date(dateHeader.value || Date.now()) : new Date();
  const snippet = msgData.data.snippet || "";
  const labelIds = msgData.data.labelIds || [];

  await prisma.email.create({
    data: {
      userId,
      gmailId: messageId,
      gmailThreadId: msgData.data.threadId,
      subject,
      sender,
      snippet,
      labels: JSON.stringify(labelIds),
      receivedAt,
      isArchived: !labelIds.includes('INBOX'),
      isTrashed: labelIds.includes('TRASH'),
      classificationStatus: "PENDING"
    }
  });
}

export async function archiveEmail(userId: string, messageId: string) {
  const gmail = await getGmailClient(userId);
  
  await gmail.users.messages.modify({
    userId: "me",
    id: messageId,
    requestBody: {
      removeLabelIds: ["INBOX"]
    }
  });

  await prisma.email.update({
    where: { gmailId: messageId },
    data: { isArchived: true }
  });
}

export async function trashEmail(userId: string, messageId: string) {
  const gmail = await getGmailClient(userId);
  
  await gmail.users.messages.modify({
    userId: "me",
    id: messageId,
    requestBody: {
      addLabelIds: ["TRASH"],
      removeLabelIds: ["INBOX"]
    }
  });

  await prisma.email.update({
    where: { gmailId: messageId },
    data: { isTrashed: true }
  });
}

// Bulk actions would just iterate over these with proper Promise.all settling and rate limit handling.
