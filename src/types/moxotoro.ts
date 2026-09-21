/**
 * MOXOTORO — Definiciones de Tipos y Máquina de Estados
 */

export type BookingStatus =
  | "pending_deposit"       // ⚪ Reserva registrada, esperando seña
  | "deposit_paid"          // 🟡 Seña acreditada (Cupo confirmado)
  | "confirmed_full"        // 🟢 Saldo completo cancelado
  | "weather_suspended"     // 🌧️ Suspendida por clima adverso
  | "reschedule_offered"    // 🔄 Reasignación de turno ofrecida al cliente
  | "alternative_offered"   // 🟣 Experiencia alternativa ofrecida
  | "rescheduled"           // 🟢 Reprogramada con éxito (seña reasignada)
  | "exceptional_refund"    // 🔴 Reembolso excepcional ejecutado
  | "cancelled_no_refund";  // ⚫ Cancelación voluntaria del cliente (seña retenida)

export type PaymentMethod = "stellar" | "whatsapp_manual";

export interface Booking {
  id: string;
  memoId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  timeSlotId: string;
  timeSlotLabel: string;
  pricingOptionId: string;
  pricingOptionTitle: string;
  participantsCount: number;
  includeWalpacAddon: boolean;
  totalPriceUsdc: number;
  totalPriceArs: number;
  depositRequiredUsdc: number;
  depositRequiredArs: number;
  balanceDueUsdc: number;
  balanceDueArs: number;
  paymentMethod: PaymentMethod;
  status: BookingStatus;
  isStellarPayment: boolean;
  stellarTxHash?: string;
  createdAt: string;
  weatherIncident?: WeatherIncident;
}

export interface WeatherIncident {
  id: string;
  bookingId: string;
  originalDate: string;
  originalTimeSlot: string;
  suspensionReason: string;
  offeredDate?: string;
  offeredTimeSlot?: string;
  offeredAlternative?: string;
  customerDecision: "pending" | "accepted_reschedule" | "accepted_alternative" | "requested_refund";
  refundAmountUsdc?: number;
  refundTxHash?: string;
  notes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface CircuitStop {
  id: string;
  order: number;
  name: string;
  subtitle: string;
  description: string;
  duration: string;
  elevation: string;
  image: string;
  isComplementary: boolean;
  coordinates: [number, number]; // [lng, lat]
}
