import bcrypt from "bcrypt";
import crypto from "crypto";

// Hacher un mot de passe
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Vérifier un mot de passe
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Générer un token de réinitialisation
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Générer un token pour magic link
export function generateMagicLinkToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
