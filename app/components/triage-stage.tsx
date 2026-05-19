"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { classifyESI } from "@/lib/triage/esi";
import { parseTriageResponse } from "@/lib/triage/parse";
import { admitPatient, toGraphPayload } from "@/lib/triage/scheduler";
import { classifyPatientStream } from "@/lib/triage/client";
import type { Patient, TriageState } from "@/lib/triage/types";
import type { DemoScenario } from "@/lib/triage/scenarios";
import AddPatientForm, { type FormSubmission } from "./add-patient-form";
import ClassifyingOverlay from "./classifying-overlay";
import DemoScenarios from "./demo-scenarios";
import ESILegend from "./esi-legend";
import OnboardingBanner from "./onboarding-banner";
import PriorityQueue from "./priority-queue";
import TriageGraph from "./triage-graph";

interface Props {
  initialState: TriageState;
}

interface PendingState {
  name: string;
  age: number;
  chiefComplaint: string;
  reasoning: string;
  error: string | null;
}

export default function TriageStage({ initialState }: Props) {
  const [state, setState] = useState<TriageState>(initialState);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingState | null>(null);
  const idCounter = useRef(initialState.patients.length);

  const graph = useMemo(() => toGraphPayload(state), [state]);

  const waitingCount = state.patients.filter(
    (p) => p.status === "waiting",
  ).length;
  const criticalCount = state.patients.filter(
    (p) => p.status === "waiting" && p.esi <= 2,
  ).length;

  const flashHighlight = useCallback((id: string) => {
    setHighlightId(id);
    window.setTimeout(() => {
      setHighlightId((cur) => (cur === id ? null : cur));
    }, 3500);
  }, []);

  const finalize = useCallback(
    (
      input: FormSubmission,
      result: { esi: 1 | 2 | 3 | 4 | 5; reasoning: string; resourcesNeeded: Patient["resourcesNeeded"] },
    ) => {
      idCounter.current += 1;
      const newPatient: Patient = {
        id: `p-live-${idCounter.current}`,
        name: input.name,
        age: input.age,
        arrivedAt: Date.now(),
        chiefComplaint: input.chiefComplaint,
        vitals: input.vitals,
        esi: result.esi,
        esiReasoning: result.reasoning.slice(0, 240),
        resourcesNeeded: result.resourcesNeeded,
        status: "waiting",
        estimatedWaitMinutes: 0,
      };
      setState((s) => admitPatient(s, newPatient));
      flashHighlight(newPatient.id);
    },
    [flashHighlight],
  );

  const runClassification = useCallback(
    async (input: FormSubmission) => {
      setPending({
        name: input.name,
        age: input.age,
        chiefComplaint: input.chiefComplaint,
        reasoning: "",
        error: null,
      });

      let full = "";
      let streamErr: string | null = null;

      try {
        await classifyPatientStream(
          {
            chiefComplaint: input.chiefComplaint,
            age: input.age,
            vitals: input.vitals,
          },
          {
            onDelta: (text) => {
              full += text;
              setPending((p) => (p ? { ...p, reasoning: p.reasoning + text } : p));
            },
            onDone: (finalText) => {
              full = finalText || full;
            },
            onError: (msg) => {
              streamErr = msg;
              setPending((p) => (p ? { ...p, error: msg } : p));
            },
          },
        );
      } catch (err) {
        streamErr = (err as Error).message;
        setPending((p) => (p ? { ...p, error: streamErr! } : p));
      }

      const parsed = parseTriageResponse(full);
      if (parsed) {
        window.setTimeout(() => setPending(null), 600);
        finalize(input, {
          esi: parsed.esi,
          reasoning: parsed.reasoning,
          resourcesNeeded: parsed.resourcesNeeded,
        });
        return;
      }

      const fallback = classifyESI({
        chiefComplaint: input.chiefComplaint,
        age: input.age,
        vitals: input.vitals,
      });
      const reasoning = streamErr
        ? `Fallback (rule-based, LLM no disponible): ${fallback.reasoning}`
        : fallback.reasoning;
      window.setTimeout(() => setPending(null), 800);
      finalize(input, {
        esi: fallback.esi,
        reasoning,
        resourcesNeeded: fallback.resourcesNeeded,
      });
    },
    [finalize],
  );

  const handleScenario = useCallback(
    (scenario: DemoScenario) => {
      if (pending) return;
      runClassification({
        name: scenario.patient.name,
        age: scenario.patient.age,
        chiefComplaint: scenario.patient.chiefComplaint,
        vitals: scenario.patient.vitals,
      });
    },
    [pending, runClassification],
  );

  return (
    <div className="flex h-screen flex-col bg-black text-zinc-100">
      <header className="border-b border-zinc-900">
        <div className="flex items-center justify-between px-6 py-3">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              TriageGraph{" "}
              <span className="ml-1 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
                v6
              </span>
            </h1>
            <p className="text-xs text-zinc-500">
              ESI agent with real-time wait-time propagation · Sonnet 4.6
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span className="text-zinc-300">{criticalCount} critical</span>
            </div>
            <div className="text-zinc-500">{waitingCount} waiting</div>
          </div>
        </div>
        <DemoScenarios busy={pending !== null} onRun={handleScenario} />
        <OnboardingBanner />
      </header>
      <main className="relative flex-1 overflow-hidden">
        <section
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ right: 420 }}
        >
          <TriageGraph graph={graph} highlightId={highlightId} />
          <ESILegend />
          {pending && (
            <ClassifyingOverlay
              name={pending.name}
              age={pending.age}
              chiefComplaint={pending.chiefComplaint}
              reasoning={pending.reasoning}
              error={pending.error}
            />
          )}
        </section>
        <aside
          className="flex flex-col"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width: 420,
            background: "#16161d",
            borderLeft: "3px solid #3f3f46",
            boxShadow: "-16px 0 40px -16px rgba(0,0,0,0.9)",
            zIndex: 10,
          }}
        >
          <div className="flex-1 overflow-hidden">
            <PriorityQueue
              patients={state.patients}
              highlightId={highlightId}
              onHover={setHighlightId}
            />
          </div>
          <AddPatientForm
            onSubmit={runClassification}
            busy={pending !== null}
          />
        </aside>
      </main>
    </div>
  );
}
