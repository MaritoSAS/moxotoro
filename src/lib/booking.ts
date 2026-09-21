import { MOXOTORO_CONFIG, type PricingOption } from "@/config/moxotoro.config";
import type { Booking } from "@/types/moxotoro";

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

export function formatArs(amount: number): string {
  return amount.toLocaleString("es-AR");
}

export function getMinBookingDate(now = new Date()): string {
  const cutoffHour = MOXOTORO_CONFIG.capacity.cutoffHourPreviousDay;
  const min = new Date(now);
  min.setHours(0, 0, 0, 0);
  const daysToAdd = now.getHours() >= cutoffHour ? 2 : 1;
  min.setDate(min.getDate() + daysToAdd);

  const year = min.getFullYear();
  const month = String(min.getMonth() + 1).padStart(2, "0");
  const day = String(min.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
    ].join("\n")
  );
  return `${MOXOTORO_CONFIG.contact.whatsAppDirectUrl}?text=${text}`;
}
