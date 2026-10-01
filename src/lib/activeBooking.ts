/**
 * Reserva activa de la pestaña (demo). Solo sessionStorage: se pierde al cerrar la pestaña.
 * Clave: moxotoro.activeBooking
 */

import { MOXOTORO_CONFIG } from "@/config/moxotoro.config";
import type { Booking } from "@/types/moxotoro";

export const ACTIVE_BOOKING_STORAGE_KEY = "moxotoro.activeBooking";

export interface ActiveBookingSnapshot {
  booking: Booking;
  paidTxHash: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isBooking(value: unknown): value is Booking {
  if (!isRecord(value)) return false;

  const stringFields = [
    "id",
    "memoId",
    "customerName",
    "customerEmail",
    "customerPhone",
    "date",
    "timeSlotId",
    "timeSlotLabel",
    "pricingOptionId",
    "pricingOptionTitle",
    "status",
    "paymentMethod",
    "createdAt",
  ] as const;

  for (const key of stringFields) {
    if (typeof value[key] !== "string" || value[key] === "") return false;
  }

  const memoId = value.memoId;
  if (typeof memoId !== "string" || !memoId.startsWith(MOXOTORO_CONFIG.stellar.memoPrefix)) return false;

  const numberFields = [
    "participantsCount",
    "totalPriceUsdc",
    "totalPriceArs",
    "depositRequiredUsdc",
    "depositRequiredArs",
    "balanceDueUsdc",
    "balanceDueArs",
  ] as const;

  for (const key of numberFields) {
    if (typeof value[key] !== "number" || !Number.isFinite(value[key])) return false;
  }

  if (typeof value.includeWalpacAddon !== "boolean") return false;
  if (typeof value.isStellarPayment !== "boolean") return false;
  if (value.stellarTxHash !== undefined && typeof value.stellarTxHash !== "string") return false;
  if (value.depositPaidAt !== undefined && typeof value.depositPaidAt !== "string") return false;
  if (value.checkedInAt !== undefined && typeof value.checkedInAt !== "string") return false;
  if (value.balanceTxHash !== undefined && typeof value.balanceTxHash !== "string") return false;
  if (
    value.balancePaymentMethod !== undefined &&
    value.balancePaymentMethod !== "stellar" &&
    value.balancePaymentMethod !== "cash"
  ) {
    return false;
  }

  return true;
}

export function readActiveBooking(): ActiveBookingSnapshot | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(ACTIVE_BOOKING_STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || !isBooking(parsed.booking)) return null;

    const paidFromSnapshot = typeof parsed.paidTxHash === "string" ? parsed.paidTxHash : null;
    return {
      booking: parsed.booking,
      paidTxHash: paidFromSnapshot ?? parsed.booking.stellarTxHash ?? null,
    };
  } catch {
    return null;
  }
}

export function writeActiveBooking(snapshot: ActiveBookingSnapshot): void {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.setItem(ACTIVE_BOOKING_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // La pestaña puede rechazar storage; el checkout sigue en memoria.
  }
}

export function clearActiveBooking(): void {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.removeItem(ACTIVE_BOOKING_STORAGE_KEY);
  } catch {
    // Ignorar: el siguiente write reemplaza la reserva.
  }
}
