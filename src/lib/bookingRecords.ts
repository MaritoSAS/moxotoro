import { MOXOTORO_CONFIG } from "@/config/moxotoro.config";
import { argentinaTodayYmd, calculateQuote } from "@/lib/booking";
import { getBookingStore, persistenceMode, type PersistenceMode } from "@/lib/bookingStore";
import { balanceMemoId, verifyTransactionByMemo, type VerificationResult } from "@/lib/stellar";
import type { Booking } from "@/types/moxotoro";

const MEMO_PATTERN = /^MOXO-[A-HJ-NP-Z2-9]{6}$/;

export interface BookingWriteResult {
  ok: boolean;
  persisted: boolean;
  booking?: Booking;
  error?: string;
  verification?: VerificationResult;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function applyServerQuote(draft: Booking): Booking {
  const option =
    MOXOTORO_CONFIG.pricing.options.find((item) => item.id === draft.pricingOptionId) ?? null;
  if (!option) return draft;
  const quote = calculateQuote({
    option,
    includeWalpac: draft.includeWalpacAddon,
    participantsCount: draft.participantsCount,
  });
  return {
    ...draft,
    pricingOptionTitle: option.title,
    totalPriceUsdc: quote.totalPriceUsdc,
    totalPriceArs: quote.totalPriceArs,
    depositRequiredUsdc: quote.depositRequiredUsdc,
    depositRequiredArs: quote.depositRequiredArs,
    balanceDueUsdc: quote.balanceDueUsdc,
    balanceDueArs: quote.balanceDueArs,
  };
}

export function parseBookingDraft(value: unknown): Booking | null {
  if (!isRecord(value)) return null;
  const id = value.id;
  const memoId = value.memoId;
  if (typeof id !== "string" || !/^bkg-\d{10,16}$/.test(id)) return null;
  if (typeof memoId !== "string" || !MEMO_PATTERN.test(memoId)) return null;

  const option = MOXOTORO_CONFIG.pricing.options.find((item) => item.id === value.pricingOptionId);
  const slot = MOXOTORO_CONFIG.capacity.timeSlots.find((item) => item.id === value.timeSlotId);
  if (!option || !slot) return null;
  if (typeof value.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value.date)) return null;

  const participants = value.participantsCount;
  if (
    typeof participants !== "number" ||
    !Number.isInteger(participants) ||
    participants < 1 ||
    participants > MOXOTORO_CONFIG.capacity.contingentMaxParticipants
  ) {
    return null;
  }

  const name = typeof value.customerName === "string" ? value.customerName.trim() : "";
  const email = typeof value.customerEmail === "string" ? value.customerEmail.trim() : "";
  const phone = typeof value.customerPhone === "string" ? value.customerPhone.trim() : "";
  if (!name || name.length > 120 || !email.includes("@") || email.length > 160 || !phone || phone.length > 40) {
    return null;
  }
  if (typeof value.includeWalpacAddon !== "boolean") return null;
  if (typeof value.createdAt !== "string") return null;

  const draft: Booking = {
    id,
    memoId,
    customerName: name,
    customerEmail: email,
    customerPhone: phone,
    date: value.date,
    timeSlotId: slot.id,
    timeSlotLabel: slot.label,
    pricingOptionId: option.id,
    pricingOptionTitle: option.title,
    participantsCount: participants,
    includeWalpacAddon: value.includeWalpacAddon,
    totalPriceUsdc: 0,
    totalPriceArs: 0,
    depositRequiredUsdc: 0,
    depositRequiredArs: 0,
    balanceDueUsdc: 0,
    balanceDueArs: 0,
    paymentMethod: "stellar",
    status: "pending_deposit",
    isStellarPayment: true,
    createdAt: value.createdAt,
  };
  return applyServerQuote(draft);
}

function paidFields(existing: Booking | null): Pick<
  Booking,
  "status" | "stellarTxHash" | "depositPaidAt" | "checkedInAt" | "balanceTxHash" | "balancePaymentMethod"
> {
  if (!existing) {
    return { status: "pending_deposit" };
  }
  return {
    status: existing.status,
    stellarTxHash: existing.stellarTxHash,
    depositPaidAt: existing.depositPaidAt,
    checkedInAt: existing.checkedInAt,
    balanceTxHash: existing.balanceTxHash,
    balancePaymentMethod: existing.balancePaymentMethod,
  };
}

export async function savePendingBooking(value: unknown): Promise<BookingWriteResult> {
  const draft = parseBookingDraft(value);
  if (!draft) return { ok: false, persisted: false, error: "Reserva inválida." };

  const store = getBookingStore();
  if (!store) return { ok: true, persisted: false, booking: draft };

  try {
    const existing = await store.get(draft.id);
    if (existing && existing.status !== "pending_deposit") {
      return { ok: true, persisted: true, booking: existing };
    }
    const next: Booking = { ...draft, ...paidFields(null), status: "pending_deposit" };
    await store.upsert(next);
    return { ok: true, persisted: true, booking: next };
  } catch {
    return { ok: true, persisted: false, booking: draft, error: "No se pudo guardar la reserva." };
  }
}

