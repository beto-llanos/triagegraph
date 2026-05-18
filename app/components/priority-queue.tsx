"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ESI_COLOR, ESI_LABEL } from "@/lib/triage/colors";
import type { Patient } from "@/lib/triage/types";

interface Props {
  patients: Patient[];
  highlightId?: string | null;
  onHover?: (id: string | null) => void;
}

function compare(a: Patient, b: Patient): number {
  if (a.esi !== b.esi) return a.esi - b.esi;
  return a.arrivedAt - b.arrivedAt;
}

export default function PriorityQueue({ patients, highlightId, onHover }: Props) {
  const sorted = [...patients]
    .filter((p) => p.status === "waiting")
    .sort(compare);

  return (
    <div className="flex h-full flex-col gap-2 overflow-y-auto p-4">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Cola de prioridad ({sorted.length})
      </h2>
      <AnimatePresence initial={false}>
        {sorted.map((p, idx) => {
          const isHi = highlightId === p.id;
          return (
            <motion.button
              key={p.id}
              type="button"
              layout
              initial={{ opacity: 0, y: -12, scale: 0.95 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                boxShadow: isHi
                  ? "0 0 0 2px #fff, 0 0 24px rgba(255,255,255,0.18)"
                  : "0 0 0 0 transparent",
              }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              onMouseEnter={() => onHover?.(p.id)}
              onMouseLeave={() => onHover?.(null)}
              className={`group flex items-start gap-3 rounded-lg border p-3 text-left transition ${
                isHi
                  ? "border-white bg-zinc-900"
                  : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
              }`}
            >
              <div className="flex w-8 flex-col items-center">
                <span className="text-xs text-zinc-500">#{idx + 1}</span>
                <span
                  className="mt-1 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-black"
                  style={{ backgroundColor: ESI_COLOR[p.esi] }}
                >
                  {p.esi}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-medium text-zinc-100">
                    {p.name}, {p.age}a
                  </span>
                  <motion.span
                    key={`${p.id}-${p.estimatedWaitMinutes}`}
                    initial={{ scale: 1.3, color: "#fbbf24" }}
                    animate={{ scale: 1, color: "#a1a1aa" }}
                    transition={{ duration: 0.6 }}
                    className="text-xs"
                  >
                    ~{p.estimatedWaitMinutes}min
                  </motion.span>
                </div>
                <p className="mt-0.5 text-sm text-zinc-300">{p.chiefComplaint}</p>
                <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                  {ESI_LABEL[p.esi]} · {p.esiReasoning}
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {p.resourcesNeeded.map((r) => (
                    <span
                      key={r}
                      className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
