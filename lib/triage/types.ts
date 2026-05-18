export type ESILevel = 1 | 2 | 3 | 4 | 5;

export type ResourceId =
  | "doctor"
  | "trauma_bay"
  | "ecg"
  | "ct_scan"
  | "xray"
  | "lab"
  | "iv_bay"
  | "consult_room";

export interface Resource {
  id: ResourceId;
  label: string;
  avgServiceMinutes: number;
  capacity: number;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  arrivedAt: number;
  chiefComplaint: string;
  vitals?: {
    heartRate?: number;
    systolicBP?: number;
    spO2?: number;
    temperatureC?: number;
    painScale?: number;
  };
  esi: ESILevel;
  esiReasoning: string;
  resourcesNeeded: ResourceId[];
  status: "waiting" | "in_treatment" | "discharged";
  estimatedWaitMinutes: number;
}

export interface TriageState {
  patients: Patient[];
  resources: Resource[];
  startedAt: number;
}

export interface GraphPayload {
  nodes: Array<{
    id: string;
    label: string;
    esi: ESILevel;
    waitMinutes: number;
    status: Patient["status"];
    chiefComplaint: string;
  }>;
  links: Array<{
    source: string;
    target: string;
    resource: ResourceId;
  }>;
}