export async function confirmDepositFromHorizon(value: unknown): Promise<BookingWriteResult> {
  const draft = parseBookingDraft(value);
  if (!draft) return { ok: false, persisted: false, error: "Reserva inválida." };

  const verification = await verifyTransactionByMemo(draft.memoId, draft.depositRequiredUsdc);
  if (!verification.verified || !verification.txHash) {
    return { ok: false, persisted: false, booking: draft, verification };
  }

  const paid: Booking = {
    ...draft,
    status: "deposit_paid",
    stellarTxHash: verification.txHash,
    isStellarPayment: true,
    depositPaidAt: verification.timestamp ?? new Date().toISOString(),
  };

  const store = getBookingStore();
  if (!store) return { ok: true, persisted: false, booking: paid, verification };

  try {
    const existing = await store.get(draft.id);
    if (existing?.status === "confirmed_full") {
      return { ok: true, persisted: true, booking: existing, verification };
    }
    await store.upsert({ ...paid, checkedInAt: existing?.checkedInAt, balanceTxHash: existing?.balanceTxHash, balancePaymentMethod: existing?.balancePaymentMethod });
    return { ok: true, persisted: true, booking: paid, verification };
  } catch {
    return { ok: true, persisted: false, booking: paid, verification };
  }
}

export async function confirmCheckInFromHorizon(value: unknown): Promise<BookingWriteResult> {
  const draft = parseBookingDraft(value);
  if (!draft) return { ok: false, persisted: false, error: "Reserva inválida." };

  const deposit = await verifyTransactionByMemo(draft.memoId, draft.depositRequiredUsdc);
  if (!deposit.verified) {
    return {
      ok: false,
      persisted: false,
      booking: draft,
      error: "La seña todavía no está verificada en Horizon.",
      verification: deposit,
    };
  }

  let balanceMemo = "";
  try {
    balanceMemo = balanceMemoId(draft.memoId);
  } catch {
    return { ok: false, persisted: false, error: "El memo del saldo no entra en 28 bytes." };
  }

  const verification = await verifyTransactionByMemo(balanceMemo, draft.balanceDueUsdc, "balance");
  if (!verification.verified || !verification.txHash) {
    return { ok: false, persisted: false, booking: draft, verification, error: verification.message };
  }

  const checkedIn: Booking = {
    ...draft,
    status: "confirmed_full",
    stellarTxHash: deposit.txHash,
    isStellarPayment: true,
    depositPaidAt: deposit.timestamp ?? new Date().toISOString(),
    checkedInAt: new Date().toISOString(),
    balanceTxHash: verification.txHash,
    balancePaymentMethod: "stellar",
  };

  const store = getBookingStore();
  if (!store) return { ok: true, persisted: false, booking: checkedIn, verification };

  try {
    await store.upsert(checkedIn);
    return { ok: true, persisted: true, booking: checkedIn, verification };
  } catch {
    return { ok: true, persisted: false, booking: checkedIn, verification };
  }
}

export async function markBalancePaidInCash(bookingId: string): Promise<BookingWriteResult> {
  const store = getBookingStore();
  if (!store) {
    return { ok: false, persisted: false, error: "No hay base configurada para registrar el efectivo." };
  }
  const existing = await store.get(bookingId);
  if (!existing) return { ok: false, persisted: false, error: "No se encontró la reserva." };
  if (existing.status === "pending_deposit") {
    return { ok: false, persisted: true, error: "La seña todavía no está pagada." };
  }
  if (existing.status === "confirmed_full") {
    return { ok: true, persisted: true, booking: existing };
  }

  const checkedIn: Booking = {
    ...existing,
    status: "confirmed_full",
    checkedInAt: new Date().toISOString(),
    balancePaymentMethod: "cash",
  };
  await store.upsert(checkedIn);
  return { ok: true, persisted: true, booking: checkedIn };
}

export interface AdminOverview {
  mode: PersistenceMode;
  bookings: Booking[];
  newlyConfirmed: Booking[];
  income: { depositUsd: number; balanceUsd: number; totalUsd: number };
}

export async function loadAdminOverview(lastSeenIso: string | null): Promise<AdminOverview> {
  const store = getBookingStore();
  if (!store) {
    return {
      mode: persistenceMode(),
      bookings: [],
      newlyConfirmed: [],
      income: { depositUsd: 0, balanceUsd: 0, totalUsd: 0 },
    };
  }

  const today = argentinaTodayYmd();
  const all = await store.list();
  const bookings = all
    .filter((booking) => booking.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.timeSlotId.localeCompare(b.timeSlotId));

  const newlyConfirmed = bookings.filter((booking) => {
    if (booking.status !== "deposit_paid" && booking.status !== "confirmed_full") return false;
    const stamp = booking.checkedInAt ?? booking.depositPaidAt;
    if (!stamp) return false;
    if (!lastSeenIso) return true;
    return Date.parse(stamp) > Date.parse(lastSeenIso);
  });

  let depositUsd = 0;
  let balanceUsd = 0;
  for (const booking of bookings) {
    if (booking.status === "deposit_paid" || booking.status === "confirmed_full") {
      depositUsd += booking.depositRequiredUsdc;
    }
    if (booking.status === "confirmed_full") {
      balanceUsd += booking.balanceDueUsdc;
    }
  }

  return {
    mode: store.mode,
    bookings,
    newlyConfirmed,
    income: {
      depositUsd,
      balanceUsd,
      totalUsd: depositUsd + balanceUsd,
    },
  };
}
