import type { Metadata } from "next";
import { DigitalCard } from "@/components/tarjeta/DigitalCard";
import { parseAllianceRef } from "@/lib/tarjeta";

export const metadata: Metadata = {
  metadataBase: new URL("https://moxotoro.vercel.app"),
  title: "Mariana Mamaní — Tarjeta MOXOTORO",
  description:
    "Tarjeta de Mariana Mamaní, turismo patrimonial de Magnami Experience y MOXOTORO en La Caldera, Salta. Reservá el Camino Real por WhatsApp.",
  alternates: {
    canonical: "/tarjeta",
  },
  openGraph: {
    title: "Mariana Mamaní — MOXOTORO",
    description: "Turismo patrimonial en La Caldera. Tocá la tarjeta y reservá el Camino Real.",
    url: "/tarjeta",
    images: ["/assets/circuits/banner-caldera.webp"],
  },
};

type TarjetaPageProps = {
  searchParams: Promise<{ ref?: string | string[] }>;
};

export default async function TarjetaPage({ searchParams }: TarjetaPageProps) {
  const params = await searchParams;
  const allianceRef = parseAllianceRef(params.ref);

  return <DigitalCard allianceRef={allianceRef} />;
}
