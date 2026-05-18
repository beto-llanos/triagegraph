"use client";

import { useState } from "react";

export default function OnboardingBanner() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className="border-b border-amber-900/40 bg-amber-950/30 px-6 py-2 text-xs text-amber-100">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
          Cómo demostrar
        </span>
        <p className="flex-1 leading-relaxed">
          Toca un escenario abajo (ej. <strong>Paro cardiaco</strong>) o agrega
          un paciente con la forma de la derecha. Verás a Sonnet 4.6 razonar la
          clasificación ESI en vivo, el paciente entrar al grafo y los tiempos
          de espera de los demás pacientes recalcularse según los recursos que
          comparten.
        </p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Cerrar"
          className="shrink-0 rounded p-0.5 text-amber-300 hover:bg-amber-900/40"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
