"use client";

import { ESI_COLOR, ESI_LABEL } from "@/lib/triage/colors";
import type { ESILevel } from "@/lib/triage/types";

const LEVELS: ESILevel[] = [1, 2, 3, 4, 5];

export default function ESILegend() {
  return (
    <div className="pointer-events-none absolute bottom-4 left-4 z-10 rounded-lg border border-zinc-800 bg-zinc-950/85 p-3 text-xs backdrop-blur">
      <div className="mb-1.5 font-semibold uppercase tracking-wider text-zinc-400">
        Nivel ESI
      </div>
      <div className="flex flex-col gap-1">
        {LEVELS.map((lvl) => (
          <div key={lvl} className="flex items-center gap-2">
            <span
              className="flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-black"
              style={{ backgroundColor: ESI_COLOR[lvl] }}
            >
              {lvl}
            </span>
            <span className="text-zinc-300">{ESI_LABEL[lvl]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
