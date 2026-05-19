"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Props {
  name: string;
  age: number;
  chiefComplaint: string;
  reasoning: string;
  error?: string | null;
}

export default function ClassifyingOverlay({
  name,
  age,
  chiefComplaint,
  reasoning,
  error,
}: Props) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.2 }}
        className="pointer-events-none absolute left-1/2 top-6 z-10 w-[min(560px,90vw)] -translate-x-1/2 rounded-xl border border-zinc-800 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur"
      >
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
          </span>
          Classifying with Sonnet 4.6
        </div>
        <div className="mt-2 text-sm text-zinc-100">
          <span className="font-medium">{name}, {age}y</span>
          <span className="text-zinc-500"> — </span>
          <span className="text-zinc-300">{chiefComplaint}</span>
        </div>
        <p className="mt-3 min-h-[3em] whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
          {reasoning || (
            <span className="text-zinc-500">Model is thinking...</span>
          )}
          {!error && reasoning && (
            <motion.span
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="inline-block w-2 -mb-0.5 ml-0.5 h-4 bg-zinc-400 align-middle"
            />
          )}
        </p>
        {error && (
          <p className="mt-2 rounded bg-red-950/60 px-2 py-1 text-xs text-red-300">
            {error}
          </p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
