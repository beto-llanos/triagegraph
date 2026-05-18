"use client";

import { useMemo, useState } from "react";
import { toGraphPayload } from "@/lib/triage/scheduler";
import type { TriageState } from "@/lib/triage/types";
import PriorityQueue from "./priority-queue";
import TriageGraph from "./triage-graph";

interface Props {
  initialState: TriageState;
}

export default function TriageStage({ initialState }: Props) {
  const [state] = useState<TriageState>(initialState);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const graph = useMemo(() => toGraphPayload(state), [state]);

  const waitingCount = state.patients.filter((p) => p.status === "waiting").length;
  const criticalCount = state.patients.filter(
    (p) => p.status === "waiting" && p.esi <= 2,
  ).length;

  return (
    <div className="flex h-screen flex-col bg-black text-zinc-100">
      <header className="flex items-center justify-between border-b border-zinc-900 px-6 py-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">TriageGraph</h1>
          <p className="text-xs text-zinc-500">
            Algoritmo ESI + propagación de tiempos de espera en tiempo real
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-zinc-300">{criticalCount} crítico(s)</span>
          </div>
          <div className="text-zinc-500">{waitingCount} en espera</div>
        </div>
      </header>
      <main className="grid flex-1 grid-cols-[1fr_400px] overflow-hidden">
        <section className="relative">
          <TriageGraph graph={graph} highlightId={highlightId} />
        </section>
        <aside className="border-l border-zinc-900 bg-zinc-950">
          <PriorityQueue
            patients={state.patients}
            highlightId={highlightId}
            onHover={setHighlightId}
          />
        </aside>
      </main>
    </div>
  );
}
