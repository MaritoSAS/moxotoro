"use client";

import React from "react";

export const DEMO_STEPS = [
  { id: 1, label: "Experiencia" },
  { id: 2, label: "Reserva" },
  { id: 3, label: "Seña USD" },
  { id: 4, label: "Stellar" },
  { id: 5, label: "Verificación" },
  { id: 6, label: "Confirmación" },
] as const;

interface DemoPathProps {
  activeStep: number;
  onSelect?: (step: number) => void;
}

export const DemoPath: React.FC<DemoPathProps> = ({ activeStep, onSelect }) => {
  return (
    <ol
      aria-label="Recorrido de la reserva"
      className="flex items-center gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {DEMO_STEPS.map((step, index) => {
        const current = step.id === activeStep;
        const done = step.id < activeStep;
        const className = `inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide sm:px-2.5 sm:text-[11px] ${
          current
            ? "border-[#c4a962] bg-[#c4a962] text-[#0a0a0a]"
            : done
              ? "border-emerald-500/40 bg-emerald-950/50 text-emerald-200"
              : "border-white/10 bg-[#0a0a0a]/60 text-[#9ca3af]"
        }`;

        const content = (
          <>
            <span
              className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] ${
                current ? "bg-[#0a0a0a]/15" : done ? "bg-emerald-400/20" : "bg-white/5"
              }`}
            >
              {step.id}
            </span>
            {step.label}
          </>
        );

        return (
          <li key={step.id} className="flex shrink-0 items-center gap-1">
            {onSelect ? (
              <button
                type="button"
                onClick={() => onSelect(step.id)}
                aria-current={current ? "step" : undefined}
                className={`${className} hover:border-[#c4a962]/70`}
              >
                {content}
              </button>
            ) : (
              <span aria-current={current ? "step" : undefined} className={className}>
                {content}
              </span>
            )}
            {index < DEMO_STEPS.length - 1 && (
              <span aria-hidden="true" className="text-[10px] text-[#c4a962]/70">
                →
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
};

export function demoStepFromCheckout(phase: "pending" | "confirmed" | "failed", isVerifying: boolean, hasChecked: boolean): number {
  if (phase === "confirmed") return 6;
  if (isVerifying || hasChecked || phase === "failed") return 5;
  return 4;
}
