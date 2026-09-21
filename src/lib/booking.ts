/**
 * MOXOTORO — Fechas de reserva (zona horaria Argentina) y cotización de seña.
 * El cierre de cupo se evalúa a las `cutoffHourPreviousDay` del día anterior.
 */

import { MOXOTORO_CONFIG, type PricingOption } from "@/config/moxotoro.config";
import type { Booking } from "@/types/moxotoro";

export const ARGENTINA_TIME_ZONE = "America/Argentina/Buenos_Aires";

export const WEEKDAYS_ES = [
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
  "domingo",
] as const;

export const WEEKDAYS_ES_SHORT = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"] as const;

export const MONTHS_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const;

export interface YearMonth {
  year: number;
  month: number;
}

export interface CalendarDay extends YearMonth {
  day: number;
}

export interface QuoteBreakdown {
  unitPriceUsdc: number;
  unitPriceArs: number;
  totalPriceUsdc: number;
  totalPriceArs: number;
  depositRequiredUsdc: number;
  depositRequiredArs: number;
  balanceDueUsdc: number;
  balanceDueArs: number;
}

export function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function toYmd(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

export function parseYmd(ymd: string): CalendarDay {
  const [year, month, day] = ymd.split("-").map(Number);
  return { year, month, day };
}

export function getArgentinaDateTime(now = new Date()): CalendarDay & { hour: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ARGENTINA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");

  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour: read("hour"),
  };
}

export function addCalendarDays(ymd: string, days: number): string {
  const { year, month, day } = parseYmd(ymd);
  const utc = new Date(Date.UTC(year, month - 1, day + days));
  return toYmd(utc.getUTCFullYear(), utc.getUTCMonth() + 1, utc.getUTCDate());
}

export function startOfWeekMonday(ymd: string): string {
  const { year, month, day } = parseYmd(ymd);
  return addCalendarDays(ymd, -mondayFirstWeekday(year, month, day));
}

export function endOfWeekSunday(ymd: string): string {
  const { year, month, day } = parseYmd(ymd);
  return addCalendarDays(ymd, 6 - mondayFirstWeekday(year, month, day));
}

/**
 * Primera fecha reservable (YYYY-MM-DD, calendario Argentina).
 * Antes de las 20:00: a partir de mañana. Desde las 20:00: a partir de pasado mañana.
 */
export function getMinBookingDate(now = new Date()): string {
  const { year, month, day, hour } = getArgentinaDateTime(now);
  const today = toYmd(year, month, day);
  const cutoff = MOXOTORO_CONFIG.capacity.cutoffHourPreviousDay;
  const offset = hour >= cutoff ? 2 : 1;
  return addCalendarDays(today, offset);
}

export function getMaxBookingDate(minDate = getMinBookingDate()): string {
  const { year, month, day } = parseYmd(minDate);
  const utc = new Date(Date.UTC(year, month - 1 + 6, day));
  return toYmd(utc.getUTCFullYear(), utc.getUTCMonth() + 1, utc.getUTCDate());
}

export function isDateBookable(ymd: string, now = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return false;
  return ymd >= getMinBookingDate(now) && ymd <= getMaxBookingDate(getMinBookingDate(now));
}

export function compareYearMonth(a: YearMonth, b: YearMonth): number {
  return a.year - b.year || a.month - b.month;
}

