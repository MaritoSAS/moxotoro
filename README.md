# MOXOTORO

Experiencia turística patrimonial en La Caldera (Salta, Argentina) — *Magnami Experience*.
Proyecto para el **Argentina Builder Challenge (BAF × Stellar)**.

## Problema

Reservar y cobrar una experiencia guiada (circuito Camino Real / Qhapaq Ñan) con seña clara, cupos y protocolo climático, sin fricción de cobro internacional/local.

## Solución (esqueleto semana 1)

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

## Estado actual (Checkpoint 1 · 21/09)

| Área | Estado |
|------|--------|
| Config de negocio (precios, cupos, políticas) | Listo |
| Integración Stellar (SEP-0007 + verify memo) | Listo en `src/lib/stellar.ts` |
| Componentes (mapa, checkout, circuito, clima) | En `src/components/` |
| UI principal cableada | Home con circuito, mapa, políticas y reserva |
| Calendario de reserva | Visible en `#reservar` (no `input type="date"`) |
| Deploy testnet público | Pendiente (Checkpoint 2) |

## Reserva

La sección **Reservá tu salida** (`#reservar`) muestra un mes completo (lunes–domingo, mes en español) junto al selector de turno mañana/tarde. Los días anteriores al mínimo de `getMinBookingDate()` — cierre a las `MOXOTORO_CONFIG.capacity.cutoffHourPreviousDay` (20:00) del día previo, hora Argentina — quedan deshabilitados. Elegir fecha + turno y confirmar abre el checkout de seña en Stellar.

## Cómo correr

```bash
npm install
npm run dev
```

Abrí http://localhost:3000

## Stellar

- Red: **TESTNET**
- Asset: USDC
- Config: `src/config/moxotoro.config.ts`

## Equipo

Mariana Mamaní — track Genesis / Argentina Builder Challenge.
