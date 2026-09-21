# MOXOTORO

Experiencia turística patrimonial en La Caldera (Salta, Argentina) — *Magnami Experience*.
Proyecto para el **Argentina Builder Challenge (BAF × Stellar)**.

## Problema

Reservar y cobrar una experiencia guiada (circuito Camino Real / Qhapaq Ñan) con seña clara, cupos y protocolo climático, sin fricción de cobro internacional/local.

## Solución (esqueleto Checkpoint 2)

App Next.js para:
- Mostrar el circuito y paradas (mapa + GeoJSON)
- Tarifas en USDC / ARS, seña configurable y extensión Walpac
- Checkout on-chain con **Stellar** (SEP-0007 + verificación por memo en Horizon testnet)
- Políticas de seña y clima documentadas en producto
- Reserva en home con **calendario mensual visible** (español Argentina) y turnos mañana/tarde

## Stack

- Next.js 16 + React 19 + TypeScript + Tailwind
- `@stellar/stellar-sdk` (Horizon testnet, USDC)
- MapLibre GL

## Estado actual (Checkpoint 2 · 21/09)

| Área | Estado |
|------|--------|
| Config de negocio (precios, cupos, políticas) | Listo |
| Integración Stellar (SEP-0007 + verify memo) | Listo en `src/lib/stellar.ts` |
| Componentes (mapa, checkout, circuito, clima) | En `src/components/` |
| UI principal cableada | Home compone hero, circuito, mapa, tarifas, Walpac, seña USDC y protocolo climático |
| Calendario de reserva | Visible en `#reservar` (no `input type="date"`) |
| Deploy testnet público | Pendiente |

## Reserva

La sección **Reservá tu salida** (`#reservar`) muestra un mes completo (lunes–domingo, mes en español) junto al selector de turno mañana/tarde. Los días anteriores al mínimo de `getMinBookingDate()` — cierre a las `MOXOTORO_CONFIG.capacity.cutoffHourPreviousDay` (20:00) del día previo, hora Argentina — quedan deshabilitados. Elegir fecha + turno y confirmar abre el checkout de seña en Stellar.

## Cómo correr

```bash
npm install
npm run dev
```

Abrí http://localhost:3000

Build de verificación:

```bash
npm run build
```

## Qué muestra la home

La ruta `/` deja de ser Hello World y arma el esqueleto de producto de punta a punta:

1. **Hero de marca** — MOXOTORO, tagline, destino La Caldera y datos de seña / cupo / red.
2. **Circuito Camino Real** — las 5 paradas oficiales (`CircuitStops` + GeoJSON).
3. **Mapa interactivo** — MapLibre con la traza `src/data/camino_real.geojson`.
4. **Extensión Walpac** — Casa de los Pájaros como addon de reserva.
5. **Tarifas y checkout** — opciones con/sin traslado, **calendario mensual visible** (`#reservar`, lunes–domingo en español) y `StellarCheckoutModal` para pagar la seña en USDC (SEP-0007, QR, memo, verificación Horizon).
6. **Política de seña y clima** — protocolo de 3 instancias con simulador de estados.

Copy de la UI en español (Argentina). Pagos configurados **solo en TESTNET** (`src/config/moxotoro.config.ts`). No hay claves de mainnet ni secretos en el repo: la cuenta receptora es una clave pública de prueba.

## Stellar

- Red: **TESTNET**
- Asset: USDC
- Config: `src/config/moxotoro.config.ts`

## Equipo

Mariana Mamaní — track Genesis / Argentina Builder Challenge.
