import { classifyESI } from "./esi";
import { DEFAULT_RESOURCES, recalculateWaitTimes } from "./scheduler";
import type { Patient, TriageState } from "./types";

interface SeedInput {
  name: string;
  age: number;
  chiefComplaint: string;
  vitals?: Patient["vitals"];
  arrivedMinutesAgo: number;
}

const SEEDS: SeedInput[] = [
  {
    name: "María G.",
    age: 34,
    chiefComplaint: "Severe migraine with vomiting",
    vitals: { painScale: 8, heartRate: 102 },
    arrivedMinutesAgo: 42,
  },
  {
    name: "Juan R.",
    age: 28,
    chiefComplaint: "Twisted ankle playing soccer",
    vitals: { painScale: 5 },
    arrivedMinutesAgo: 38,
  },
  {
    name: "Lupita H.",
    age: 67,
    chiefComplaint: "High fever and abdominal pain",
    vitals: { temperatureC: 39.4, heartRate: 110, painScale: 6 },
    arrivedMinutesAgo: 30,
  },
  {
    name: "Diego S.",
    age: 9,
    chiefComplaint: "Cut on the hand",
    vitals: { painScale: 4 },
    arrivedMinutesAgo: 25,
  },
  {
    name: "Rosa M.",
    age: 72,
    chiefComplaint: "Prescription refill for hypertension",
    arrivedMinutesAgo: 22,
  },
  {
    name: "Carlos T.",
    age: 45,
    chiefComplaint: "Persistent right-side abdominal pain",
    vitals: { painScale: 7, heartRate: 95 },
    arrivedMinutesAgo: 18,
  },
  {
    name: "Ana V.",
    age: 31,
    chiefComplaint: "Mild cough and nasal congestion",
    arrivedMinutesAgo: 15,
  },
  {
    name: "Pedro L.",
    age: 55,
    chiefComplaint: "Closed wrist fracture after a fall",
    vitals: { painScale: 8 },
    arrivedMinutesAgo: 12,
  },
  {
    name: "Sofía B.",
    age: 26,
    chiefComplaint: "Rash on both arms, no fever",
    arrivedMinutesAgo: 8,
  },
  {
    name: "Don Ernesto",
    age: 70,
    chiefComplaint: "Slurred speech and facial droop",
    vitals: { systolicBP: 175, heartRate: 88 },
    arrivedMinutesAgo: 5,
  },
];

export function buildInitialState(now: number = Date.now()): TriageState {
  const patients: Patient[] = SEEDS.map((seed, idx) => {
    const { esi, reasoning, resourcesNeeded } = classifyESI({
      chiefComplaint: seed.chiefComplaint,
      age: seed.age,
      vitals: seed.vitals,
    });
    return {
      id: `p-${idx + 1}`,
      name: seed.name,
      age: seed.age,
      arrivedAt: now - seed.arrivedMinutesAgo * 60_000,
      chiefComplaint: seed.chiefComplaint,
      vitals: seed.vitals,
      esi,
      esiReasoning: reasoning,
      resourcesNeeded,
      status: "waiting",
      estimatedWaitMinutes: 0,
    };
  });

  return recalculateWaitTimes({
    patients,
    resources: DEFAULT_RESOURCES,
    startedAt: now,
  });
}
