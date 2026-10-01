"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  ADMIN_SEEN_COOKIE,
  adminCookieOptions,
  adminPasswordsMatch,
  adminPasswordConfigured,
  adminSessionToken,
  isAdminToken,
} from "@/lib/adminSession";
import {
  confirmCheckInFromHorizon,
  confirmDepositFromHorizon,
  loadAdminOverview,
  markBalancePaidInCash,
  savePendingBooking,
  type AdminOverview,
  type BookingWriteResult,
} from "@/lib/bookingRecords";

export async function saveBookingAction(booking: unknown): Promise<BookingWriteResult> {
  return savePendingBooking(booking);
}

export async function confirmDepositAction(booking: unknown): Promise<BookingWriteResult> {
  return confirmDepositFromHorizon(booking);
}

export async function confirmCheckInAction(booking: unknown): Promise<BookingWriteResult> {
  return confirmCheckInFromHorizon(booking);
}

export async function loginAdminAction(
  _previous: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  if (!adminPasswordConfigured()) {
    return { error: "Falta configurar ADMIN_PASSWORD en el servidor." };
  }
  const password = String(formData.get("password") ?? "");
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!adminPasswordsMatch(password, expected)) {
    return { error: "Contraseña incorrecta." };
  }
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, adminSessionToken(expected), adminCookieOptions());
  redirect("/admin");
}

export async function logoutAdminAction(): Promise<void> {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  redirect("/admin");
}

export async function markCashBalanceAction(bookingId: string): Promise<BookingWriteResult> {
  const jar = await cookies();
  if (!isAdminToken(jar.get(ADMIN_COOKIE)?.value)) {
    return { ok: false, persisted: false, error: "No autorizado." };
  }
  return markBalancePaidInCash(bookingId);
}

export async function acknowledgeAdminVisitAction(): Promise<void> {
  const jar = await cookies();
  if (!isAdminToken(jar.get(ADMIN_COOKIE)?.value)) return;
  jar.set(ADMIN_SEEN_COOKIE, new Date().toISOString(), adminCookieOptions());
}

export async function readAdminOverviewAction(): Promise<AdminOverview | null> {
  const jar = await cookies();
  if (!isAdminToken(jar.get(ADMIN_COOKIE)?.value)) return null;
  return loadAdminOverview(jar.get(ADMIN_SEEN_COOKIE)?.value ?? null);
}
