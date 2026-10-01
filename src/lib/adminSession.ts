import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "moxo_admin";
export const ADMIN_SEEN_COOKIE = "moxo_admin_seen";

const SESSION_MESSAGE = "moxotoro-admin-session-v1";

export function adminPasswordConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
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
  const password = process.env.ADMIN_PASSWORD;
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
