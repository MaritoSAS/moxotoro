import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { MOXOTORO_CONFIG } from "@/config/moxotoro.config";
import { buildTarjetaWhatsAppUrl } from "@/lib/tarjeta";

type DigitalCardProps = {
  allianceRef: string | null;
};

const VALUE_PROP =
  "Recorrido guiado por el Camino Real en La Caldera: el valle, sus historias y tiempo para mirar.";

const VENUE_NOTE = "Dejá esta tarjeta en recepción — el visitante toca y reserva";

export function DigitalCard({ allianceRef }: DigitalCardProps) {
  const { brand, founder, contact } = MOXOTORO_CONFIG;
  const whatsAppUrl = buildTarjetaWhatsAppUrl(allianceRef);

  return (
    <main className="relative flex min-h-dvh flex-col items-center bg-moxo-black px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:justify-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(196,169,98,0.18),transparent_58%)]"
      />

      <article className="relative w-full max-w-md overflow-hidden rounded-3xl border border-moxo-gold/35 bg-moxo-navy shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
        <div className="relative h-44 w-full">
          <Image
            src="/assets/circuits/banner-caldera.webp"
            alt="Paisaje del valle de La Caldera, Salta"
            fill
            priority
            sizes="(max-width: 448px) 100vw, 448px"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-moxo-navy from-0% via-moxo-navy/75 via-45% to-moxo-black/20" />
          <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-moxo-gold/40 bg-moxo-black/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-moxo-gold-light">
            <ChakanaMark className="h-3.5 w-3.5" />
            Tarjeta
          </div>
          <p className="absolute bottom-4 left-5 text-sm font-medium tracking-wide text-moxo-cream drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {brand.destination}
          </p>
        </div>

        <div className="space-y-5 px-5 pb-6 pt-5">
          <header className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-moxo-gold">
              {brand.name}
            </p>
            <h1 className="text-[1.75rem] font-semibold leading-tight tracking-tight text-moxo-cream">
              {founder.name}
            </h1>
            <p className="text-sm leading-snug text-moxo-gold-light">
              {founder.role} · {brand.historicalName} · {brand.name}
            </p>
            <p className="text-xs text-moxo-ivory">{brand.legalEntity}</p>
          </header>

          <p className="text-base leading-relaxed text-moxo-ivory">{VALUE_PROP}</p>

          <div className="flex flex-col gap-3">
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-moxo-gold px-4 py-3 text-center text-base font-semibold text-moxo-black transition-colors hover:bg-moxo-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moxo-gold-light focus-visible:ring-offset-2 focus-visible:ring-offset-moxo-navy active:scale-[0.99]"
            >
              <ChatIcon />
              Reservá o preguntá por WhatsApp
            </a>
            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-moxo-gold/45 bg-moxo-black/40 px-4 py-3 text-center text-base font-medium text-moxo-cream transition-colors hover:border-moxo-gold hover:text-moxo-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moxo-gold focus-visible:ring-offset-2 focus-visible:ring-offset-moxo-navy active:scale-[0.99]"
            >
              Ver la experiencia completa
            </Link>
          </div>

          <ul className="grid grid-cols-3 gap-2">
            <li>
              <SocialLink href={contact.instagramUrl} label="Instagram" handle={contact.instagramHandle}>
                <InstagramIcon />
              </SocialLink>
            </li>
            <li>
              <SocialLink href={contact.xUrl} label="X" handle={contact.xHandle}>
                <XIcon />
              </SocialLink>
            </li>
            <li>
              <SocialLink href={contact.linkedInUrl} label="LinkedIn" handle={founder.name}>
                <LinkedInIcon />
              </SocialLink>
            </li>
          </ul>

          <footer className="space-y-2 border-t border-moxo-gold/20 pt-4">
            {allianceRef ? (
              <p className="text-center text-sm text-moxo-gold-light">
                <span className="text-moxo-ivory/70">Alianza · </span>
                <span className="break-words">{allianceRef}</span>
              </p>
            ) : null}
            <p className="text-center text-xs leading-relaxed text-moxo-ivory/75">{VENUE_NOTE}</p>
          </footer>
        </div>
      </article>
    </main>
  );
}

function SocialLink({
  href,
  label,
  handle,
  children,
}: {
  href: string;
  label: string;
  handle: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label}, ${handle}`}
      className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl border border-white/10 bg-moxo-black/50 px-2 py-2 text-moxo-cream transition-colors hover:border-moxo-gold/60 hover:text-moxo-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moxo-gold focus-visible:ring-offset-2 focus-visible:ring-offset-moxo-navy"
    >
      {children}
      <span className="text-[11px] font-medium leading-none">{label}</span>
    </a>
  );
}

function ChakanaMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M9 2h6v4h4v6h-4v4h-6v-4H5v-6h4V2zm1 2v4H6v2h4v4h4v-4h4v-2h-4V4h-4z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17.5 4 20v-4.2A8 8 0 1 1 8.2 19.6L7 17.5Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M14.7 10.3 22.4 2h-1.8l-6.7 7.2L8.2 2H2l8.1 11.1L2 22h1.8l7.1-7.6L15.8 22H22l-7.3-11.7Zm-2.5 2.7-.8-1.1L4.6 3.3h2.8l5.2 7 .8 1.1 6.8 9.3h-2.8l-5.2-7.1Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M4.7 3.3a2.2 2.2 0 1 0 .1 4.4 2.2 2.2 0 0 0-.1-4.4ZM3 9h3.4v12H3V9Zm6.2 0H12.5v1.6h.05c.46-.87 1.58-1.79 3.25-1.79 3.48 0 4.12 2.29 4.12 5.27V21H16.5v-5.35c0-1.28-.02-2.92-1.78-2.92-1.78 0-2.05 1.39-2.05 2.83V21H9.2V9Z" />
    </svg>
  );
}
