"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDateLongEs } from "@/lib/booking";
import type { AdminOverview } from "@/lib/bookingRecords";
import type { Booking } from "@/types/moxotoro";
import { acknowledgeAdminVisitAction, logoutAdminAction, markCashBalanceAction } from "@/server/bookingActions";

function usd(amount: number): string {
  return `${amount.toFixed(2)} USD`;
}

function statusLabel(booking: Booking): "Reservada" | "Seña pagada" | "Check-in confirmado" {
  if (booking.status === "confirmed_full") return "Check-in confirmado";
  if (booking.status === "deposit_paid") return "Seña pagada";
  return "Reservada";
}

function statusClass(label: ReturnType<typeof statusLabel>): string {
  if (label === "Check-in confirmado") return "border-emerald-400/40 bg-emerald-950/40 text-emerald-200";
  if (label === "Seña pagada") return "border-[#c4a962]/40 bg-[#0d3d47]/70 text-[#c4a962]";
  return "border-amber-500/30 bg-amber-950/40 text-amber-100";
}

export const AdminDashboard: React.FC<{ overview: AdminOverview }> = ({ overview }) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const newIds = new Set(overview.newlyConfirmed.map((booking) => booking.id));

  useEffect(() => {
    void acknowledgeAdminVisitAction();
  }, []);

  const markCash = async (bookingId: string) => {
    setPendingId(bookingId);
    setError(null);
    const result = await markCashBalanceAction(bookingId);
    setPendingId(null);
    if (!result.ok) {
      setError(result.error ?? "No se pudo registrar el efectivo.");
      return;
    }
    router.refresh();
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#c4a962]">MOXOTORO</p>
          <h1 className="mt-2 text-3xl font-bold text-[#f5f0e8]">Reservas de hoy y próximas</h1>
          <p className="mt-1 text-sm text-[#9ca3af]">
            {overview.mode === "off"
              ? "Sin base configurada: el panel no puede listar reservas todavía."
              : overview.mode === "memory"
                ? "Memoria local de desarrollo. En producción hace falta Upstash."
                : "Guardadas en Upstash Redis."}
          </p>
        </div>
        <form action={logoutAdminAction}>
          <button type="submit" className="text-xs font-semibold uppercase tracking-wider text-[#c4a962] hover:text-[#dfc888]">
            Salir
          </button>
        </form>
      </div>

      {overview.newlyConfirmed.length > 0 && (
        <section className="mt-6 rounded-2xl border border-[#c4a962]/40 bg-[#0d3d47]/50 p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#c4a962]">
            {overview.newlyConfirmed.length} {overview.newlyConfirmed.length === 1 ? "confirmación nueva" : "confirmaciones nuevas"} desde la última visita
          </p>
          <ul className="mt-2 space-y-1 text-sm text-[#f5f0e8]">
            {overview.newlyConfirmed.map((booking) => (
              <li key={booking.id}>
                {booking.customerName} · {formatDateLongEs(booking.date)} · {statusLabel(booking)}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          ["Seña cobrada", overview.income.depositUsd],
          ["Saldo cobrado", overview.income.balanceUsd],
          ["Total", overview.income.totalUsd],
        ].map(([label, amount]) => (
          <div key={String(label)} className="rounded-2xl border border-white/10 bg-[#0d1b2a] px-4 py-4">
            <p className="text-[11px] uppercase tracking-wider text-[#9ca3af]">{label}</p>
            <p className="mt-1 text-2xl font-bold text-[#f5f0e8]">{usd(Number(amount))}</p>
          </div>
        ))}
      </section>

      {error && <p className="mt-4 text-sm text-rose-200">{error}</p>}

      <section className="mt-6 space-y-3">
        {overview.bookings.length === 0 && (
          <p className="rounded-2xl border border-white/10 bg-[#0d1b2a]/60 px-4 py-6 text-sm text-[#9ca3af]">
            No hay reservas de hoy ni de los próximos días en la base.
          </p>
        )}
        {overview.bookings.map((booking) => {
          const label = statusLabel(booking);
          const canCash = booking.status === "deposit_paid";
          return (
            <article
              key={booking.id}
              className={`rounded-2xl border bg-[#0d1b2a]/80 p-4 ${newIds.has(booking.id) ? "border-[#c4a962]" : "border-white/10"}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#f5f0e8]">{booking.customerName}</p>
                  <p className="mt-1 text-sm text-[#e8e2d6]">{formatDateLongEs(booking.date)}</p>
                  <p className="text-xs text-[#9ca3af]">{booking.timeSlotLabel}</p>
                  <p className="mt-2 text-sm text-[#e8e2d6]">{booking.pricingOptionTitle}</p>
                  <p className="text-xs text-[#9ca3af]">
                    {booking.participantsCount}{" "}
                    {booking.participantsCount === 1 ? "participante" : "participantes"}
                  </p>
                </div>
                <span className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusClass(label)}`}>
                  {label}
                </span>
              </div>
              <p className="mt-3 text-xs text-[#9ca3af]">
                Seña {usd(booking.depositRequiredUsdc)} · saldo {usd(booking.balanceDueUsdc)}
                {booking.includeWalpacAddon ? " · Casa de los Pájaros incluida" : ""}
              </p>
              {canCash && (
                <button
                  type="button"
                  onClick={() => markCash(booking.id)}
                  disabled={pendingId === booking.id}
                  className="mt-3 w-full rounded-xl border border-[#c4a962]/40 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#e8e2d6] hover:border-[#c4a962] disabled:opacity-60 sm:w-auto sm:px-4"
                >
                  {pendingId === booking.id ? "Guardando…" : "Saldo cobrado en efectivo"}
                </button>
              )}
              {booking.status === "pending_deposit" && (
                <p className="mt-3 text-[11px] text-[#9ca3af]">El efectivo del saldo se habilita cuando la seña está pagada.</p>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
};
