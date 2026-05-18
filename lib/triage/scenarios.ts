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
    label: "Paro cardiaco",
    description: "Hombre adulto, sin pulso. ESI-1 esperado.",
    expectedESI: 1,
    patient: {
      name: "Sr. Domínguez",
      age: 62,
      chiefComplaint:
        "Encontrado inconsciente sin pulso por familiares. RCP en curso al llegar.",
      vitals: { systolicBP: 0, spO2: 70, heartRate: 0 },
    },
  },
  {
    id: "chest-pain",
    label: "Dolor torácico irradiado",
    description: "Adulto con sospecha de IAM. ESI-2 esperado.",
    expectedESI: 2,
    patient: {
      name: "Sr. Hernández",
      age: 58,
      chiefComplaint:
        "Dolor torácico opresivo irradiado a brazo izquierdo, 20 minutos. Diaforesis.",
      vitals: { systolicBP: 138, heartRate: 102, spO2: 95, painScale: 9 },
    },
  },
  {
    id: "pediatric-burn",
    label: "Quemadura pediátrica",
    description: "Niño con quemadura de mano. ESI-3 esperado.",
    expectedESI: 3,
    patient: {
      name: "Mateo",
      age: 4,
      chiefComplaint:
        "Quemadura por agua hirviendo en mano y antebrazo derecho hace 1 hora. Llanto intenso.",
      vitals: { heartRate: 130, painScale: 9, temperatureC: 37.1 },
    },
  },
  {
    id: "prescription",
    label: "Receta de hipertensión",
    description: "Adulta mayor solicitando receta. ESI-5 esperado.",
    expectedESI: 5,
    patient: {
      name: "Sra. Pérez",
      age: 66,
      chiefComplaint: "Necesita receta de losartán, se le acabó ayer.",
    },
  },
];
