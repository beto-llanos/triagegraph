import type { ESILevel, ResourceId } from "./types";

const VALID_RESOURCES: ResourceId[] = [
  "doctor",
  "trauma_bay",
  "ecg",
  "ct_scan",
  "xray",
  "lab",
  "iv_bay",
  "consult_room",
];

export interface ParsedTriage {
  esi: ESILevel;
  resourcesNeeded: ResourceId[];
  reasoning: string;
}

export function parseTriageResponse(raw: string): ParsedTriage | null {
  const esiMatch = raw.match(/<esi>\s*(\d)\s*<\/esi>/i);
  const resMatch = raw.match(/<resources>\s*([^<]*?)\s*<\/resources>/i);
  if (!esiMatch) return null;
  const esiNum = Number(esiMatch[1]);
  if (esiNum < 1 || esiNum > 5) return null;

  const resourcesRaw = resMatch ? resMatch[1].split(",") : [];
  const resourcesNeeded = resourcesRaw
    .map((r) => r.trim().toLowerCase() as ResourceId)
    .filter((r): r is ResourceId => VALID_RESOURCES.includes(r));

  const beforeTriage = raw.split(/<triage>/i)[0] ?? raw;
  const reasoning = beforeTriage.trim();

  return {
    esi: esiNum as ESILevel,
    resourcesNeeded:
      resourcesNeeded.length > 0 ? resourcesNeeded : ["doctor"],
    reasoning,
  };
}
