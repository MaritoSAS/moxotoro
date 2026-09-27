# MOXOTORO

Experiencia turística patrimonial en La Caldera (Salta, Argentina). **Magnami Experience** queda como marca histórica y de operación. Proyecto del **Argentina Builder Challenge (BAF × Stellar)**, Checkpoint 3.

## Problema

Reservar y cobrar una experiencia guiada (circuito Camino Real / Qhapaq Ñan) con seña clara, cupos y protocolo climático, sin fricción de cobro internacional/local.

## Solución

App Next.js publicada en [https://moxotoro.vercel.app](https://moxotoro.vercel.app):

- Circuito y paradas (mapa + GeoJSON)
- Tarifas en USDC / ARS, seña configurable y extensión Walpac
- Checkout de seña en **Stellar Testnet** (SEP-0007 USDC). Horizon verifica memo, destino, activo y monto
- Estados de pago en el checkout: **Pendiente**, **Confirmado** y **Fallido**
- Políticas de seña y clima documentadas en producto
- Reserva en la home con calendario mensual (español Argentina) y turnos mañana/tarde

La reserva activa (memo, estado y hash de la seña si ya se verificó) se guarda en `sessionStorage` bajo `moxotoro.activeBooking`. Un refresh en la misma pestaña no pierde esa asociación. No usa `localStorage` ni backend. Se borra al generar una reserva nueva; cerrar el modal no la borra, para que el memo y el hash sigan visibles después de refrescar.

## Stack

- Next.js 16 + React 19 + TypeScript + Tailwind
- `@stellar/stellar-sdk` (Horizon testnet, USDC)
- MapLibre GL

## Estado actual (Checkpoint 3)

| Área | Estado |
|------|--------|
| Deploy | [moxotoro.vercel.app](https://moxotoro.vercel.app) |
| Config de negocio (precios, cupos, políticas) | `src/config/moxotoro.config.ts` |
| Seña Testnet verificable (SEP-0007 USDC + Horizon) | `src/lib/stellar.ts` |
| Estados Pendiente / Confirmado / Fallido | `src/components/payment/StellarCheckoutModal.tsx` |
| Reserva activa en la pestaña | `sessionStorage` (`moxotoro.activeBooking`) |
| Calendario, mapa, WhatsApp, Magnami | Home |

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

### Variable opcional

`NEXT_PUBLIC_ALLOW_PAYMENT_SIMULATION=true` muestra el botón de simulación en el checkout. Si la variable no está definida, o tiene otro valor, el botón no aparece. La verificación de una seña real sigue siendo Horizon Testnet.

## Qué muestra la home

1. **Hero de marca** — MOXOTORO, tagline, destino La Caldera y datos de seña / cupo / red. Magnami Experience figura como marca histórica.
2. **Circuito Camino Real** — las 5 paradas oficiales (`CircuitStops` + GeoJSON).
3. **Mapa interactivo** — MapLibre con la traza `src/data/camino_real.geojson`.
4. **Extensión Walpac** — Casa de los Pájaros como addon de reserva.
5. **Tarifas y checkout** — opciones con/sin traslado, calendario mensual visible (`#reservar`) y `StellarCheckoutModal` para la seña en USDC (SEP-0007, QR, memo, verificación Horizon).
6. **Política de seña y clima** — protocolo de 3 instancias.

Copy de la UI en español (Argentina). Pagos configurados **solo en TESTNET** (`src/config/moxotoro.config.ts`). No hay claves de mainnet ni secretos en el repo: solo la clave pública receptora.

## Stellar — seña Testnet verificable

La seña se cobra en **USDC de Stellar TESTNET**, emisor Circle (`asset_issuer` `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5`). El checkout arma un URI SEP-0007 (`web+stellar:pay`) con `asset_code=USDC` y ese `asset_issuer`. Horizon confirma memo, destino y asset antes de marcar la seña.

- Red: **TESTNET** · Horizon `https://horizon-testnet.stellar.org`
- Cuenta receptora (solo clave pública): `GBGBBRRSTCYSP4FXFQCUIFF42XUGAUJOQYLL2DKAET7KYAAO6J56HS4Y`
- Config: `src/config/moxotoro.config.ts`
- Comprobante: `https://stellar.expert/explorer/testnet/tx/{txHash}`

En el modal:

- **Pendiente** — todavía no aparece el pago en Horizon.
- **Confirmado** — pago verificado, con enlace a stellar.expert.
- **Fallido** — monto distinto, activo incorrecto, error de Horizon u otro resultado que no es éxito. No se muestra como confirmado.

### Cómo probar la seña

1. En LOBSTR o Freighter, cambiá la red a **Testnet** y conseguí USDC del emisor Circle (no XLM).
2. Reservá en la home y pagá la seña escaneando el QR o abriendo el URI. El memo `MOXO-…` es obligatorio.
3. Pulsá **Verificar Acreditación de Seña en Stellar**.
4. Si Horizon encuentra el pago, el estado pasa a **Confirmado** y muestra el enlace a stellar.expert. Si aún no está, queda **Pendiente**. Si el monto, el activo o Horizon no cierran, queda **Fallido**.
5. Refrescá la página en la misma pestaña: el memo y, si ya se verificó, el hash siguen asociados. Una reserva nueva reemplaza lo guardado.

## Demo para el jurado

El video del recorrido (reserva → seña → USDC Testnet → verificación → stellar.expert) está publicado sin login:

- https://moxotoro.vercel.app/demo/moxotoro-demo-e2e.mp4
- Poster: https://moxotoro.vercel.app/demo/moxotoro-demo-e2e-poster.png
- Promo: https://moxotoro.vercel.app/demo/moxotoro-promo-16x9.mp4

Archivos en `public/demo/`. El click path para volver a grabar está en [DEMO.md](./DEMO.md). La verificación de la seña sigue siendo la consulta real a Horizon Testnet.

## Equipo

Mariana Mamaní — track Genesis / Argentina Builder Challenge.
