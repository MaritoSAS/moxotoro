import Image from "next/image";
import { Reveal } from "@/components/home/Reveal";

export function AnfitrionaSection() {
  return (
    <section
      id="anfitriona"
      className="scroll-mt-36 border-b border-[#c4a962]/15 bg-[#0d1b2a]/35"
    >
      <div className="mx-auto grid max-w-7xl items-start gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-12 lg:gap-16 lg:px-8 lg:py-24">
        <Reveal className="lg:col-span-5">
          <figure>
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-[#c4a962]/30 bg-[#0d3d47] shadow-2xl shadow-black/40">
              <Image
                src="/anfitriona.webp"
                alt="Mariana Raquel Mamani, anfitriona y creadora de MOXOTORO"
                fill
                sizes="(min-width: 1024px) 38vw, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-4">
              <p className="text-sm font-semibold text-[#f5f0e8]">Mariana Raquel Mamani</p>
              <p className="text-xs text-[#9ca3af]">Anfitriona · La Caldera, Salta</p>
            </figcaption>
          </figure>
        </Reveal>

        <div className="lg:col-span-7">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#c4a962]">
              La anfitriona
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#f5f0e8] sm:text-4xl">
              Mariana Raquel Mamani
            </h2>
            <p className="mt-4 text-base font-medium leading-relaxed text-[#e8e2d6] sm:text-lg">
              Nacida en La Caldera, Salta. Anfitriona, emprendedora y creadora de experiencias.
            </p>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-[#e8e2d6] sm:text-base">
              <p>MOXOTORO nace desde un vínculo real con el territorio.</p>
              <p>
                Soy Mariana Raquel Mamani y quiero compartir La Caldera desde una mirada cercana:
                sus paisajes, sus caminos, su historia, su cultura y esas experiencias auténticas
                que muchas veces solo pueden descubrirse cuando alguien que conoce y vive el lugar
                te abre la puerta.
              </p>
              <p>
                Durante años fui construyendo una relación con mi territorio y con las personas que
                lo hacen posible. De allí nace la idea de crear una red que conecte visitantes con
                guías, prestadores, artesanos, productores, gastronomía y experiencias locales.
              </p>
            </div>
          </Reveal>

          <Reveal delayMs={80} className="mt-8">
            <div className="rounded-2xl border border-[#c4a962]/40 bg-[#0d3d47]/55 p-5 sm:p-7">
              <h3 className="text-xl font-semibold text-[#f5f0e8] sm:text-2xl">¿Por qué Magnami?</h3>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-[#e8e2d6] sm:text-base">
                <p>
                  <strong className="font-semibold text-[#f5f0e8]">Magnami Experience</strong> fue
                  el nombre con el que comenzó este camino.
                </p>
                <p>
                  Magnami representa la identidad desde la cual empecé a crear y comunicar
                  experiencias en La Caldera. En lo Magno de los Caminos y en mi apellido Mamani,
                  &quot;Ave que vigila desde lo alto, Mamani Guardián de los caminos del imperio
                  Incaico&quot;, nació Magnami Experiencias. Es parte de la historia del proyecto y
                  de una etapa que hoy evoluciona hacia MOXOTORO.
                </p>
                <p className="border-l-2 border-[#c4a962] pl-4 text-lg font-semibold leading-snug text-[#f5f0e8] sm:text-xl">
                  MOXOTORO no borra esa historia: la continúa.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delayMs={140} className="mt-8">
            <div className="space-y-4 text-sm leading-relaxed text-[#e8e2d6] sm:text-base">
              <p>
                Hoy MOXOTORO busca ir más allá de una experiencia turística individual: propone
                construir una <strong className="font-semibold text-[#f5f0e8]">red de destinos emergentes</strong>,
                conectando territorio, comunidad, tecnología y nuevas formas de acceder a
                experiencias locales.
              </p>
              <p>Porque detrás de cada camino hay personas.</p>
              <p>Y detrás de cada destino, una historia que merece ser conocida.</p>
              <p className="pt-2 text-base font-semibold text-[#c4a962] sm:text-lg">
                Descubrí La Caldera de la mano de alguien que la conoce y la vive.
              </p>
              <p className="text-[#f5f0e8]">
                <strong className="font-semibold">Mariana Raquel Mamani</strong>
                <span className="mt-1 block text-sm font-normal text-[#9ca3af]">
                  Anfitriona y creadora de MOXOTORO
                </span>
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
