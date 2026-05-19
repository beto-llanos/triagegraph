import type { Patient } from "./types";

export interface DemoScenario {
  id: string;
  label: string;
  description: string;
  expectedESI: 1 | 2 | 3 | 4 | 5;
  patient: {
    name: string;
    age: number;
    chiefComplaint: string;
    vitals?: Patient["vitals"];
  };
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "cardiac",
    label: "Cardiac arrest",
    description: "Adult male, no pulse. Expected ESI-1.",
    expectedESI: 1,
    patient: {
      name: "Mr. Domínguez",
      age: 62,
      chiefComplaint:
        "Found unresponsive with no pulse by family. CPR in progress on arrival.",
      vitals: { systolicBP: 0, spO2: 70, heartRate: 0 },
    },
  },
  {
    id: "chest-pain",
    label: "Radiating chest pain",
    description: "Adult with suspected MI. Expected ESI-2.",
    expectedESI: 2,
    patient: {
      name: "Mr. Hernández",
      age: 58,
      chiefComplaint:
        "Crushing chest pain radiating to left arm, 20 minutes. Diaphoresis.",
      vitals: { systolicBP: 138, heartRate: 102, spO2: 95, painScale: 9 },
    },
  },
  {
    id: "pediatric-burn",
    label: "Pediatric burn",
    description: "Child with hand burn. Expected ESI-3.",
    expectedESI: 3,
    patient: {
      name: "Mateo",
      age: 4,
      chiefComplaint:
        "Boiling water burn on right hand and forearm 1 hour ago. Intense crying.",
      vitals: { heartRate: 130, painScale: 9, temperatureC: 37.1 },
    },
  },
  {
    id: "prescription",
    label: "Prescription refill",
    description: "Older adult requesting prescription refill. Expected ESI-5.",
    expectedESI: 5,
    patient: {
      name: "Mrs. Pérez",
      age: 66,
      chiefComplaint: "Needs a losartan prescription refill, ran out yesterday.",
    },
  },
];
