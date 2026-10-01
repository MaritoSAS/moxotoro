"use client";

import Image from "next/image";
import { Wallet } from "lucide-react";
import { Reveal } from "@/components/home/Reveal";

type ImmersiveHeroProps = {
  onOpenBooking: () => void;
};

export function ImmersiveHero({ onOpenBooking }: ImmersiveHeroProps) {
  return (
    <section
      aria-label="La Caldera"
      className="relative flex min-h-[max(34rem,calc(100svh-9rem))] items-end overflow-hidden border-b border-[#c4a962]/20"
    >
      <div className="hero-kenburns absolute inset-0">
        <Image
          src="/hero-la-caldera.webp"
          alt="Cerros verdes y montañas de La Caldera, Salta"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_46%]"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/72 to-[#0d1b2a]/35" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/55 via-[#0a0a0a]/15 to-transparent" />

      <Reveal className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-12 pt-16 sm:px-6 sm:pb-16 lg:px-8 lg:pb-20">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#c4a962]">
          La Caldera · Salta
        </p>
        <h1 className="mt-4 max-w-4xl text-[2.05rem] font-bold leading-[1.08] tracking-tight text-[#f5f0e8] sm:text-5xl lg:text-[3.5rem]">
          Descubrí La Caldera de la mano de quien la vive
        </h1>
        <p className="mt-4 max-w-xl text-base font-light leading-relaxed text-[#e8e2d6] sm:text-xl">
          Experiencias auténticas en el Camino Real, Salta.
        </p>
        <button
          type="button"
          onClick={onOpenBooking}
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#c4a962] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#0a0a0a] shadow-lg hover:bg-[#dfc888]"
        >
          <Wallet className="h-4 w-4" />
          Reservar salida
        </button>
      </Reveal>
    </section>
  );
}
