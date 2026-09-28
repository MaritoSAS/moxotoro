"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Compass,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Sun,
  Sunset,
  Users,
  Wallet,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { CircuitStops } from "@/components/circuit/CircuitStops";
import { WalpacExtension } from "@/components/circuit/WalpacExtension";
import { WeatherPolicySection } from "@/components/policy/WeatherPolicySection";
import { BookingCalendar } from "@/components/booking/BookingCalendar";
import { MOXOTORO_CONFIG } from "@/config/moxotoro.config";
import { getCircuitStops, WALPAC_STOP_ID } from "@/lib/circuit";
import {
  buildWhatsAppReservationUrl,
  calculateQuote,
  createPendingBooking,
  formatArs,
  formatDateLongEs,
  getMinBookingDate,
  isDateBookable,
} from "@/lib/booking";
import { clearActiveBooking, readActiveBooking, writeActiveBooking } from "@/lib/activeBooking";
import { stellarExpertTxUrl } from "@/lib/stellar";
import type { Booking, CircuitStop } from "@/types/moxotoro";

const CIRCUIT_STOPS = getCircuitStops();
const DEFAULT_OPTION = MOXOTORO_CONFIG.pricing.options[0];
const DEFAULT_SLOT = MOXOTORO_CONFIG.capacity.timeSlots[0];

const MapViewer = dynamic(
  () => import("@/components/map/MapViewer").then((mod) => mod.MapViewer),
  {
    ssr: false,
    loading: () => (
      <div className="relative flex h-[520px] w-full items-center justify-center rounded-2xl border border-[#c4a962]/30 bg-[#0d1b2a] shadow-2xl">
        <p className="text-sm text-[#9ca3af]">Cargando mapa del Valle de La Caldera…</p>
      </div>
    ),
  }
);

const StellarCheckoutModal = dynamic(
  () =>
    import("@/components/payment/StellarCheckoutModal").then(
      (mod) => mod.StellarCheckoutModal
    ),
  { ssr: false }
);

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

const fieldClassName =
  "w-full rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-2 text-sm text-[#f5f0e8] placeholder:text-[#6b7280] focus:border-[#c4a962] focus:outline-none";

