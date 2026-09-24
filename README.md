# MOXOTORO

Experiencia turística patrimonial en La Caldera (Salta, Argentina) — *Magnami Experience*.
Proyecto para el **Argentina Builder Challenge (BAF × Stellar)**.

## Problema

Reservar y cobrar una experiencia guiada (circuito Camino Real / Qhapaq Ñan) con seña clara, cupos y protocolo climático, sin fricción de cobro internacional/local.

## Solución (esqueleto Checkpoint 2)

App Next.js para:
- Mostrar el circuito y paradas (mapa + GeoJSON)
- Tarifas en USDC / ARS, seña configurable y extensión Walpac
- Checkout de seña con **Stellar Testnet** (SEP-0007 USDC + verificación por memo en Horizon)
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
| Seña Testnet verificable (SEP-0007 USDC + Horizon) | En `src/lib/stellar.ts` |
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

## Tarjeta NFC

`/tarjeta` es la tarjeta digital de Mariana Mamaní (turismo patrimonial, Magnami Experience / MOXOTORO). Las tarjetas NFC de hoteles y otros aliados tienen que abrir esa URL cuando el visitante las toca.

Grabá en el chip NTAG:

```
https://moxotoro.vercel.app/tarjeta
```

Para saber de qué recepción llegó la consulta, sumá `ref` con el nombre del aliado. No hace falta backend: el nombre se muestra en la tarjeta y viaja en el mensaje de WhatsApp.

```
https://moxotoro.vercel.app/tarjeta?ref=aliado
```

Ejemplo: `https://moxotoro.vercel.app/tarjeta?ref=Hotel%20La%20Caldera`

`/nfc` redirige a `/tarjeta` y conserva la query. El número de WhatsApp y las redes salen de `src/config/moxotoro.config.ts`.

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

Copy de la UI en español (Argentina). Pagos configurados **solo en TESTNET** (`src/config/moxotoro.config.ts`). No hay claves de mainnet ni secretos en el repo: solo la clave pública receptora.

## Stellar — seña Testnet verificable

La seña se cobra en **USDC de Stellar TESTNET**, emisor Circle (`asset_issuer` `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5`). El checkout arma un URI SEP-0007 (`web+stellar:pay`) con `asset_code=USDC` y ese `asset_issuer`. Horizon confirma memo, destino y asset antes de marcar la seña.

- Red: **TESTNET** · Horizon `https://horizon-testnet.stellar.org`
- Cuenta receptora (solo clave pública): `GBGBBRRSTCYSP4FXFQCUIFF42XUGAUJOQYLL2DKAET7KYAAO6J56HS4Y`
- Config: `src/config/moxotoro.config.ts`
- Comprobante: `https://stellar.expert/explorer/testnet/tx/{txHash}`

El botón de simulación no se muestra salvo que `NEXT_PUBLIC_ALLOW_PAYMENT_SIMULATION=true`.

### Cómo probar la seña

1. En LOBSTR o Freighter, cambiá la red a **Testnet** y conseguí USDC del emisor Circle (no XLM).
2. Reservá en la home y pagá la seña escaneando el QR o abriendo el URI. El memo `MOXO-…` es obligatorio.
3. Pulsá **Verificar Acreditación de Seña en Stellar**.
4. Si Horizon encuentra el pago, el checkout muestra el enlace a stellar.expert.

## Equipo

Mariana Mamaní — track Genesis / Argentina Builder Challenge.
