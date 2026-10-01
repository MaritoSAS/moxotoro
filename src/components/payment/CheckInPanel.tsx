"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Loader2, ShieldCheck } from "lucide-react";
import type { Booking } from "@/types/moxotoro";
import { balanceMemoId, generateSep0007Uri, stellarExpertTxUrl } from "@/lib/stellar";
import { confirmCheckInAction } from "@/server/bookingActions";

interface CheckInPanelProps {
  booking: Booking;
  onCheckedIn: (booking: Booking) => void;
}

export const CheckInPanel: React.FC<CheckInPanelProps> = ({ booking, onCheckedIn }) => {
  const [open, setOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const checkedIn = booking.status === "confirmed_full" && Boolean(booking.checkedInAt);
  const balanceMemo = balanceMemoId(booking.memoId);
  const sepUri = generateSep0007Uri({
    amountUsdc: booking.balanceDueUsdc,
    memo: balanceMemo,
  });

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    QRCode.toDataURL(sepUri, {
      width: 220,
      margin: 2,
      color: { dark: "#0a0a0a", light: "#f5f0e8" },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl("");
      });
    return () => {
      cancelled = true;
    };
  }, [open, sepUri]);

  if (checkedIn) {
    const when = new Date(booking.checkedInAt ?? "").toLocaleString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
    });
    return (
      <div className="rounded-xl border border-emerald-400/50 bg-emerald-950/40 p-4 text-sm text-emerald-100">
        <p className="font-semibold">Check-in confirmado</p>
        <p className="mt-1 text-xs text-emerald-200/90">{when}</p>
        {booking.balancePaymentMethod === "stellar" && booking.balanceTxHash && (
          <a
            href={stellarExpertTxUrl(booking.balanceTxHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-xs font-medium text-emerald-300 underline"
          >
            Ver saldo en stellar.expert
          </a>
        )}
      </div>
    );
  }

  if (booking.status !== "deposit_paid") return null;

  const verify = async () => {
    setVerifying(true);
    setMessage(null);
    try {
      const result = await confirmCheckInAction(booking);
      if (result.ok && result.booking) {
        onCheckedIn(result.booking);
        setMessage(null);
        return;
      }
      setMessage(result.verification?.message ?? result.error ?? "No se pudo confirmar el check-in.");
    } catch {
      setMessage("No se pudo consultar el saldo. La reserva sigue en esta pestaña.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="rounded-xl border border-[#c4a962]/40 bg-[#0a0a0a]/70 p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#c4a962]">Saldo al iniciar</p>
      <p className="mt-1 text-2xl font-bold text-[#f5f0e8]">{booking.balanceDueUsdc.toFixed(2)} USD</p>
      <p className="mt-1 text-[11px] leading-relaxed text-[#9ca3af]">
        El saldo se paga en USD por Stellar, con el mismo receptor y el mismo activo. El efectivo lo registra solo la administración.
      </p>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#c4a962] py-3 text-xs font-bold uppercase tracking-wider text-[#0a0a0a] hover:bg-[#dfc888]"
        >
          <ShieldCheck className="h-4 w-4" />
          Hacer check-in
        </button>
      ) : (
        <div className="mt-3 space-y-3">
          <p className="text-xs text-[#e8e2d6]">
            Memo del saldo: <span className="font-mono text-[#c4a962]">{balanceMemo}</span>
          </p>
          {qrDataUrl && (
            <img
              src={qrDataUrl}
              alt="Código QR para pagar el saldo en Stellar"
              className="mx-auto h-44 w-44 rounded-lg bg-[#f5f0e8] p-2"
            />
          )}
          <a
            href={sepUri}
            className="flex w-full items-center justify-center rounded-xl border border-[#c4a962]/40 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#e8e2d6] hover:border-[#c4a962]"
          >
            Abrir pago SEP-0007
          </a>
          <button
            type="button"
            onClick={verify}
            disabled={verifying}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0d3d47] py-3 text-xs font-bold uppercase tracking-wider text-[#f5f0e8] hover:bg-[#165260] disabled:opacity-60"
          >
            {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4 text-[#c4a962]" />}
            Verificar saldo en Horizon
          </button>
          {message && <p className="text-xs leading-relaxed text-amber-200">{message}</p>}
        </div>
      )}
    </div>
  );
};
