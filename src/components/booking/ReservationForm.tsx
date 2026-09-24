"use client";

import React, { useMemo, useState } from "react";
import { CalendarDays, Clock, Sun, Sunset, Users, Wallet } from "lucide-react";
import { Booking } from "@/types/moxotoro";
import { MOXOTORO_CONFIG } from "@/config/moxotoro.config";
import { formatDateLongEs, getMinBookingDate, isDateBookable } from "@/lib/booking";
import { StellarCheckoutModal } from "@/components/payment/StellarCheckoutModal";
import { stellarExpertTxUrl } from "@/lib/stellar";
import { BookingCalendar } from "@/components/booking/BookingCalendar";

interface ReservationFormProps {
  includeWalpac: boolean;
  onIncludeWalpacChange: (value: boolean) => void;
}

function createMemoId(): string {
  const rand = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  return `${MOXOTORO_CONFIG.stellar.memoPrefix}${rand}`;
}

export const ReservationForm: React.FC<ReservationFormProps> = ({
  includeWalpac,
  onIncludeWalpacChange,
}) => {
  const minDate = getMinBookingDate();
  const defaultSlot = MOXOTORO_CONFIG.capacity.timeSlots[0];
  const defaultPricing = MOXOTORO_CONFIG.pricing.options[0];

  const [date, setDate] = useState(minDate);
  const [timeSlotId, setTimeSlotId] = useState(defaultSlot.id);
  const [pricingOptionId, setPricingOptionId] = useState(defaultPricing.id);
  const [participantsCount, setParticipantsCount] = useState(4);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [checkoutBooking, setCheckoutBooking] = useState<Booking | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paidTxHash, setPaidTxHash] = useState<string | null>(null);

  const selectedSlot =
    MOXOTORO_CONFIG.capacity.timeSlots.find((slot) => slot.id === timeSlotId) ?? defaultSlot;
  const selectedPricing =
    MOXOTORO_CONFIG.pricing.options.find((option) => option.id === pricingOptionId) ?? defaultPricing;

  const totals = useMemo(() => {
    const walpac = includeWalpac ? MOXOTORO_CONFIG.pricing.walpacAddon : null;
    const totalPriceUsdc =
      selectedPricing.priceUsdc * participantsCount + (walpac ? walpac.priceUsdc * participantsCount : 0);
    const totalPriceArs =
      selectedPricing.priceArs * participantsCount + (walpac ? walpac.priceArs * participantsCount : 0);
    const depositRequiredUsdc = Number(
      ((totalPriceUsdc * MOXOTORO_CONFIG.pricing.depositPercentage) / 100).toFixed(2),
    );
    const depositRequiredArs = Math.round(
      (totalPriceArs * MOXOTORO_CONFIG.pricing.depositPercentage) / 100,
    );
    return {
      totalPriceUsdc,
      totalPriceArs,
      depositRequiredUsdc,
      depositRequiredArs,
      balanceDueUsdc: Number((totalPriceUsdc - depositRequiredUsdc).toFixed(2)),
      balanceDueArs: totalPriceArs - depositRequiredArs,
    };
  }, [includeWalpac, participantsCount, selectedPricing]);

  const handleSelectDate = (ymd: string) => {
    if (!isDateBookable(ymd)) return;
    setDate(ymd);
    setFormError(null);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!isDateBookable(date)) {
      setFormError("Elegí una fecha disponible en el calendario.");
      return;
    }
    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      setFormError("Completá nombre, correo y teléfono para generar la seña.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      setFormError("Ingresá un correo electrónico válido.");
      return;
    }

    const nowIso = new Date().toISOString();
    const booking: Booking = {
      id: crypto.randomUUID(),
      memoId: createMemoId(),
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      date,
      timeSlotId: selectedSlot.id,
      timeSlotLabel: selectedSlot.label,
      pricingOptionId: selectedPricing.id,
      pricingOptionTitle: selectedPricing.title,
      participantsCount,
      includeWalpacAddon: includeWalpac,
      totalPriceUsdc: totals.totalPriceUsdc,
      totalPriceArs: totals.totalPriceArs,
      depositRequiredUsdc: totals.depositRequiredUsdc,
      depositRequiredArs: totals.depositRequiredArs,
      balanceDueUsdc: totals.balanceDueUsdc,
      balanceDueArs: totals.balanceDueArs,
      paymentMethod: "stellar",
      status: "pending_deposit",
      isStellarPayment: true,
      createdAt: nowIso,
    };

    setPaidTxHash(null);
    setCheckoutBooking(booking);
    setIsCheckoutOpen(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-2xl border border-[#c4a962]/40 bg-[#0a0a0a]/70 p-4 sm:p-5 space-y-5">
          <div className="flex items-start gap-2">
            <CalendarDays className="h-5 w-5 text-[#c4a962] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[#f5f0e8]">Calendario de salidas</p>
              <p className="text-xs text-[#9ca3af]">
                Elegí el día en el mes. El turno (mañana o tarde) va justo debajo.
              </p>
            </div>
          </div>

          <BookingCalendar selectedDate={date} minDate={minDate} onSelectDate={handleSelectDate} />

          <fieldset className="space-y-2">
            <legend className="flex items-center gap-2 text-sm font-semibold text-[#f5f0e8]">
              <Clock className="h-4 w-4 text-[#c4a962]" />
              Turno
            </legend>
            <div role="radiogroup" aria-label="Turno de salida" className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MOXOTORO_CONFIG.capacity.timeSlots.map((slot) => {
                const isMorning = slot.id.includes("morning");
                const selected = timeSlotId === slot.id;
                return (
                  <label
                    key={slot.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#c4a962] ${
                      selected
                        ? "border-[#c4a962] bg-[#0d3d47]/80"
                        : "border-white/10 bg-[#0d1b2a]/60 hover:border-[#c4a962]/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="timeSlot"
                      value={slot.id}
                      checked={selected}
                      onChange={() => setTimeSlotId(slot.id)}
                      className="mt-1 accent-[#c4a962]"
                    />
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-[#f5f0e8]">
                        {isMorning ? (
                          <Sun className="h-4 w-4 text-[#c4a962]" />
                        ) : (
                          <Sunset className="h-4 w-4 text-[#c4a962]" />
                        )}
                        {isMorning ? "Mañana" : "Tarde"}
                      </span>
                      <span className="block text-[11px] text-[#9ca3af] mt-0.5">{slot.label}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <p className="rounded-lg border border-[#c4a962]/20 bg-[#0d3d47]/40 px-3 py-2 text-xs text-[#e8e2d6]" aria-live="polite">
            Salida: <strong className="text-[#c4a962]">{formatDateLongEs(date)}</strong> · {selectedSlot.label}
          </p>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-[#9ca3af]">Nombre y apellido</span>
            <input
              type="text"
              autoComplete="name"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-2.5 text-sm text-[#f5f0e8] outline-none focus:border-[#c4a962]"
              required
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-[#9ca3af]">Correo electrónico</span>
            <input
              type="email"
              autoComplete="email"
              value={customerEmail}
              onChange={(event) => setCustomerEmail(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-2.5 text-sm text-[#f5f0e8] outline-none focus:border-[#c4a962]"
              required
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-[#9ca3af]">Teléfono / WhatsApp</span>
            <input
              type="tel"
              autoComplete="tel"
              value={customerPhone}
              onChange={(event) => setCustomerPhone(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-2.5 text-sm text-[#f5f0e8] outline-none focus:border-[#c4a962]"
              required
            />
          </label>

          <fieldset className="space-y-2">
            <legend className="text-xs font-medium text-[#9ca3af]">Tarifa</legend>
            <div className="space-y-2">
              {MOXOTORO_CONFIG.pricing.options.map((option) => {
                const selected = pricingOptionId === option.id;
                return (
                  <label
                    key={option.id}
                    className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition-colors ${
                      selected ? "border-[#c4a962] bg-[#0d3d47]/60" : "border-white/10 bg-[#0a0a0a]/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="pricing"
                      value={option.id}
                      checked={selected}
                      onChange={() => setPricingOptionId(option.id)}
                      className="mt-1 accent-[#c4a962]"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-[#f5f0e8]">{option.title}</span>
                      <span className="block text-[11px] text-[#9ca3af] mt-0.5">{option.description}</span>
                      <span className="block text-xs text-[#c4a962] mt-1">
                        {option.priceUsdc} USDC · ${option.priceArs.toLocaleString("es-AR")} ARS
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <label className="block space-y-1.5">
            <span className="flex items-center gap-1.5 text-xs font-medium text-[#9ca3af]">
              <Users className="h-3.5 w-3.5 text-[#c4a962]" />
              Participantes
            </span>
            <input
              type="number"
              min={1}
              max={MOXOTORO_CONFIG.capacity.contingentMaxParticipants}
              value={participantsCount}
              onChange={(event) => setParticipantsCount(Number(event.target.value) || 1)}
              className="w-full rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-2.5 text-sm text-[#f5f0e8] outline-none focus:border-[#c4a962]"
            />
            <span className="text-[11px] text-[#9ca3af]">
              Mínimo {MOXOTORO_CONFIG.capacity.minParticipantsToConfirm} para confirmar la salida · cupo
              estándar {MOXOTORO_CONFIG.capacity.standardMaxParticipants}.
            </span>
          </label>

          <label className="flex items-start gap-3 rounded-xl border border-[#c4a962]/30 bg-[#0d3d47]/30 p-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeWalpac}
              onChange={(event) => onIncludeWalpacChange(event.target.checked)}
              className="mt-1 accent-[#c4a962]"
            />
            <span className="text-xs text-[#e8e2d6]">
              Sumar extensión Casa de los Pájaros (Walpac) — +{MOXOTORO_CONFIG.pricing.walpacAddon.priceUsdc}{" "}
              USDC por persona
            </span>
          </label>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#c4a962]/40 bg-[#0d1b2a] p-4">
        <div>
          <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#9ca3af]">
            <Wallet className="h-3.5 w-3.5 text-[#c4a962]" />
            Seña a abonar hoy ({MOXOTORO_CONFIG.pricing.depositPercentage}%)
          </p>
          <p className="text-2xl font-bold text-[#c4a962]">{totals.depositRequiredUsdc.toFixed(2)} USDC</p>
          <p className="text-xs text-[#9ca3af]">
            Total {totals.totalPriceUsdc.toFixed(2)} USDC · saldo al iniciar {totals.balanceDueUsdc.toFixed(2)} USDC
          </p>
        </div>
        <button
          type="submit"
          className="rounded-xl bg-[#c4a962] px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#0a0a0a] hover:bg-[#dfc888] transition-colors shadow-lg"
        >
          Pagar seña con Stellar
        </button>
      </div>

      {formError && (
        <p role="alert" className="text-sm text-rose-300">
          {formError}
        </p>
      )}

      {paidTxHash && checkoutBooking && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-sm text-emerald-100 space-y-1">
          <p className="font-semibold">Seña acreditada. Cupo reservado.</p>
          <p className="text-xs text-emerald-200/80">
            {formatDateLongEs(checkoutBooking.date)} · {checkoutBooking.timeSlotLabel} · memo{" "}
            <span className="font-mono">{checkoutBooking.memoId}</span>
          </p>
          <p className="text-[11px] font-mono break-all text-emerald-200/70">Tx {paidTxHash}</p>
          <a
            href={stellarExpertTxUrl(paidTxHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-[11px] font-medium text-emerald-300 underline"
          >
            Ver en stellar.expert
          </a>
        </div>
      )}

      {checkoutBooking && (
        <StellarCheckoutModal
          booking={checkoutBooking}
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          onPaymentSuccess={(txHash) => {
            setCheckoutBooking((prev) =>
              prev
                ? { ...prev, stellarTxHash: txHash, status: "deposit_paid", isStellarPayment: true }
                : prev,
            );
            setPaidTxHash(txHash);
          }}
        />
      )}
    </form>
  );
};
