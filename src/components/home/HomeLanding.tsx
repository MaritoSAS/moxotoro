"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { CalendarDays, MapPin, Sparkles } from "lucide-react";
import { CircuitStop } from "@/types/moxotoro";
import { MOXOTORO_CONFIG } from "@/config/moxotoro.config";
import { Navbar } from "@/components/ui/Navbar";
import { CircuitStops } from "@/components/circuit/CircuitStops";
import { WalpacExtension } from "@/components/circuit/WalpacExtension";
import { WeatherPolicySection } from "@/components/policy/WeatherPolicySection";
import { ReservationForm } from "@/components/booking/ReservationForm";
import geojsonData from "@/data/camino_real.json";

const MapViewer = dynamic(
  () => import("@/components/map/MapViewer").then((mod) => ({ default: mod.MapViewer })),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-[520px] rounded-2xl border border-[#c4a962]/30 bg-[#0d1b2a]"
        aria-hidden="true"
      />
    ),
  },
);

type GeoStopFeature = {
  properties: {
    type: string;
    id: string;
    order: number;
    name: string;
    subtitle: string;
    description: string;
    duration: string;
    elevation: string;
    image: string;
    isComplementary: boolean;
  };
  geometry: { coordinates: [number, number] };
};

const circuitStops: CircuitStop[] = (geojsonData.features as unknown as GeoStopFeature[])
  .filter((feature) => feature.properties.type === "stop")
  .map((feature) => ({
    id: feature.properties.id,
    order: feature.properties.order,
    name: feature.properties.name,
    subtitle: feature.properties.subtitle,
    description: feature.properties.description,
    duration: feature.properties.duration,
    elevation: feature.properties.elevation,
    image: feature.properties.image,
    isComplementary: feature.properties.isComplementary,
    coordinates: feature.geometry.coordinates,
  }));

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export const HomeLanding: React.FC = () => {
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [includeWalpac, setIncludeWalpac] = useState(false);

  const openBooking = (withWalpac = false) => {
    if (withWalpac) setIncludeWalpac(true);
    scrollToId("reservar");
  };

  const handleSelectStop = (stop: CircuitStop) => {
    setSelectedStopId(stop.id);
    if (stop.isComplementary) {
      scrollToId("mapa");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar onOpenBooking={() => openBooking(false)} />

      <section className="relative overflow-hidden border-b border-[#c4a962]/20">
        <img
          src="/assets/circuits/banner-caldera.webp"
          alt="Valle de La Caldera, Salta"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-[#0a0a0a]/30" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#c4a962]/40 bg-[#0d3d47]/70 px-3 py-1 text-xs font-semibold text-[#c4a962]">
            <Sparkles className="h-3.5 w-3.5" />
            {MOXOTORO_CONFIG.brand.ancestralOrigin}
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-[#f5f0e8] sm:text-5xl">
            {MOXOTORO_CONFIG.brand.name}
            <span className="mt-2 block text-xl font-light text-[#c4a962] sm:text-2xl">
              {MOXOTORO_CONFIG.brand.tagline}
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#e8e2d6] sm:text-base">
            Circuito guiado Camino Real / Qhapaq Ñan en {MOXOTORO_CONFIG.brand.destination}. Seña
            del {MOXOTORO_CONFIG.pricing.depositPercentage}% en Stellar USDC y cupos con cierre a las{" "}
            {MOXOTORO_CONFIG.capacity.cutoffHourPreviousDay}:00 del día anterior.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#reservar"
              className="inline-flex items-center gap-2 rounded-lg bg-[#c4a962] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#0a0a0a] hover:bg-[#dfc888]"
            >
              <CalendarDays className="h-4 w-4" />
              Reservá tu salida
            </a>
            <a
              href="#circuito"
              className="inline-flex items-center gap-2 rounded-lg border border-[#c4a962]/40 px-5 py-2.5 text-xs font-medium text-[#e8e2d6] hover:text-[#c4a962]"
            >
              <MapPin className="h-4 w-4 text-[#c4a962]" />
              Ver el circuito
            </a>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl space-y-16 px-4 py-12 sm:px-6 lg:px-8">
        <section id="circuito" className="scroll-mt-24">
          <CircuitStops
            stops={circuitStops}
            selectedStopId={selectedStopId}
            onSelectStop={handleSelectStop}
          />
        </section>

        <section id="mapa" className="scroll-mt-24 space-y-3">
          <h2 className="text-2xl font-bold text-[#f5f0e8]">Mapa Interactivo</h2>
          <p className="text-sm text-[#9ca3af]">
            Las 5 paradas oficiales y la extensión Casa de los Pájaros sobre la traza del Camino Real.
          </p>
          <MapViewer selectedStopId={selectedStopId} onSelectStop={handleSelectStop} />
        </section>

        <WalpacExtension
          onFocusMap={() => {
            setSelectedStopId("stop-walpac");
            scrollToId("mapa");
          }}
          onOpenBookingWithWalpac={() => openBooking(true)}
        />

        <section
          id="reservar"
          className="scroll-mt-24 rounded-2xl border border-[#c4a962]/40 bg-gradient-to-br from-[#0d1b2a] via-[#0d3d47]/40 to-[#0a0a0a] p-6 sm:p-8 space-y-6 shadow-2xl"
        >
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#c4a962]">
              <CalendarDays className="h-4 w-4" />
              Reservas con seña
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-[#f5f0e8]">Reservá tu salida</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#9ca3af]">
              Elegí el día en el calendario, el turno mañana o tarde, y pagá la seña en Stellar USDC.
              Los días no disponibles quedan atenuados: el cupo cierra a las{" "}
              {MOXOTORO_CONFIG.capacity.cutoffHourPreviousDay}:00 del día anterior (hora Argentina).
            </p>
          </div>
          <ReservationForm includeWalpac={includeWalpac} onIncludeWalpacChange={setIncludeWalpac} />
        </section>

        <WeatherPolicySection />

        <section
          id="stellar"
          className="scroll-mt-24 rounded-2xl border border-white/10 bg-[#0d1b2a]/90 p-6 sm:p-8 space-y-3"
        >
          <h2 className="text-2xl font-bold text-[#f5f0e8]">Stellar ABC</h2>
          <p className="text-sm leading-relaxed text-[#9ca3af] max-w-3xl">
            El checkout genera un pago SEP-0007 en {MOXOTORO_CONFIG.stellar.network} con memo único
            ({MOXOTORO_CONFIG.stellar.memoPrefix}…) para acreditar la seña en USDC. Podés verificar la
            transacción en Horizon o simular la confirmación en la demo del challenge.
          </p>
        </section>
      </main>

      <footer className="border-t border-[#c4a962]/20 py-8 text-center text-xs text-[#9ca3af]">
        {MOXOTORO_CONFIG.brand.name} · {MOXOTORO_CONFIG.brand.legalEntity} ·{" "}
        {MOXOTORO_CONFIG.brand.destination}
      </footer>
    </div>
  );
};