export function shiftYearMonth(view: YearMonth, delta: number): YearMonth {
  const utc = new Date(Date.UTC(view.year, view.month - 1 + delta, 1));
  return { year: utc.getUTCFullYear(), month: utc.getUTCMonth() + 1 };
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** 0 = lunes … 6 = domingo */
export function mondayFirstWeekday(year: number, month: number, day: number): number {
  const utcDay = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return (utcDay + 6) % 7;
}

export function formatMonthYearEs(year: number, month: number): string {
  const name = MONTHS_ES[month - 1];
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${year}`;
}

export function formatDateLongEs(ymd: string): string {
  const { year, month, day } = parseYmd(ymd);
  const weekday = WEEKDAYS_ES[mondayFirstWeekday(year, month, day)];
  return `${weekday} ${day} de ${MONTHS_ES[month - 1]} de ${year}`;
}

export function argentinaTodayYmd(now = new Date()): string {
  const { year, month, day } = getArgentinaDateTime(now);
  return toYmd(year, month, day);
}

export function formatArs(amount: number): string {
  return amount.toLocaleString("es-AR");
}

export function calculateQuote(params: {
  option: PricingOption;
  includeWalpac: boolean;
  participantsCount: number;
}): QuoteBreakdown {
  const walpac = MOXOTORO_CONFIG.pricing.walpacAddon;
  const unitPriceUsdc =
    params.option.priceUsdc + (params.includeWalpac ? walpac.priceUsdc : 0);
  const unitPriceArs =
    params.option.priceArs + (params.includeWalpac ? walpac.priceArs : 0);
  const participants = Math.max(1, params.participantsCount);
  const totalPriceUsdc = unitPriceUsdc * participants;
  const totalPriceArs = unitPriceArs * participants;
  const depositRatio = MOXOTORO_CONFIG.pricing.depositPercentage / 100;

  return {
    unitPriceUsdc,
    unitPriceArs,
    totalPriceUsdc,
    totalPriceArs,
    depositRequiredUsdc: totalPriceUsdc * depositRatio,
    depositRequiredArs: totalPriceArs * depositRatio,
    balanceDueUsdc: totalPriceUsdc * (1 - depositRatio),
    balanceDueArs: totalPriceArs * (1 - depositRatio),
  };
}

export function generateMemoId(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let suffix = "";
  for (const byte of bytes) {
    suffix += alphabet[byte % alphabet.length];
  }
  return `${MOXOTORO_CONFIG.stellar.memoPrefix}${suffix}`;
}

export function createPendingBooking(input: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  timeSlotId: string;
  timeSlotLabel: string;
  pricingOption: PricingOption;
  participantsCount: number;
  includeWalpac: boolean;
}): Booking {
  const quote = calculateQuote({
    option: input.pricingOption,
    includeWalpac: input.includeWalpac,
    participantsCount: input.participantsCount,
  });

  return {
    id: `bkg-${Date.now()}`,
    memoId: generateMemoId(),
    customerName: input.customerName.trim(),
    customerEmail: input.customerEmail.trim(),
    customerPhone: input.customerPhone.trim(),
    date: input.date,
    timeSlotId: input.timeSlotId,
    timeSlotLabel: input.timeSlotLabel,
    pricingOptionId: input.pricingOption.id,
    pricingOptionTitle: input.pricingOption.title,
    participantsCount: input.participantsCount,
    includeWalpacAddon: input.includeWalpac,
    totalPriceUsdc: quote.totalPriceUsdc,
    totalPriceArs: quote.totalPriceArs,
    depositRequiredUsdc: quote.depositRequiredUsdc,
    depositRequiredArs: quote.depositRequiredArs,
    balanceDueUsdc: quote.balanceDueUsdc,
    balanceDueArs: quote.balanceDueArs,
    paymentMethod: "stellar",
    status: "pending_deposit",
    isStellarPayment: true,
    createdAt: new Date().toISOString(),
  };
}

export function buildWhatsAppReservationUrl(params: {
  date: string;
  timeSlotLabel: string;
  optionTitle: string;
  participantsCount: number;
  includeWalpac: boolean;
  depositUsdc: number;
}): string {
  const walpacLine = params.includeWalpac ? "Sí (Casa de los Pájaros)" : "No";
  const text = encodeURIComponent(
    [
      "Hola MOXOTORO, quiero reservar el circuito Camino Real.",
      `Fecha: ${params.date}`,
      `Turno: ${params.timeSlotLabel}`,
      `Opción: ${params.optionTitle}`,
      `Participantes: ${params.participantsCount}`,
      `Extensión Walpac: ${walpacLine}`,
      `Seña estimada: ${params.depositUsdc.toFixed(2)} USDC (testnet)`,
    ].join("\n"),
  );
  return `${MOXOTORO_CONFIG.contact.whatsAppDirectUrl}?text=${text}`;
}
