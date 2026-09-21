"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Copy, Check, ExternalLink, Loader2, ShieldCheck, ArrowLeft, Zap, Sparkles } from "lucide-react";
import { Booking } from "@/types/moxotoro";
import { MOXOTORO_CONFIG } from "@/config/moxotoro.config";
import { generateSep0007Uri, verifyTransactionByMemo } from "@/lib/stellar";

interface StellarCheckoutModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (txHash: string) => void;
}

export const StellarCheckoutModal: React.FC<StellarCheckoutModalProps> = ({
  booking,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedMemo, setCopiedMemo] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);

  const sepUri = generateSep0007Uri({
    amountUsdc: booking.depositRequiredUsdc,
    memo: booking.memoId,
  });

  useEffect(() => {
    if (!isOpen) return;
    QRCode.toDataURL(sepUri, {
      width: 260,
      margin: 2,
      color: {
        dark: "#0a0a0a",
        light: "#f5f0e8",
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("Error generating QR:", err));
  }, [isOpen, sepUri]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, type: "key" | "memo") => {
    navigator.clipboard.writeText(text);
    if (type === "key") {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedMemo(true);
      setTimeout(() => setCopiedMemo(false), 2000);
    }
  };

  const handleVerifyOnChain = async () => {
    setIsVerifying(true);
    setVerificationMessage(null);

    const result = await verifyTransactionByMemo(booking.memoId);
    setIsVerifying(false);

    if (result.verified && result.txHash) {
      onPaymentSuccess(result.txHash);
    } else {
      setVerificationMessage(result.message);
    }
  };

  const handleSimulatePayment = () => {
    // Generates a mock realistic Stellar Tx Hash for demo purposes
    const mockHash = "7f8b9a2c" + Array.from({ length: 56 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    onPaymentSuccess(mockHash);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#c4a962]/40 bg-[#0d1b2a] p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#c4a962]/20 border border-[#c4a962]/40 flex items-center justify-center text-[#c4a962]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#f5f0e8]">Pago de Seña en Stellar USDC</h3>
              <p className="text-[11px] text-[#9ca3af]">
                Red: <span className="text-emerald-400 font-mono font-semibold">{MOXOTORO_CONFIG.stellar.network}</span> · Liquidación directa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#9ca3af] hover:text-[#f5f0e8] hover:bg-white/5"
          >
            ✕
          </button>
        </div>

        {/* Deposit Summary Box */}
        <div className="rounded-xl border border-[#c4a962]/30 bg-[#0a0a0a]/70 p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#9ca3af] uppercase tracking-wider block">
              Seña a abonar hoy (50%)
            </span>
            <span className="text-2xl font-bold text-[#c4a962]">
              {booking.depositRequiredUsdc.toFixed(2)} USDC
            </span>
            <span className="text-xs text-[#9ca3af] ml-2">
              (~${booking.depositRequiredArs.toLocaleString("es-AR")} ARS)
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-[#9ca3af] block">Saldo al iniciar:</span>
            <span className="text-xs font-semibold text-[#f5f0e8]">
              {booking.balanceDueUsdc.toFixed(2)} USDC
            </span>
          </div>
        </div>

        {/* QR Code & Mobile Instructions */}
        <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#0a0a0a]/50 border border-white/5">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Código QR de Pago Stellar"
              className="h-48 w-48 rounded-lg border-2 border-[#c4a962]/40 p-1 bg-[#f5f0e8]"
            />
          ) : (
            <div className="h-48 w-48 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#c4a962]" />
            </div>
          )}
          <span className="mt-2 text-[11px] text-[#9ca3af] text-center">
            Escaneá con <strong>LOBSTR</strong>, <strong>Freighter</strong> o cualquier billetera compatible con Stellar (SEP-0007).
          </span>
        </div>

        {/* Payment Details (Address & MEMO) */}
        <div className="space-y-2.5 text-xs">
          <div>
            <label className="text-[11px] text-[#9ca3af] mb-1 block">Cuenta Pública Receptora (Moxotoro):</label>
            <div className="flex items-center justify-between rounded-lg bg-[#0a0a0a] border border-white/10 px-3 py-2 font-mono text-[11px] text-[#e8e2d6]">
              <span className="truncate mr-2">{MOXOTORO_CONFIG.stellar.receiverPublicKey}</span>
              <button
                onClick={() => copyToClipboard(MOXOTORO_CONFIG.stellar.receiverPublicKey, "key")}
                className="text-[#c4a962] hover:text-[#dfc888]"
                title="Copiar dirección pública"
              >
                {copiedKey ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] text-[#9ca3af]">MEMO de Reserva (Obligatorio para acreditar seña):</label>
              <span className="text-[10px] text-amber-400 font-medium">No olvidar ingresar el Memo</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[#0a0a0a] border border-[#c4a962]/40 px-3 py-2 font-mono text-sm font-bold text-[#c4a962]">
              <span>{booking.memoId}</span>
              <button
                onClick={() => copyToClipboard(booking.memoId, "memo")}
                className="text-[#c4a962] hover:text-[#dfc888]"
                title="Copiar MEMO"
              >
                {copiedMemo ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Verification status / notice */}
        {verificationMessage && (
          <div className="rounded-lg bg-amber-950/40 border border-amber-500/30 p-2.5 text-xs text-amber-200">
            {verificationMessage}
          </div>
        )}

        {/* Action Controls */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <button
            onClick={handleVerifyOnChain}
            disabled={isVerifying}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0d3d47] to-[#165260] hover:from-[#165260] hover:to-[#0d3d47] border border-[#c4a962]/40 py-2.5 text-xs font-semibold text-[#f5f0e8] transition-all shadow-md"
          >
            {isVerifying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-[#c4a962]" />
                <span>Consultando Stellar Horizon Ledger...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4 text-[#c4a962]" />
                <span>Verificar Acreditación de Seña en Stellar</span>
              </>
            )}
          </button>

          {/* Quick Demo Simulator Button for Challenge evaluation */}
          <button
            onClick={handleSimulatePayment}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#c4a962] hover:bg-[#dfc888] py-2.5 text-xs font-bold uppercase tracking-wider text-[#0a0a0a] transition-all shadow-lg active:scale-98"
          >
            <Zap className="h-4 w-4" />
            <span>Simular Confirmación Inmediata (Demo Challenge)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
