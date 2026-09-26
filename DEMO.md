# Cómo grabar la demo

Recorrido para el video del Argentina Builder Challenge. La seña se verifica en Horizon Testnet con el checkout que ya está en el producto. Esta guía no simula un pago.

## Antes de grabar

1. Billetera (LOBSTR o Freighter) en **Testnet**, con USDC del emisor Circle. XLM no acredita la seña.
2. Misma pestaña del navegador, sin otra reserva abierta. Si quedó una reserva anterior, el modal puede reabrirse: usá **Generar otra reserva** solo si querés un memo nuevo.
3. No hace falta `NEXT_PUBLIC_ALLOW_PAYMENT_SIMULATION`. Ese botón, si estuviera visible, no es una verificación de Horizon.

## Click path

La barra de arriba marca el paso: **Experiencia → Reserva → Seña USDC → Stellar → Verificación → Confirmación**.

1. Entrá a la home. Tocá **Ver la experiencia**.
2. **Experiencia.** Elegí la tarjeta con traslado o la de punto de encuentro. En la tarjeta y en el bloque de abajo se leen la descripción, el precio por persona, la seña y las condiciones (seña no reembolsable, mínimo de participantes, cierre del día anterior).
3. **Reserva.** Bajá a **Reservá tu salida**. Elegí un día habilitado en el calendario, el turno mañana o tarde, la cantidad de participantes y nombre, correo y teléfono.
4. **Seña USDC.** En el panel de la derecha, el **total de la experiencia** y la **seña requerida hoy** están en grande. El medio de pago dice **USDC · Stellar TESTNET**.
5. Tocá **Iniciar reserva**. Se abre el checkout existente: monto total, seña, USDC en Stellar, QR SEP-0007, cuenta receptora y memo `MOXO-…`.
6. Pagá ese monto en USDC Testnet con el memo de la reserva.
7. **Verificación.** Tocá **Verificar Acreditación de Seña en Stellar**. El estado pasa a **Pendiente** (Horizon todavía no ve el pago), **Confirmado** (memo, destino, activo y monto cierran) o **Fallido** (monto, activo u error de Horizon).
8. **Confirmación.** Con **Confirmado**, el modal muestra el hash y el enlace a stellar.expert. Al cerrarlo, el mismo estado queda en el panel de la seña. Recargar la pestaña conserva la reserva (`sessionStorage`, clave `moxotoro.activeBooking`).

Si cerrás el modal antes de pagar, **Continuar pago USDC en Stellar** reabre el mismo memo. No genera un pago paralelo.
