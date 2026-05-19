"use client";

import { DEMO_SCENARIOS, type DemoScenario } from "@/lib/triage/scenarios";
import { ESI_COLOR } from "@/lib/triage/colors";

interface Props {
  busy: boolean;
  onRun: (scenario: DemoScenario) => void;
}

export default function DemoScenarios({ busy, onRun }: Props) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto px-4 py-2 text-xs">
      <span className="shrink-0 text-zinc-500">Try a demo:</span>
      {DEMO_SCENARIOS.map((s) => (
        <button
          key={s.id}
          type="button"
          disabled={busy}
          onClick={() => onRun(s)}
          className="group flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
          title={s.description}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: ESI_COLOR[s.expectedESI] }}
          />
          {s.label}
        </button>
      ))}
    </div>
  );
}
