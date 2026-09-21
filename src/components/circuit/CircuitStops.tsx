"use client";

import React from "react";
import { CircuitStop } from "@/types/moxotoro";
import { Clock, Mountain, ArrowRight } from "lucide-react";

interface CircuitStopsProps {
  stops: CircuitStop[];
  selectedStopId: string | null;
  onSelectStop: (stop: CircuitStop) => void;
}

export const CircuitStops: React.FC<CircuitStopsProps> = ({
  stops,
  selectedStopId,
  onSelectStop,
}) => {
  // Main official 5 stops of Camino Real
  const officialStops = stops.filter((s) => !s.isComplementary);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#c4a962]/20">
        <div>
          <h3 className="font-bold text-lg text-[#f5f0e8] tracking-wide">
            Las 5 Paradas del Camino Real
          </h3>
          <p className="text-xs text-[#9ca3af]">
            Recorrido guiado a ritmo caminado bajo normas IRAM-SECTUR (1,5 a 2 horas)
          </p>
        </div>
        <span className="rounded-full bg-[#0d3d47] px-3 py-1 text-xs font-medium text-[#c4a962] border border-[#c4a962]/30">
          5 Hitos Patrimoniales
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
        {officialStops.map((stop) => {
          const isSelected = selectedStopId === stop.id;
          return (
            <div
              key={stop.id}
              onClick={() => onSelectStop(stop)}
              className={`group cursor-pointer rounded-xl border p-3.5 transition-all duration-300 relative flex flex-col justify-between ${
                isSelected
                  ? "border-[#c4a962] bg-[#0d3d47]/80 shadow-lg shadow-[#c4a962]/10 scale-[1.02]"
                  : "border-white/10 bg-[#0d1b2a]/60 hover:border-[#c4a962]/50 hover:bg-[#0d3d47]/40"
              }`}
            >
              {/* Top order pill */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    isSelected
                      ? "bg-[#c4a962] text-[#0a0a0a]"
                      : "bg-[#0a0a0a] text-[#c4a962] border border-[#c4a962]/40"
                  }`}
                >
                  {stop.order}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-[#9ca3af]">
                  <Clock className="h-3 w-3 text-[#c4a962]" />
                  <span>{stop.duration}</span>
                </span>
              </div>

              {/* Stop image */}
              <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden border border-white/10 mb-2.5">
                <img
                  src={stop.image}
                  alt={stop.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/80 via-transparent to-transparent" />
                <span className="absolute bottom-1.5 left-2 flex items-center gap-1 text-[10px] font-medium text-[#e8e2d6]">
                  <Mountain className="h-3 w-3 text-[#c4a962]" />
                  {stop.elevation}
                </span>
              </div>

              {/* Title & subtitle */}
              <div>
                <h4 className="font-semibold text-xs text-[#f5f0e8] group-hover:text-[#c4a962] transition-colors line-clamp-1">
                  {stop.name}
                </h4>
                <p className="text-[11px] text-[#c4a962] font-medium mt-0.5 line-clamp-1">
                  {stop.subtitle}
                </p>
                <p className="mt-1 text-[11px] text-[#9ca3af] line-clamp-2 leading-relaxed">
                  {stop.description}
                </p>
              </div>

              {/* Bottom focus indicator */}
              <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                <span className="text-[#9ca3af] group-hover:text-[#f5f0e8] transition-colors">
                  {isSelected ? "Visualizando en mapa" : "Ver en mapa"}
                </span>
                <ArrowRight
                  className={`h-3 w-3 transition-transform ${
                    isSelected ? "text-[#c4a962] translate-x-1" : "text-[#9ca3af] group-hover:translate-x-0.5"
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
