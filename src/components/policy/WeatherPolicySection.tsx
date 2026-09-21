"use client";

import React, { useState } from "react";
import { CloudRain, ShieldCheck, RefreshCw, Layers, AlertTriangle, ArrowRight, RotateCcw, CheckCircle2, History } from "lucide-react";
import { MOXOTORO_CONFIG } from "@/config/moxotoro.config";
import { BookingStatus } from "@/types/moxotoro";

export const WeatherPolicySection: React.FC = () => {
  // Simulator state for demo and challenge evaluation
  const [simulatedStatus, setSimulatedStatus] = useState<BookingStatus>("deposit_paid");
  const [incidentStep, setIncidentStep] = useState<number>(0);
  const [incidentLog, setIncidentLog] = useState<string[]>([
    "Reserva creada con seña del 50% acreditada vía Stellar (Estado: 🟡 Con seña).",
  ]);

  const appendLog = (...messages: string[]) => {
    const stamp = new Date().toLocaleTimeString("es-AR");
    setIncidentLog((prev) => [...prev, ...messages.map((message) => `[${stamp}] ${message}`)]);
  };

  const triggerWeatherAlert = () => {
    setSimulatedStatus("weather_suspended");
    setIncidentStep(1);
    appendLog(
      "🌧️ ALERTA METEOROLÓGICA: Lluvias torrenciales en el Valle de Siancas. Actividad suspendida por seguridad.",
      "Iniciando Protocolo de 3 Instancias (NO se cancela automáticamente).",
    );
  };

  const offerReschedule = () => {
    setSimulatedStatus("reschedule_offered");
    setIncidentStep(2);
    appendLog(
      "🔄 PASO 1 (Prioridad): Se ofreció al cliente reprogramar turno para el próximo sábado conservando el 100% de la seña.",
    );
  };

  const acceptReschedule = () => {
    setSimulatedStatus("rescheduled");
    setIncidentStep(0);
    appendLog(
      "🟢 RESOLUCIÓN PASO 1: Cliente aceptó nueva fecha. Seña transferida con éxito. Estado: 🟢 Reprogramada.",
    );
  };

  const offerAlternative = () => {
    setSimulatedStatus("alternative_offered");
    setIncidentStep(3);
    appendLog(
      "🟣 PASO 2: El cliente no puede en la nueva fecha. Se ofrece actividad alternativa en espacio cubierto (Masterclass y taller en Casa de los Pájaros con Walpac).",
    );
  };

  const acceptAlternative = () => {
    setSimulatedStatus("rescheduled");
    setIncidentStep(0);
    appendLog(
      "🟢 RESOLUCIÓN PASO 2: Cliente aceptó experiencia alternativa. Seña aplicada. Estado: 🟢 Reprogramada.",
    );
  };

  const issueExceptionalRefund = () => {
    setSimulatedStatus("exceptional_refund");
    setIncidentStep(0);
    appendLog(
      "🔴 PASO 3 (Último recurso): Tras agotar instancias 1 y 2 sin coincidencia justificada, se autorizó devolución excepcional de la seña.",
      "Registro inmutable emitido on-chain con hash de retorno en Stellar.",
    );
  };

  const resetSimulator = () => {
    setSimulatedStatus("deposit_paid");
    setIncidentStep(0);
    setIncidentLog([
      "Simulador reiniciado: Reserva creada con seña del 50% acreditada vía Stellar (Estado: 🟡 Con seña).",
    ]);
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "deposit_paid":
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300 border border-amber-500/40">🟡 Reserva con seña</span>;
      case "weather_suspended":
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/20 px-3 py-1 text-xs font-semibold text-sky-300 border border-sky-500/40">🌧️ Suspendida por clima</span>;
      case "reschedule_offered":
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 border border-blue-500/40">🔄 Reasignación ofrecida</span>;
      case "alternative_offered":
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-300 border border-purple-500/40">🟣 Alternativa ofrecida</span>;
      case "rescheduled":
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/40">🟢 Reprogramada</span>;
      case "exceptional_refund":
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-300 border border-rose-500/40">🔴 Reembolso excepcional</span>;
      default:
        return null;
    }
  };

  return (
    <section id="politica" className="rounded-2xl border border-white/10 bg-[#0d1b2a]/90 p-6 sm:p-8 space-y-8 shadow-2xl">
      {/* Section Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#c4a962]">
          <ShieldCheck className="h-4 w-4" />
          <span>Políticas de Operación y Transparencia</span>
        </div>
        <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-[#f5f0e8]">
          Política de Seña y Protocolo de Suspensión por Clima
        </h2>
        <p className="mt-2 text-sm text-[#9ca3af] max-w-3xl leading-relaxed">
          {MOXOTORO_CONFIG.policies.depositRule.fullNotice}
        </p>
      </div>

      {/* 3-Step Protocol Visual Flow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MOXOTORO_CONFIG.policies.weatherProtocol.steps.map((s, idx) => (
          <div
            key={s.step}
            className="rounded-xl border border-white/10 bg-[#0a0a0a]/60 p-5 space-y-2 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#0d3d47] text-xs font-bold text-[#c4a962] border border-[#c4a962]/40">
                {s.step}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af]">
                {idx === 0 ? "Instancia 1 (Principal)" : idx === 1 ? "Instancia 2" : "Última Alternativa"}
              </span>
            </div>
            <h4 className="font-semibold text-sm text-[#f5f0e8] pt-1">{s.title}</h4>
            <p className="text-xs text-[#9ca3af] leading-relaxed">{s.action}</p>
          </div>
        ))}
      </div>

      {/* Interactive Simulator Card for Challenge / Jury */}
      <div className="rounded-xl border border-[#c4a962]/30 bg-gradient-to-br from-[#0a0a0a] via-[#0d1b2a] to-[#072228] p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-[#c4a962]" />
            <h3 className="font-semibold text-sm text-[#f5f0e8]">
              Simulador de Trazabilidad y Máquina de Estados
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#9ca3af]">Estado actual:</span>
            {getStatusBadge(simulatedStatus)}
          </div>
        </div>

        {/* Action controls according to step */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {simulatedStatus === "deposit_paid" && (
            <button
              onClick={triggerWeatherAlert}
              className="flex items-center gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 px-3.5 py-2 text-xs font-semibold text-white transition-colors"
            >
              <CloudRain className="h-3.5 w-3.5" />
              <span>Simular Alerta de Lluvia Torrencial</span>
            </button>
          )}

          {simulatedStatus === "weather_suspended" && (
            <button
              onClick={offerReschedule}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 px-3.5 py-2 text-xs font-semibold text-white transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Ofrecer Reasignación de Turno (Paso 1)</span>
            </button>
          )}

          {simulatedStatus === "reschedule_offered" && (
            <>
              <button
                onClick={acceptReschedule}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-white transition-colors"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Cliente Acepta Nueva Fecha</span>
              </button>
              <button
                onClick={offerAlternative}
                className="flex items-center gap-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 px-3.5 py-2 text-xs font-semibold text-white transition-colors"
              >
                <span>No puede fecha → Ofrecer Alternativa (Paso 2)</span>
              </button>
            </>
          )}

          {simulatedStatus === "alternative_offered" && (
            <>
              <button
                onClick={acceptAlternative}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-white transition-colors"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Cliente Acepta Taller Alternativo</span>
              </button>
              <button
                onClick={issueExceptionalRefund}
                className="flex items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 px-3.5 py-2 text-xs font-semibold text-white transition-colors"
              >
                <span>Sin acuerdo → Reembolso Excepcional (Paso 3)</span>
              </button>
            </>
          )}

          {(simulatedStatus === "rescheduled" || simulatedStatus === "exceptional_refund") && (
            <button
              onClick={resetSimulator}
              className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 px-3.5 py-2 text-xs font-semibold text-[#f5f0e8] transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reiniciar Simulación de Reserva</span>
            </button>
          )}
        </div>

        {/* Incident Audit Log */}
        <div className="rounded-lg bg-[#0a0a0a] border border-white/10 p-3 text-xs font-mono space-y-1.5 text-[#9ca3af] max-h-36 overflow-y-auto">
          {incidentLog.map((log, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-[#e8e2d6]">{log}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
