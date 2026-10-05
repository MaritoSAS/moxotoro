import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "moxo_admin";
export const ADMIN_SEEN_COOKIE = "moxo_admin_seen";

const SESSION_MESSAGE = "moxotoro-admin-session-v1";

/** `ADMIN_PASSWORD` gana. La variante en español cubre la variable que el traductor del navegador creó en Vercel. */
export function readAdminPassword(): string | undefined {
  return process.env.ADMIN_PASSWORD ?? process.env["CONTRASEÑA_DE_ADMINISTRADOR"];
}

export function adminPasswordConfigured(): boolean {
  return Boolean(readAdminPassword());
}

export function adminPasswordsMatch(input: string, expected: string): boolean {
  const left = Buffer.from(input);
  const right = Buffer.from(expected);
  if (left.length === 0 || left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function adminSessionToken(password: string): string {
  return createHmac("sha256", password).update(SESSION_MESSAGE).digest("hex");
}

export function isAdminToken(token: string | undefined): boolean {
  const password = readAdminPassword();
  if (!password || !token) return false;
  const expected = adminSessionToken(password);
  const left = Buffer.from(token);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  };
}
