import type { ESILevel, Patient, ResourceId } from "./types";

interface ClassifierInput {
  chiefComplaint: string;
  age: number;
  vitals?: Patient["vitals"];
}

interface ClassifierOutput {
  esi: ESILevel;
  reasoning: string;
  resourcesNeeded: ResourceId[];
}

const LIFE_THREAT_KEYWORDS = [
  "cardiac arrest",
  "paro cardiaco",
  "no pulse",
  "sin pulso",
  "no respira",
  "not breathing",
  "unresponsive",
  "inconsciente",
  "unconscious",
  "severe trauma",
  "trauma severo",
  "stab",
  "stabbed",
  "apuñalado",
  "gunshot",
  "balazo",
  "anaphylaxis",
  "anafilaxia",
  "severe bleeding",
  "hemorragia severa",
];

const HIGH_RISK_KEYWORDS = [
  "chest pain",
  "dolor torácico",
  "dolor toracico",
  "dolor de pecho",
  "stroke",
  "evc",
  "acv",
  "facial droop",
  "slurred speech",
  "habla arrastrada",
  "severe shortness of breath",
  "dificultad para respirar severa",
  "suicidal",
  "suicida",
  "active labor",
  "trabajo de parto activo",
  "irradiado",
  "radiating",
  "crushing chest",
];

const MID_RISK_KEYWORDS = [
  "abdominal pain",
  "dolor abdominal",
  "persistent vomiting",
  "vomito persistente",
  "high fever",
  "fever",
  "fiebre alta",
  "severe migraine",
  "migraña severa",
  "fractura",
  "fracture",
  "burn",
  "quemadura",
];

const LOW_RISK_KEYWORDS = [
  "ankle",
  "tobillo",
  "wrist",
  "muñeca",
  "laceration",
  "laceración",
  "cut",
  "cortada",
  "earache",
  "dolor de oído",
  "rash",
  "erupción",
];

const TRIVIAL_KEYWORDS = [
  "prescription refill",
  "med refill",
  "receta",
  "stitch removal",
  "retiro de puntos",
  "mild cough",
  "tos leve",
  "constipation",
  "estreñimiento",
];

function includesAny(text: string, keywords: string[]): boolean {
  const t = text.toLowerCase();
  return keywords.some((k) => t.includes(k));
}

function inferResources(esi: ESILevel, complaint: string): ResourceId[] {
  const t = complaint.toLowerCase();
  const r = new Set<ResourceId>(["doctor"]);
  if (esi === 1) {
    r.add("trauma_bay");
    r.add("iv_bay");
  }
  if (
    t.includes("pecho") ||
    t.includes("chest") ||
    t.includes("torácic") ||
    t.includes("toracic")
  ) {
    r.add("ecg");
  }
  if (
    t.includes("cabeza") ||
    t.includes("head") ||
    t.includes("abdominal") ||
    t.includes("stroke") ||
    t.includes("evc") ||
    t.includes("slurred") ||
    t.includes("facial droop")
  ) {
    r.add("ct_scan");
  }
  if (
    t.includes("fractura") ||
    t.includes("fracture") ||
    t.includes("tobillo") ||
    t.includes("muñeca") ||
    t.includes("ankle") ||
    t.includes("wrist")
  ) {
    r.add("xray");
  }
  if (
    t.includes("fiebre") ||
    t.includes("fever") ||
    t.includes("abdominal")
  ) {
    r.add("lab");
  }
  if (esi <= 2) r.add("iv_bay");
  if (esi >= 4) r.add("consult_room");
  return Array.from(r);
}

export function classifyESI(input: ClassifierInput): ClassifierOutput {
  const { chiefComplaint, age, vitals } = input;

  if (includesAny(chiefComplaint, LIFE_THREAT_KEYWORDS)) {
    return {
      esi: 1,
      reasoning: "Critical: requires immediate life-saving intervention.",
      resourcesNeeded: inferResources(1, chiefComplaint),
    };
  }

  if (vitals) {
    if ((vitals.spO2 ?? 100) < 90) {
      return {
        esi: 1,
        reasoning: `SpO2 ${vitals.spO2}% < 90% — severe hypoxia.`,
        resourcesNeeded: inferResources(1, chiefComplaint),
      };
    }
    if ((vitals.systolicBP ?? 120) < 80) {
      return {
        esi: 1,
        reasoning: `Systolic ${vitals.systolicBP} < 80 mmHg — hypotension.`,
        resourcesNeeded: inferResources(1, chiefComplaint),
      };
    }
    if ((vitals.heartRate ?? 80) > 140) {
      return {
        esi: 2,
        reasoning: `HR ${vitals.heartRate} > 140 bpm — severe tachycardia.`,
        resourcesNeeded: inferResources(2, chiefComplaint),
      };
    }
  }

  if (includesAny(chiefComplaint, HIGH_RISK_KEYWORDS)) {
    return {
      esi: 2,
      reasoning: "High risk: urgent situation or severe pain.",
      resourcesNeeded: inferResources(2, chiefComplaint),
    };
  }

  const veryYoungOrOld = age < 2 || age > 80;
  const painSevere = (vitals?.painScale ?? 0) >= 7;
  if (
    includesAny(chiefComplaint, MID_RISK_KEYWORDS) ||
    (painSevere && veryYoungOrOld)
  ) {
    return {
      esi: 3,
      reasoning: "Stable, requires multiple resources (studies + evaluation).",
      resourcesNeeded: inferResources(3, chiefComplaint),
    };
  }

  if (includesAny(chiefComplaint, LOW_RISK_KEYWORDS)) {
    return {
      esi: 4,
      reasoning: "Stable, requires a single resource.",
      resourcesNeeded: inferResources(4, chiefComplaint),
    };
  }

  if (includesAny(chiefComplaint, TRIVIAL_KEYWORDS)) {
    return {
      esi: 5,
      reasoning: "No resources required; administrative visit.",
      resourcesNeeded: inferResources(5, chiefComplaint),
    };
  }

  return {
    esi: 3,
    reasoning: "No clear keywords — conservative default ESI-3.",
    resourcesNeeded: inferResources(3, chiefComplaint),
  };
}
