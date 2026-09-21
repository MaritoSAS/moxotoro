"use client";

import React from "react";
import { Sparkles, Palette, HeartHandshake, Eye, MapPin, Check } from "lucide-react";
import { MOXOTORO_CONFIG } from "@/config/moxotoro.config";

interface WalpacExtensionProps {
  onFocusMap: () => void;
  onOpenBookingWithWalpac: () => void;
}

export const WalpacExtension: React.FC<WalpacExtensionProps> = ({
  onFocusMap,
  onOpenBookingWithWalpac,
}) => {
  const walpacConfig = MOXOTORO_CONFIG.pricing.walpacAddon;

  return (
    <section id="walpac" className="relative rounded-2xl border border-[#c4a962]/40 bg-gradient-to-br from-[#0d3d47]/80 via-[#0d1b2a] to-[#0a0a0a] p-6 sm:p-8 shadow-2xl overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-[#c4a962]/10 blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Real Artwork Photo */}
        <div className="lg:col-span-5 relative group">
          <div className="relative aspect-[4/5] rounded-xl overflow-hidden border border-[#c4a962]/30 shadow-2xl">
            <img
              src="/assets/circuits/casa-de-los-pajaros-walpac.webp"
              alt="Casa de los Pájaros — Mural del artista Walpac en La Caldera"
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/90 via-transparent to-transparent" />
            
            {/* Overlay badge */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-[#f5f0e8] bg-[#0a0a0a]/75 backdrop-blur-md px-3 py-2 rounded-lg border border-[#c4a962]/20">
              <span className="flex items-center gap-1.5 font-medium">
                <Palette className="h-3.5 w-3.5 text-[#c4a962]" />
                <span>Mural "Quiero Chicha, Busco Chicha"</span>
              </span>
              <span className="text-[10px] text-[#c4a962]">Arte & Coplas</span>
            </div>
          </div>
        </div>

        {/* Right: Narrative & Extension Integration */}
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#c4a962]/40 bg-[#0d3d47]/80 px-3 py-1 text-xs font-semibold text-[#c4a962]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Invitación & Extensión Complementaria</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f5f0e8]">
            Casa de los Pájaros
            <span className="block text-lg font-light text-[#c4a962] mt-1">
              Un alto contemplativo con la obra del artista Walpac
            </span>
          </h2>

          <p className="text-sm text-[#e8e2d6] leading-relaxed">
            Como cierre enriquecedor del circuito histórico, te invitamos a una experiencia que cambia el ritmo caminado por un momento de contemplación sensorial: la visita a la obra y taller del artista <strong>Walpac</strong>, en alianza activa con MOXOTORO.
          </p>

          <div className="rounded-xl border border-white/10 bg-[#0a0a0a]/50 p-4 space-y-2 text-xs text-[#9ca3af]">
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Diferente en ritmo y lenguaje:</strong> Diálogo directo sobre las coplas caldereñas, el canto de las aves nativas y la cosmovisión del Valle de Siancas.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Vinculación directa:</strong> Podés sumar esta extensión a tu reserva del Camino Real por sólo <strong>+{walpacConfig.priceUsdc} USDC</strong> (${walpacConfig.priceArs.toLocaleString("es-AR")} ARS) por persona.
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenBookingWithWalpac}
              className="flex items-center gap-2 rounded-lg bg-[#c4a962] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#0a0a0a] hover:bg-[#dfc888] transition-colors shadow-lg"
            >
              <HeartHandshake className="h-4 w-4" />
              <span>Sumar esta Extensión a mi Reserva</span>
            </button>

            <button
              onClick={onFocusMap}
              className="flex items-center gap-2 rounded-lg border border-[#c4a962]/40 bg-[#0d1b2a] px-4 py-2.5 text-xs font-medium text-[#e8e2d6] hover:text-[#c4a962] hover:border-[#c4a962] transition-colors"
            >
              <Eye className="h-4 w-4 text-[#c4a962]" />
              <span>Ubicar en el Mapa</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
