"use client";

import React, { useState } from "react";
import { Calendar, MessageCircle, Menu, X } from "lucide-react";
import { MOXOTORO_CONFIG } from "@/config/moxotoro.config";

interface NavbarProps {
  onOpenBooking: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenBooking }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#c4a962]/20 bg-[#0a0a0a]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo & Tagline */}
        <a href="#" className="flex items-center gap-3 group">
          {/* Chakana / Sun Vector Icon */}
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#c4a962]/40 bg-[#0d3d47]/50 shadow-inner group-hover:border-[#c4a962] transition-colors">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#c4a962]" fill="currentColor">
              <path d="M9 2h6v4h4v6h-4v4h-6v-4H5v-6h4V2zm1 2v4H6v2h4v4h4v-4h4v-2h-4V4h-4z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-widest text-lg text-[#f5f0e8] group-hover:text-[#c4a962] transition-colors">
                {MOXOTORO_CONFIG.brand.name}
              </span>
              <span className="rounded bg-[#c4a962]/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#c4a962]">
                Salta
              </span>
            </div>
            <span className="text-[10px] text-[#9ca3af] tracking-tight">
              {MOXOTORO_CONFIG.brand.destination}
            </span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="#circuito" className="text-[#e8e2d6] hover:text-[#c4a962] transition-colors">
            Circuito Camino Real
          </a>
          <a href="#mapa" className="text-[#e8e2d6] hover:text-[#c4a962] transition-colors">
            Mapa Interactivo
          </a>
          <a href="#walpac" className="text-[#e8e2d6] hover:text-[#c4a962] transition-colors flex items-center gap-1">
            <span>Casa de los Pájaros</span>
            <span className="text-[9px] bg-[#0d3d47] text-[#c4a962] px-1 rounded">Extensión</span>
          </a>
          <a href="#politica" className="text-[#e8e2d6] hover:text-[#c4a962] transition-colors">
            Señas y Protocolo Clima
          </a>
          <a href="#stellar" className="text-[#c4a962] hover:text-[#dfc888] transition-colors font-medium flex items-center gap-1">
            <span>Stellar ABC</span>
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href={MOXOTORO_CONFIG.contact.whatsAppDirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-3 py-2 text-xs font-medium text-emerald-300 hover:bg-emerald-900/50 transition-colors"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span>WhatsApp</span>
          </a>

          <button
            onClick={onOpenBooking}
            className="flex items-center gap-2 rounded-lg bg-[#c4a962] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#0a0a0a] shadow-lg hover:bg-[#dfc888] transition-all transform active:scale-95"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Reservar con Seña</span>
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden rounded-lg p-2 text-[#e8e2d6] hover:bg-[#0d3d47]/40"
          aria-label="Abrir menú"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#c4a962]/20 bg-[#0d1b2a] px-4 py-4 space-y-3">
          <a
            href="#circuito"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-[#e8e2d6] hover:text-[#c4a962]"
          >
            Circuito Camino Real
          </a>
          <a
            href="#mapa"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-[#e8e2d6] hover:text-[#c4a962]"
          >
            Mapa Interactivo
          </a>
          <a
            href="#walpac"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-[#e8e2d6] hover:text-[#c4a962]"
          >
            Casa de los Pájaros (Extensión)
          </a>
          <a
            href="#politica"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-[#e8e2d6] hover:text-[#c4a962]"
          >
            Señas y Protocolo Clima
          </a>
          <a
            href="#stellar"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-[#c4a962]"
          >
            Stellar Builder Challenge
          </a>
          <div className="pt-3 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full rounded-lg bg-[#c4a962] py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-[#0a0a0a]"
            >
              Reservar con Seña (50%)
            </button>
            <a
              href={MOXOTORO_CONFIG.contact.whatsAppDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center rounded-lg border border-emerald-500/30 bg-emerald-950/40 py-2 text-xs font-medium text-emerald-300"
            >
              Consultas por WhatsApp
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
