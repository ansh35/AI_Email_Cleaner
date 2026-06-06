import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "";
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
  // It expects a 32-byte hex string (64 characters)
  console.warn("WARNING: ENCRYPTION_KEY is not set properly. Token encryption will fail.");
}

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16; // For AES, this is always 16

export function encryptToken(text: string): string {
  if (!text) return text;
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv
  );
  
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export function decryptToken(text: string): string {
  if (!text) return text;
  
  const textParts = text.split(":");
  if (textParts.length !== 2) return text; // Not an encrypted token
  
  const iv = Buffer.from(textParts[0], "hex");
  const encryptedText = Buffer.from(textParts[1], "hex");
  
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv
  );
  
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  return decrypted.toString();
}
