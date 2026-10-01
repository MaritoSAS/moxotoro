"use client";

import React, { useActionState } from "react";
import { loginAdminAction } from "@/server/bookingActions";

export const AdminLogin: React.FC<{ configured: boolean }> = ({ configured }) => {
  const [state, action, pending] = useActionState(loginAdminAction, null);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-16">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#c4a962]">MOXOTORO</p>
      <h1 className="mt-2 text-3xl font-bold text-[#f5f0e8]">Administración</h1>
      <p className="mt-2 text-sm text-[#9ca3af]">Ingresá la contraseña del panel. Las reservas de los visitantes no se ven sin ella.</p>
      {!configured && (
        <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-950/40 px-3 py-2 text-sm text-amber-100">
          Falta <span className="font-mono">ADMIN_PASSWORD</span> en las variables de entorno del servidor.
        </p>
      )}
      <form action={action} className="mt-6 space-y-3">
        <label className="block text-xs text-[#9ca3af]">
          Contraseña
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-1 w-full rounded-lg border border-white/10 bg-[#0d1b2a] px-3 py-2.5 text-sm text-[#f5f0e8] outline-none focus:border-[#c4a962]"
          />
        </label>
        {state?.error && <p className="text-sm text-rose-200">{state.error}</p>}
        <button
          type="submit"
          disabled={pending || !configured}
          className="w-full rounded-xl bg-[#c4a962] py-3 text-xs font-bold uppercase tracking-wider text-[#0a0a0a] hover:bg-[#dfc888] disabled:opacity-60"
        >
          {pending ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
};
