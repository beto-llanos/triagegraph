"use client";

import { useState } from "react";
import type { Patient } from "@/lib/triage/types";

export interface FormSubmission {
  name: string;
  age: number;
  chiefComplaint: string;
  vitals?: Patient["vitals"];
}

interface Props {
  onSubmit: (input: FormSubmission) => void;
  busy: boolean;
}

const parseInt0 = (v: string): number | undefined => {
  if (!v.trim()) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : undefined;
};

const parseFloat0 = (v: string): number | undefined => {
  if (!v.trim()) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

export default function AddPatientForm({ onSubmit, busy }: Props) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [chief, setChief] = useState("");
  const [hr, setHr] = useState("");
  const [bp, setBp] = useState("");
  const [spo2, setSpo2] = useState("");
  const [temp, setTemp] = useState("");
  const [pain, setPain] = useState("");
  const [showVitals, setShowVitals] = useState(false);

  const canSubmit =
    !busy &&
    name.trim().length > 1 &&
    chief.trim().length > 2 &&
    parseInt0(age) !== undefined;

  function reset() {
    setName("");
    setAge("");
    setChief("");
    setHr("");
    setBp("");
    setSpo2("");
    setTemp("");
    setPain("");
    setShowVitals(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    const ageNum = parseInt0(age);
    if (ageNum === undefined) return;
    const vitalsParts = {
      heartRate: parseInt0(hr),
      systolicBP: parseInt0(bp),
      spO2: parseInt0(spo2),
      temperatureC: parseFloat0(temp),
      painScale: parseInt0(pain),
    };
    const hasAnyVital = Object.values(vitalsParts).some(
      (v) => v !== undefined,
    );
    onSubmit({
      name: name.trim(),
      age: ageNum,
      chiefComplaint: chief.trim(),
      vitals: hasAnyVital ? vitalsParts : undefined,
    });
    reset();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 border-t border-zinc-900 bg-zinc-950/80 p-4"
    >
      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Nuevo paciente
      </h2>
      <div className="grid grid-cols-[1fr_72px] gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre"
          disabled={busy}
          className="rounded border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
        />
        <input
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="Edad"
          inputMode="numeric"
          disabled={busy}
          className="rounded border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
        />
      </div>
      <textarea
        value={chief}
        onChange={(e) => setChief(e.target.value)}
        placeholder="Queja principal (ej. dolor torácico irradiado, 30 min)"
        rows={2}
        disabled={busy}
        className="rounded border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
      />

      <button
        type="button"
        onClick={() => setShowVitals((v) => !v)}
        className="self-start text-[11px] text-zinc-400 underline-offset-2 hover:text-zinc-200 hover:underline"
      >
        {showVitals ? "Ocultar signos vitales" : "+ Agregar signos vitales (opcional)"}
      </button>

      {showVitals && (
        <div className="grid grid-cols-5 gap-1">
          <input
            value={hr}
            onChange={(e) => setHr(e.target.value)}
            placeholder="FC"
            inputMode="numeric"
            disabled={busy}
            className="rounded border border-zinc-800 bg-zinc-900 px-1.5 py-1 text-xs text-zinc-100 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
          />
          <input
            value={bp}
            onChange={(e) => setBp(e.target.value)}
            placeholder="TAs"
            inputMode="numeric"
            disabled={busy}
            className="rounded border border-zinc-800 bg-zinc-900 px-1.5 py-1 text-xs text-zinc-100 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
          />
          <input
            value={spo2}
            onChange={(e) => setSpo2(e.target.value)}
            placeholder="SpO2"
            inputMode="numeric"
            disabled={busy}
            className="rounded border border-zinc-800 bg-zinc-900 px-1.5 py-1 text-xs text-zinc-100 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
          />
          <input
            value={temp}
            onChange={(e) => setTemp(e.target.value)}
            placeholder="Temp"
            inputMode="decimal"
            disabled={busy}
            className="rounded border border-zinc-800 bg-zinc-900 px-1.5 py-1 text-xs text-zinc-100 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
          />
          <input
            value={pain}
            onChange={(e) => setPain(e.target.value)}
            placeholder="Dolor"
            inputMode="numeric"
            disabled={busy}
            className="rounded border border-zinc-800 bg-zinc-900 px-1.5 py-1 text-xs text-zinc-100 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-1 rounded bg-white px-3 py-1.5 text-sm font-medium text-black transition disabled:bg-zinc-800 disabled:text-zinc-500"
      >
        {busy ? "Clasificando..." : "Clasificar y triagear"}
      </button>
    </form>
  );
}
