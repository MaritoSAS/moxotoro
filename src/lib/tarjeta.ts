import { MOXOTORO_CONFIG } from "@/config/moxotoro.config";

/** Hotel or partner name printed on an NFC card via ?ref= */
const ALLIANCE_REF_MAX_LENGTH = 64;

/**
 * Keeps a short, readable alliance label from the NFC query.
 * Drops control characters and symbols that would not belong in a venue name.
 */
export function parseAllianceRef(raw: string | string[] | undefined): string | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== "string") return null;

  const cleaned = value
    .normalize("NFKC")
    .replace(/[\u0000-\u001F\u007F\u200B-\u200D\uFEFF]/g, "")
    .replace(/[^\p{L}\p{N}\s.'’&-]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, ALLIANCE_REF_MAX_LENGTH);

  if (!cleaned || !/[\p{L}\p{N}]/u.test(cleaned)) return null;
  return cleaned;
}

/** WhatsApp chat for the card. The alliance name rides along for tracking — no backend. */
export function buildTarjetaWhatsAppUrl(allianceRef: string | null): string {
  const { greetingName } = MOXOTORO_CONFIG.founder;
  const lines = [
    `Hola ${greetingName}, quiero reservar o consultar el Camino Real en La Caldera.`,
  ];

  if (allianceRef) {
    lines.push(`Alianza: ${allianceRef}`);
  }

  const text = encodeURIComponent(lines.join("\n"));
  const base = MOXOTORO_CONFIG.contact.whatsAppDirectUrl;
  const joiner = base.includes("?") ? "&" : "?";
  return `${base}${joiner}text=${text}`;
}
