import type {
  GraphPayload,
  Patient,
  Resource,
  ResourceId,
  TriageState,
} from "./types";

export const DEFAULT_RESOURCES: Resource[] = [
  { id: "doctor", label: "Médico", avgServiceMinutes: 15, capacity: 2 },
  { id: "trauma_bay", label: "Sala de Trauma", avgServiceMinutes: 45, capacity: 1 },
  { id: "ecg", label: "ECG", avgServiceMinutes: 8, capacity: 1 },
  { id: "ct_scan", label: "TAC", avgServiceMinutes: 25, capacity: 1 },
  { id: "xray", label: "Rayos X", avgServiceMinutes: 10, capacity: 1 },
  { id: "lab", label: "Laboratorio", avgServiceMinutes: 30, capacity: 2 },
  { id: "iv_bay", label: "Sala IV", avgServiceMinutes: 20, capacity: 3 },
  { id: "consult_room", label: "Consultorio", avgServiceMinutes: 12, capacity: 2 },
];

const RESOURCE_BY_ID: Record<ResourceId, Resource> = DEFAULT_RESOURCES.reduce(
  (acc, r) => {
    acc[r.id] = r;
    return acc;
  },
  {} as Record<ResourceId, Resource>,
);

function comparePriority(a: Patient, b: Patient): number {
  if (a.esi !== b.esi) return a.esi - b.esi;
  return a.arrivedAt - b.arrivedAt;
}

export function recalculateWaitTimes(state: TriageState): TriageState {
  const waiting = state.patients
    .filter((p) => p.status === "waiting")
    .sort(comparePriority);

  const queueByResource = new Map<ResourceId, Patient[]>();
  for (const p of waiting) {
    for (const rid of p.resourcesNeeded) {
      const q = queueByResource.get(rid) ?? [];
      q.push(p);
      queueByResource.set(rid, q);
    }
  }

  const waitByPatient = new Map<string, number>();
  for (const [rid, queue] of queueByResource) {
    const resource = RESOURCE_BY_ID[rid];
    if (!resource) continue;
    queue.forEach((patient, idx) => {
      const slotsAhead = Math.floor(idx / resource.capacity);
      const waitForResource = slotsAhead * resource.avgServiceMinutes;
      const prev = waitByPatient.get(patient.id) ?? 0;
      waitByPatient.set(patient.id, Math.max(prev, waitForResource));
    });
  }

  return {
    ...state,
    patients: state.patients.map((p) => ({
      ...p,
      estimatedWaitMinutes:
        p.status === "waiting" ? waitByPatient.get(p.id) ?? 0 : 0,
    })),
  };
}

export function admitPatient(state: TriageState, patient: Patient): TriageState {
  const next: TriageState = {
    ...state,
    patients: [...state.patients, patient],
  };
  return recalculateWaitTimes(next);
}

export function toGraphPayload(state: TriageState): GraphPayload {
  const nodes = state.patients.map((p) => ({
    id: p.id,
    label: p.name,
    esi: p.esi,
    waitMinutes: p.estimatedWaitMinutes,
    status: p.status,
    chiefComplaint: p.chiefComplaint,
  }));

  const links: GraphPayload["links"] = [];
  const seen = new Set<string>();
  const waiting = state.patients.filter((p) => p.status === "waiting");
  for (const r of DEFAULT_RESOURCES) {
    const sharing = waiting.filter((p) => p.resourcesNeeded.includes(r.id));
    for (let i = 0; i < sharing.length; i++) {
      for (let j = i + 1; j < sharing.length; j++) {
        const a = sharing[i].id;
        const b = sharing[j].id;
        const key = `${a}|${b}|${r.id}`;
        if (seen.has(key)) continue;
        seen.add(key);
        links.push({ source: a, target: b, resource: r.id });
      }
    }
  }

  return { nodes, links };
}
