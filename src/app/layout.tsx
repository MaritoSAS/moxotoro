import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MOXOTORO — Experiencias Soberanas y Turismo Inteligente",
  description: "Plataforma de turismo consciente y circuitos patrimoniales en La Caldera, Salta. Donde cada camino cuenta una historia.",
  keywords: ["Moxotoro", "La Caldera", "Salta", "Camino Real", "Qhapaq Ñan", "Turismo", "Walpac", "Stellar", "TravelTech"],
  openGraph: {
    title: "MOXOTORO — Donde cada camino cuenta una historia",
    description: "Circuitos patrimoniales y experiencias auténticas en La Caldera, Salta.",
    images: ["/assets/circuits/camino-real-valle.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#0a0a0a] text-[#f5f0e8] antialiased selection:bg-[#c4a962] selection:text-[#0a0a0a]">
        {children}
      </body>
    </html>
  );
}