export const HomeLanding: React.FC = () => {
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [pricingOptionId, setPricingOptionId] = useState(DEFAULT_OPTION.id);
  const [includeWalpac, setIncludeWalpac] = useState(false);
  const [participantsCount, setParticipantsCount] = useState(
    MOXOTORO_CONFIG.capacity.minParticipantsToConfirm
  );
  const [date, setDate] = useState(getMinBookingDate);
  const [timeSlotId, setTimeSlotId] = useState(DEFAULT_SLOT.id);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [confirmedTxHash, setConfirmedTxHash] = useState<string | null>(null);
  const [demoFocus, setDemoFocus] = useState<1 | 2 | 3>(1);
  const [pathHint, setPathHint] = useState<string | null>(null);
  const bookingRef = useRef(booking);
  bookingRef.current = booking;

  useEffect(() => {
    if (bookingRef.current) return;
    const saved = readActiveBooking();
    if (!saved) return;

    const hash = saved.paidTxHash ?? saved.booking.stellarTxHash ?? null;
    setBooking(saved.booking);
    setConfirmedTxHash(hash);
    setCustomerName(saved.booking.customerName);
    setCustomerEmail(saved.booking.customerEmail);
    setCustomerPhone(saved.booking.customerPhone);
    setDate(saved.booking.date);
    setTimeSlotId(saved.booking.timeSlotId);
    setPricingOptionId(saved.booking.pricingOptionId);
    setParticipantsCount(saved.booking.participantsCount);
    setIncludeWalpac(saved.booking.includeWalpacAddon);
    if (!hash) setCheckoutOpen(true);
  }, []);

  useEffect(() => {
    if (!booking) return;
    writeActiveBooking({
      booking,
      paidTxHash: confirmedTxHash ?? booking.stellarTxHash ?? null,
    });
  }, [booking, confirmedTxHash]);

  const selectedOption =
    MOXOTORO_CONFIG.pricing.options.find((option) => option.id === pricingOptionId) ??
    DEFAULT_OPTION;
  const selectedSlot =
    MOXOTORO_CONFIG.capacity.timeSlots.find((slot) => slot.id === timeSlotId) ?? DEFAULT_SLOT;
  const minDate = useMemo(() => getMinBookingDate(), []);
  const quote = useMemo(
    () =>
      calculateQuote({
        option: selectedOption,
        includeWalpac,
        participantsCount,
      }),
    [selectedOption, includeWalpac, participantsCount]
  );

  const handleSelectStop = useCallback((stop: CircuitStop) => {
    setSelectedStopId(stop.id);
  }, []);

  const demoStep = confirmedTxHash ? 6 : booking ? 4 : demoFocus;

  const handleDemoStep = (step: number) => {
    setPathHint(null);
    if (step === 1) {
      setDemoFocus(1);
      scrollToId("experiencia");
      return;
    }
    if (step === 2) {
      setDemoFocus(2);
      scrollToId("reservar");
      return;
    }
    if (step === 3) {
      setDemoFocus(3);
      scrollToId("sena");
      return;
    }
    if (!booking) {
      setDemoFocus(3);
      setPathHint("Iniciá la reserva para abrir el pago USD en Stellar.");
      scrollToId("sena");
      return;
    }
    if (step === 6 && confirmedTxHash) {
      setCheckoutOpen(false);
      window.setTimeout(() => scrollToId("confirmacion"), 60);
      return;
    }
    setCheckoutOpen(true);
  };

  const handleOpenBooking = () => {
    setDemoFocus(2);
    scrollToId("reservar");
  };

  const handleOpenExperience = () => {
    setDemoFocus(1);
    scrollToId("experiencia");
  };

  const handleOpenBookingWithWalpac = () => {
    setIncludeWalpac(true);
    setDemoFocus(2);
    scrollToId("reservar");
  };

  const handleFocusWalpacOnMap = () => {
    setSelectedStopId(WALPAC_STOP_ID);
    scrollToId("mapa");
  };

  const handleOpenCheckout = (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim() || !date) {
      setFormError("Completá nombre, correo, teléfono y fecha para generar la seña.");
      return;
    }

    if (!isDateBookable(date)) {
      setFormError("Elegí una fecha disponible en el calendario.");
      return;
    }

    if (!customerEmail.includes("@")) {
      setFormError("Ingresá un correo electrónico válido.");
      return;
    }

    const nextBooking = createPendingBooking({
      customerName,
      customerEmail,
      customerPhone,
      date,
      timeSlotId: selectedSlot.id,
      timeSlotLabel: selectedSlot.label,
      pricingOption: selectedOption,
      participantsCount,
      includeWalpac,
    });

    clearActiveBooking();
    setConfirmedTxHash(null);
    setBooking(nextBooking);
    setCheckoutOpen(true);
  };

  const handlePaymentSuccess = (txHash: string) => {
    setBooking((current) =>
      current
        ? { ...current, status: "deposit_paid", stellarTxHash: txHash, isStellarPayment: true }
        : current
    );
    setConfirmedTxHash(txHash);
  };

  const whatsAppUrl = buildWhatsAppReservationUrl({
    date,
    timeSlotLabel: selectedSlot.label,
    optionTitle: selectedOption.title,
    participantsCount,
    includeWalpac,
    depositUsdc: quote.depositRequiredUsdc,
  });

  const belowMinimum =
    participantsCount < MOXOTORO_CONFIG.capacity.minParticipantsToConfirm;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar onOpenBooking={handleOpenBooking} demoStep={demoStep} onDemoStep={handleDemoStep} />

      <main>
        <section className="relative overflow-hidden border-b border-[#c4a962]/20">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/assets/circuits/banner-caldera.webp')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/85 to-[#0d3d47]/40" />
          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#c4a962]/40 bg-[#0d3d47]/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#c4a962]">
              <Sparkles className="h-3.5 w-3.5" />
              {MOXOTORO_CONFIG.brand.ancestralOrigin}
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-[#f5f0e8] sm:text-5xl lg:text-6xl">
              {MOXOTORO_CONFIG.brand.name}
            </h1>
            <p className="mt-3 text-xl font-light text-[#c4a962] sm:text-2xl">
              {MOXOTORO_CONFIG.brand.tagline}
            </p>
            <p className="mt-4 flex items-center gap-2 text-sm text-[#e8e2d6]">
              <MapPin className="h-4 w-4 text-[#c4a962]" />
              {MOXOTORO_CONFIG.brand.destination}
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#9ca3af]">
              Circuito patrimonial Camino Real / Qhapaq Ñan en La Caldera. Seña en USD sobre
              Stellar testnet, cupos por turno y protocolo climático documentado. Ex{" "}
              {MOXOTORO_CONFIG.brand.historicalName}.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleOpenExperience}
                className="flex items-center gap-2 rounded-lg bg-[#c4a962] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#0a0a0a] shadow-lg hover:bg-[#dfc888]"
              >
                <Compass className="h-4 w-4" />
                Ver la experiencia
              </button>
              <button
                type="button"
                onClick={handleOpenBooking}
                className="flex items-center gap-2 rounded-lg border border-[#c4a962]/40 bg-[#0d1b2a]/80 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#e8e2d6] hover:border-[#c4a962] hover:text-[#c4a962]"
              >
                <Wallet className="h-4 w-4 text-[#c4a962]" />
                Reservar salida
              </button>
            </div>

            <div className="mt-10 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Recorrido", value: "2,8 km · 5 paradas" },
                {
                  label: "Seña",
                  value: `${MOXOTORO_CONFIG.pricing.depositPercentage}% USD`,
                },
                {
                  label: "Cupo",
                  value: `${MOXOTORO_CONFIG.capacity.minParticipantsToConfirm}–${MOXOTORO_CONFIG.capacity.standardMaxParticipants} pers.`,
                },
                { label: "Red", value: `Stellar ${MOXOTORO_CONFIG.stellar.network}` },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-white/10 bg-[#0a0a0a]/70 px-3 py-3 backdrop-blur-md"
                >
                  <p className="text-[10px] uppercase tracking-wider text-[#9ca3af]">{item.label}</p>
                  <p className="mt-1 text-sm font-semibold text-[#f5f0e8]">{item.value}</p>
                </div>
              ))}
            </div>

            <p className="mt-6 max-w-3xl text-[11px] text-[#9ca3af]">
              {MOXOTORO_CONFIG.brand.institutionalResolution} · {MOXOTORO_CONFIG.brand.standards}
            </p>
          </div>
        </section>

        <section id="circuito" className="scroll-mt-36 mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <CircuitStops
            stops={CIRCUIT_STOPS}
            selectedStopId={selectedStopId}
            onSelectStop={handleSelectStop}
          />
        </section>

        <section id="mapa" className="scroll-mt-36 mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#f5f0e8]">Mapa interactivo del Camino Real</h2>
              <p className="text-sm text-[#9ca3af]">
                Traza GeoJSON sobre La Caldera. Tocá una parada para enfocar el valle.
              </p>
            </div>
            <span className="text-xs text-[#c4a962]">Qhapaq Ñan · dificultad baja</span>
          </div>
          <MapViewer selectedStopId={selectedStopId} onSelectStop={handleSelectStop} />
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
          <WalpacExtension
            onFocusMap={handleFocusWalpacOnMap}
            onOpenBookingWithWalpac={handleOpenBookingWithWalpac}
          />
        </section>

        <section id="stellar" className="scroll-mt-36 border-y border-[#c4a962]/15 bg-[#0d1b2a]/40">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 space-y-8">
            <div id="experiencia" className="scroll-mt-36">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#c4a962]">
                1 · Experiencia
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#c4a962]">
                <Wallet className="h-4 w-4" />
                <span>Tarifas, precio y condiciones</span>
              </div>
              <h2 className="mt-2 text-2xl font-bold text-[#f5f0e8] sm:text-3xl">
                Elegí la experiencia
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#9ca3af]">
                Precio de referencia en USD y ARS. La seña del{" "}
                {MOXOTORO_CONFIG.pricing.depositPercentage}% confirma el cupo. El pago es USD en
                Stellar <strong className="text-emerald-400">{MOXOTORO_CONFIG.stellar.network}</strong>
                . El saldo se abona al iniciar la salida.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {MOXOTORO_CONFIG.pricing.options.map((option) => {
                const selected = option.id === pricingOptionId;
                const depositPerPerson =
                  (option.priceUsdc * MOXOTORO_CONFIG.pricing.depositPercentage) / 100;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setPricingOptionId(option.id);
                      setDemoFocus(1);
                    }}
                    className={`rounded-2xl border p-5 text-left transition-all ${
                      selected
                        ? "border-[#c4a962] bg-[#0d3d47]/70 shadow-lg shadow-[#c4a962]/10"
                        : "border-white/10 bg-[#0d1b2a]/70 hover:border-[#c4a962]/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-[#f5f0e8]">{option.title}</h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          selected
                            ? "bg-[#c4a962] text-[#0a0a0a]"
                            : option.includesTransport
                              ? "bg-emerald-500/15 text-emerald-300"
                              : "bg-white/10 text-[#9ca3af]"
                        }`}
                      >
                        {selected ? "Elegida" : option.includesTransport ? "Con traslado" : "Encuentro local"}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-[#9ca3af]">{option.description}</p>
                    <p className="mt-4 text-[11px] uppercase tracking-wider text-[#9ca3af]">
                      Precio por persona
                    </p>
                    <p className="text-2xl font-bold text-[#f5f0e8]">
                      {option.priceUsdc} USD
                      <span className="ml-2 text-sm font-normal text-[#9ca3af]">
                        · ${formatArs(option.priceArs)} ARS
                      </span>
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#c4a962]">
                      Seña {MOXOTORO_CONFIG.pricing.depositPercentage}%: {depositPerPerson.toFixed(2)} USD por persona
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl border border-[#c4a962]/30 bg-[#0a0a0a]/70 p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#c4a962]">
                Experiencia elegida
              </p>
              <h3 className="mt-1 text-lg font-semibold text-[#f5f0e8]">{selectedOption.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-[#9ca3af]">{selectedOption.description}</p>
              <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-[#0d1b2a]/80 px-3 py-3">
                  <dt className="text-[10px] uppercase tracking-wider text-[#9ca3af]">Precio</dt>
                  <dd className="mt-1 text-lg font-bold text-[#f5f0e8]">
                    {selectedOption.priceUsdc} USD
                    <span className="mt-0.5 block text-[11px] font-normal text-[#9ca3af]">
                      ${formatArs(selectedOption.priceArs)} ARS por persona
                    </span>
                  </dd>
                </div>
                <div className="rounded-xl border border-[#c4a962]/40 bg-[#0d3d47]/50 px-3 py-3">
                  <dt className="text-[10px] uppercase tracking-wider text-[#c4a962]">Seña por persona</dt>
                  <dd className="mt-1 text-lg font-bold text-[#c4a962]">
                    {((selectedOption.priceUsdc * MOXOTORO_CONFIG.pricing.depositPercentage) / 100).toFixed(2)} USD
                    <span className="mt-0.5 block text-[11px] font-normal text-[#e8e2d6]">
                      {MOXOTORO_CONFIG.pricing.depositPercentage}% del precio
                    </span>
                  </dd>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#0d1b2a]/80 px-3 py-3">
                  <dt className="text-[10px] uppercase tracking-wider text-[#9ca3af]">Condiciones</dt>
                  <dd className="mt-1 text-xs leading-relaxed text-[#e8e2d6]">
                    {MOXOTORO_CONFIG.policies.depositRule.summary} Mínimo{" "}
                    {MOXOTORO_CONFIG.capacity.minParticipantsToConfirm} participantes. Cierre a las{" "}
                    {MOXOTORO_CONFIG.capacity.cutoffHourPreviousDay}:00 del día anterior.
                  </dd>
                </div>
              </dl>
            </div>

            <form
              id="reservar"
              onSubmit={handleOpenCheckout}
              className="scroll-mt-36 grid grid-cols-1 gap-6 rounded-2xl border border-[#c4a962]/30 bg-[#0d1b2a]/90 p-6 shadow-2xl lg:grid-cols-12"
            >
              <div
                className="space-y-4 lg:col-span-7"
                onFocus={() => setDemoFocus(2)}
              >
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#c4a962]">
                    2 · Reserva
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#c4a962]">
                    <CalendarDays className="h-4 w-4" />
                    Fecha, turno y participantes
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-[#f5f0e8]">Reservá tu salida</h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#9ca3af]">
                    Elegí el día en el calendario y el turno mañana o tarde. Los días no disponibles
                    quedan atenuados: el cupo cierra a las{" "}
                    {MOXOTORO_CONFIG.capacity.cutoffHourPreviousDay}:00 del día anterior (hora
                    Argentina).
                  </p>
                </div>

                <BookingCalendar
                  selectedDate={date}
                  minDate={minDate}
                  onSelectDate={(ymd) => {
                    if (!isDateBookable(ymd)) return;
                    setDate(ymd);
                    setFormError(null);
                  }}
                />

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
                              : "border-white/10 bg-[#0a0a0a]/60 hover:border-[#c4a962]/40"
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
                            <span className="mt-0.5 block text-[11px] text-[#9ca3af]">{slot.label}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                <p className="rounded-lg border border-[#c4a962]/20 bg-[#0d3d47]/40 px-3 py-2 text-xs text-[#e8e2d6]" aria-live="polite">
                  Salida: <strong className="text-[#c4a962]">{formatDateLongEs(date)}</strong> ·{" "}
                  {selectedSlot.label}
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="text-xs text-[#9ca3af]">
                    Nombre completo
                    <input
                      required
                      value={customerName}
                      onChange={(event) => setCustomerName(event.target.value)}
                      className={`${fieldClassName} mt-1`}
                      placeholder="Como figura en el documento"
                      autoComplete="name"
                    />
                  </label>
                  <label className="text-xs text-[#9ca3af]">
                    Correo electrónico
                    <input
                      required
                      type="email"
                      value={customerEmail}
                      onChange={(event) => setCustomerEmail(event.target.value)}
                      className={`${fieldClassName} mt-1`}
                      placeholder="tu@correo.com"
                      autoComplete="email"
                    />
                  </label>
                  <label className="text-xs text-[#9ca3af]">
                    Teléfono / WhatsApp
                    <input
                      required
                      value={customerPhone}
                      onChange={(event) => setCustomerPhone(event.target.value)}
                      className={`${fieldClassName} mt-1`}
                      placeholder="+54 9 387 …"
                      autoComplete="tel"
                    />
                  </label>
                  <label className="text-xs text-[#9ca3af]">
                    Participantes
                    <input
                      required
                      type="number"
                      min={1}
                      max={MOXOTORO_CONFIG.capacity.standardMaxParticipants}
                      value={participantsCount}
                      onChange={(event) =>
                        setParticipantsCount(
                          Math.min(
                            MOXOTORO_CONFIG.capacity.standardMaxParticipants,
                            Math.max(1, Number(event.target.value) || 1)
                          )
                        )
                      }
                      className={`${fieldClassName} mt-1`}
                    />
                  </label>
                </div>

                <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-[#0a0a0a]/60 p-3 text-sm text-[#e8e2d6]">
                  <input
                    type="checkbox"
                    checked={includeWalpac}
                    onChange={(event) => setIncludeWalpac(event.target.checked)}
                    className="mt-1 accent-[#c4a962]"
                  />
                  <span>
                    Sumar extensión Casa de los Pájaros (Walpac) · +
                    {MOXOTORO_CONFIG.pricing.walpacAddon.priceUsdc} USD por persona
                  </span>
                </label>

                {belowMinimum && (
                  <p className="rounded-lg border border-amber-500/30 bg-amber-950/40 px-3 py-2 text-xs text-amber-200">
                    La salida se confirma con un mínimo de{" "}
                    {MOXOTORO_CONFIG.capacity.minParticipantsToConfirm} participantes. Tu seña queda
                    registrada; coordinamos el cupo antes de la fecha.
                  </p>
                )}

                <p className="text-[11px] text-[#9ca3af]">
                  Cierre de reservas: {MOXOTORO_CONFIG.capacity.cutoffHourPreviousDay}:00 hs del día
                  anterior. {MOXOTORO_CONFIG.policies.depositRule.summary}
                </p>
              </div>

              <aside
                id="sena"
                className="scroll-mt-36 space-y-4 rounded-xl border border-[#c4a962]/40 bg-[#0a0a0a]/80 p-5 lg:sticky lg:top-36 lg:col-span-5 lg:self-start"
              >
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#c4a962]">
                    3 · Seña USD
                  </p>
                  <h3 className="mt-1 flex items-center gap-2 text-sm font-semibold text-[#f5f0e8]">
                    <ShieldCheck className="h-4 w-4 text-[#c4a962]" />
                    Total y seña de esta salida
                  </h3>
                </div>

                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between gap-3 text-[#9ca3af]">
                    <dt>Experiencia</dt>
                    <dd className="text-right text-[#e8e2d6]">{selectedOption.title}</dd>
                  </div>
                  <div className="flex justify-between gap-3 text-[#9ca3af]">
                    <dt>Salida</dt>
                    <dd className="text-right text-[#e8e2d6]">
                      {formatDateLongEs(date)}
                      <span className="block text-[11px]">{selectedSlot.label}</span>
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 text-[#9ca3af]">
                    <dt>Participantes</dt>
                    <dd className="flex items-center gap-1 text-[#e8e2d6]">
                      <Users className="h-3.5 w-3.5 text-[#c4a962]" />
                      {participantsCount}
                    </dd>
                  </div>
                </dl>

                <div className="rounded-xl border border-white/15 bg-[#0d1b2a] px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9ca3af]">
                    Total de la experiencia
                  </p>
                  <p className="mt-1 text-3xl font-bold tracking-tight text-[#f5f0e8]">
                    {quote.totalPriceUsdc.toFixed(2)} USD
                  </p>
                  <p className="text-sm text-[#9ca3af]">${formatArs(quote.totalPriceArs)} ARS</p>
                </div>

                <div className="rounded-xl border-2 border-[#c4a962] bg-[#0d3d47]/70 px-4 py-4 shadow-lg shadow-[#c4a962]/10">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#c4a962]">
                    Seña requerida hoy · {MOXOTORO_CONFIG.pricing.depositPercentage}%
                  </p>
                  <p className="mt-1 text-4xl font-bold tracking-tight text-[#c4a962]">
                    {quote.depositRequiredUsdc.toFixed(2)} USD
                  </p>
                  <p className="text-sm text-[#e8e2d6]">
                    ${formatArs(quote.depositRequiredArs)} ARS · saldo al iniciar{" "}
                    {quote.balanceDueUsdc.toFixed(2)} USD
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                    Medio de pago
                  </p>
                  <p className="mt-1 text-base font-bold text-[#f5f0e8]">
                    USD · Stellar {MOXOTORO_CONFIG.stellar.network}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#9ca3af]">
                    El checkout abre la seña existente (SEP-0007). Horizon verifica memo, destino, activo y monto.
                  </p>
                </div>

                {booking && (
                  <p className="text-xs text-[#e8e2d6]">
                    Estado de la reserva:{" "}
                    <strong className={confirmedTxHash ? "text-emerald-300" : "text-amber-200"}>
                      {confirmedTxHash ? "Confirmado" : "Pendiente"}
                    </strong>
                    <span className="mt-1 block font-mono text-[10px] text-[#9ca3af]">
                      Memo {booking.memoId}
                    </span>
                  </p>
                )}

                {confirmedTxHash && booking && (
                  <div
                    id="confirmacion"
                    className="scroll-mt-36 rounded-xl border border-emerald-400/50 bg-emerald-950/50 p-4 text-sm text-emerald-100"
                  >
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                      6 · Confirmación
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-base font-semibold">
                      <CheckCircle2 className="h-5 w-5" />
                      Seña verificada. Cupo reservado.
                    </p>
                    <p className="mt-2 text-xs text-emerald-200/90">
                      {booking.pricingOptionTitle} · {formatDateLongEs(booking.date)} · {booking.timeSlotLabel}
                    </p>
                    <p className="mt-1 text-xs">
                      Total {booking.totalPriceUsdc.toFixed(2)} USD · seña {booking.depositRequiredUsdc.toFixed(2)} USD
                    </p>
                    <p className="mt-1 font-mono text-[10px] break-all">Memo {booking.memoId}</p>
                    <p className="mt-1 font-mono text-[10px] break-all">Tx {confirmedTxHash}</p>
                    <a
                      href={stellarExpertTxUrl(confirmedTxHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block font-medium text-emerald-300 underline"
                    >
                      Ver en stellar.expert
                    </a>
                  </div>
                )}

                {formError && (
                  <p className="rounded-lg border border-rose-500/30 bg-rose-950/40 px-3 py-2 text-xs text-rose-200">
                    {formError}
                  </p>
                )}

                {pathHint && (
                  <p className="rounded-lg border border-[#c4a962]/30 bg-[#0d3d47]/50 px-3 py-2 text-xs text-[#e8e2d6]">
                    {pathHint}
                  </p>
                )}

                {booking && !confirmedTxHash && (
                  <button
                    type="button"
                    onClick={() => setCheckoutOpen(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c4a962] py-3 text-xs font-bold uppercase tracking-wider text-[#0a0a0a] hover:bg-[#dfc888]"
                  >
                    <Wallet className="h-4 w-4" />
                    Continuar pago USD en Stellar
                  </button>
                )}

                <button
                  type="submit"
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold uppercase tracking-wider ${
                    booking && !confirmedTxHash
                      ? "border border-white/15 bg-transparent text-[#e8e2d6] hover:border-[#c4a962]/50"
                      : "bg-[#c4a962] text-[#0a0a0a] hover:bg-[#dfc888]"
                  }`}
                >
                  <Wallet className="h-4 w-4" />
                  {booking
                    ? confirmedTxHash
                      ? "Nueva reserva"
                      : "Generar otra reserva"
                    : "Iniciar reserva"}
                </button>
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/40 py-2.5 text-xs font-medium text-emerald-300 hover:bg-emerald-900/50"
                >
                  <MessageCircle className="h-4 w-4" />
                  Coordinar por WhatsApp
                </a>
                <p className="text-[10px] leading-relaxed text-[#9ca3af]">
                  USD Testnet (emisor Circle) · verificación en Horizon. Solo clave pública
                  receptora; no uses mainnet.
                </p>
              </aside>
            </form>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <WeatherPolicySection />
        </section>
      </main>

      <footer className="border-t border-[#c4a962]/20 bg-[#0d1b2a] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold tracking-widest text-[#f5f0e8]">{MOXOTORO_CONFIG.brand.name}</p>
            <p className="text-xs text-[#9ca3af]">
              {MOXOTORO_CONFIG.brand.legalEntity} · {MOXOTORO_CONFIG.brand.historicalName}
            </p>
            <p className="mt-1 text-[11px] text-[#6b7280]">
              Argentina Builder Challenge (BAF × Stellar) · pagos en{" "}
              {MOXOTORO_CONFIG.stellar.network} únicamente
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs">
            <a
              href={MOXOTORO_CONFIG.contact.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#c4a962] hover:text-[#dfc888]"
            >
              {MOXOTORO_CONFIG.contact.instagramHandle}
            </a>
            <a
              href={MOXOTORO_CONFIG.contact.whatsAppDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-300 hover:text-emerald-200"
            >
              WhatsApp reservas
            </a>
          </div>
        </div>
      </footer>

      {booking && (
        <StellarCheckoutModal
          booking={booking}
          isOpen={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};
