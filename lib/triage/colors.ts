import type { ESILevel } from "./types";

export const ESI_COLOR: Record<ESILevel, string> = {
  1: "#ef4444",
  2: "#f97316",
  3: "#eab308",
  4: "#22c55e",
  5: "#3b82f6",
};

export const ESI_LABEL: Record<ESILevel, string> = {
  1: "Immediate",
  2: "Urgent",
  3: "Less urgent",
  4: "Non-urgent",
  5: "Administrative",
};
