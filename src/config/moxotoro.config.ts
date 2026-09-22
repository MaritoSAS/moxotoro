/**
 * MOXOTORO — Configuración Centralizada de Negocio y Operaciones
 * Reglas de negocio desacopladas y parametrizadas para reservas, cupos, seña y protocolo climático.
 */

export interface PricingOption {
  id: string;
  title: string;
  description: string;
  priceUsdc: number;
  priceArs: number;
  includesTransport: boolean;
}

export const MOXOTORO_CONFIG = {
  brand: {
    name: "MOXOTORO",
    historicalName: "Magnami Experience",
    tagline: "Donde cada camino cuenta una historia",
    destination: "La Caldera · Salta · Argentina",
    ancestralOrigin: "Qhapaq Ñan — Guardianes del Camino",
    institutionalResolution: "Resolución Nº 216/17 Ministerio de Turismo y Deportes de Salta",
    standards: "Normas IRAM-SECTUR / ISO 9001",
    partnerArtist: "Walpac (Casa de los Pájaros)",
    legalEntity: "Grupo Marito S.A.S.",
  },

  founder: {
    name: "Mariana Mamaní",
    greetingName: "Mariana",
    role: "Turismo patrimonial",
  },

  pricing: {
    // Tarifas de referencia aprobadas
    options: [
      {
        id: "with-transport",
        title: "Experiencia Completa con Transporte",
        description: "Incluye traslado ida y vuelta desde la ciudad de Salta hasta La Caldera, guiado patrimonial, agua y refrigerio.",
        priceUsdc: 31,
        priceArs: 31000,
        includesTransport: true,
      },
      {
        id: "without-transport",
        title: "Experiencia sin Traslado (Punto de Encuentro)",
        description: "Punto de encuentro directo en La Caldera (Paseo Costanera). Incluye guiado patrimonial de 5 paradas y refrigerio.",
        priceUsdc: 15,
        priceArs: 15000,
        includesTransport: false,
      },
    ] as PricingOption[],

    // Seña: configurable inicialmente en 50%
    depositPercentage: 50,
    allowFullPayment: true,
    arsUsdRate: 1000, // Tasa referencial para cálculos en pesos

    // Experiencia complementaria Casa de los Pájaros (Walpac)
    walpacAddon: {
      id: "walpac-extension",
      title: "Extensión Contemplativa: Casa de los Pájaros (Taller Walpac)",
      description: "Visita al taller y murales del artista Walpac al cierre del circuito. Incluye momento de contemplación y encuentro con el artista.",
      priceUsdc: 5,
      priceArs: 5000,
    },
  },

  capacity: {
    minParticipantsToConfirm: 4,     // Mínimo de 4 participantes para confirmar salida
    standardMaxParticipants: 10,     // Cupo estándar por turno
    allowContingents: true,          // Habilitado para contingentes mayores previa coordinación
    contingentMaxParticipants: 25,
    cutoffHourPreviousDay: 20,       // Cierre de reservas a las 20:00 hs del día anterior
    timeSlots: [
      { id: "slot-morning", label: "Turno Mañana (09:30 - 11:30 hs)", departureTime: "09:30" },
      { id: "slot-afternoon", label: "Turno Tarde (16:00 - 18:00 hs)", departureTime: "16:00" },
    ],
  },

  policies: {
    depositRule: {
      isNonRefundable: true,
      summary: "La seña confirma tu lugar y no es reembolsable para cancelaciones ordinarias.",
      fullNotice:
        "La seña abonada garantiza la disponibilidad de guías y logística de la salida. No se reintegrará en caso de inasistencia, cambios de planes o cancelaciones voluntarias del participante.",
    },

    weatherProtocol: {
      title: "Protocolo de Excepción por Condiciones Climáticas Adversas",
      description:
        "La única situación excepcional contemplada para modificar las condiciones de la reserva es la suspensión de la actividad por lluvias torrenciales o alertas meteorológicas que impidan la seguridad del circuito.",
      steps: [
        {
          step: 1,
          title: "Reasignación de Turno (Prioridad 1)",
          action: "Se ofrece una nueva fecha u horario disponible conservando el 100% de la seña aplicada a la nueva salida.",
        },
        {
          step: 2,
          title: "Oferta de Experiencia Alternativa (Prioridad 2)",
          action: "Si no es posible coincidir en una nueva fecha, se ofrece una experiencia en espacio cubierto (visita cultural al taller de Walpac, degustación tradicional o masterclass de alfarería).",
        },
        {
          step: 3,
          title: "Devolución Excepcional de Seña (Último Recurso)",
          action: "Únicamente en caso de haber agotado las instancias 1 y 2 sin acuerdo razonable, se procede al reembolso documentado de la seña.",
        },
      ],
    },
  },

  stellar: {
    network: "TESTNET", // 'TESTNET' | 'PUBLIC'
    horizonUrl: "https://horizon-testnet.stellar.org",
    assetCode: "USDC",
    // Cuenta pública de Moxotoro para recepción en Testnet
    receiverPublicKey: "GC4PXOQZQL4K6I35T75S74W5M5VUXMQUJFX34H2PFLX7K7D2P4J3BMOX",
    memoPrefix: "MOXO-",
  },

  contact: {
    whatsAppNumber: "+5493874624947",
    whatsAppDirectUrl: "https://wa.me/5493874624947",
    instagramHandle: "@magnamiexperience",
    instagramUrl: "https://www.instagram.com/magnamiexperience",
    xHandle: "@Andinativas",
    xUrl: "https://x.com/Andinativas",
    linkedInUrl: "https://www.linkedin.com/in/marianamamani",
  },
};
