import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_SECRET || "promptscope_master_key_32bytes_v1!!";
const ALGORITHM = "aes-256-cbc";

export function encryptSecret(plainText: string): string {
  if (!plainText) return "";
  const iv = crypto.randomBytes(16);
  const key = crypto.createHash("sha256").update(ENCRYPTION_KEY).digest();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

export function decryptSecret(cipherText: string): string {
  if (!cipherText) return "";
  try {
    const parts = cipherText.split(":");
    if (parts.length !== 2) return "";
    const iv = Buffer.from(parts[0], "hex");
    const key = crypto.createHash("sha256").update(ENCRYPTION_KEY).digest();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(parts[1], "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    return "";
  }
}

export function maskSecretKey(key: string): string {
  const clean = (key || "").trim();
  if (clean.length <= 8) return "********";
  const prefix = clean.substring(0, 3);
  const suffix = clean.substring(clean.length - 4);
  return `${prefix}-*****************${suffix}`;
}
