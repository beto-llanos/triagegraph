import type { Patient } from "./types";

export interface ClassifyInput {
  chiefComplaint: string;
  age: number;
  vitals?: Patient["vitals"];
}

export interface StreamHandlers {
  onDelta: (text: string) => void;
  onDone: (full: string) => void;
  onError: (message: string) => void;
  signal?: AbortSignal;
}

export async function classifyPatientStream(
  input: ClassifyInput,
  handlers: StreamHandlers,
): Promise<void> {
  const res = await fetch("/api/triage/classify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal: handlers.signal,
  });

  if (!res.ok || !res.body) {
    const err = await res.text().catch(() => "Stream open failed");
    handlers.onError(err || `HTTP ${res.status}`);
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });

    const events = buf.split("\n\n");
    buf = events.pop() ?? "";

    for (const block of events) {
      if (!block.trim()) continue;
      const lines = block.split("\n");
      const eventLine = lines.find((l) => l.startsWith("event:"));
      const dataLine = lines.find((l) => l.startsWith("data:"));
      if (!eventLine || !dataLine) continue;
      const ev = eventLine.slice(6).trim();
      let data: unknown;
      try {
        data = JSON.parse(dataLine.slice(5).trim());
      } catch {
        continue;
      }
      if (ev === "delta" && typeof (data as { text?: unknown }).text === "string") {
        handlers.onDelta((data as { text: string }).text);
      } else if (ev === "done") {
        handlers.onDone((data as { full: string }).full);
      } else if (ev === "error") {
        handlers.onError((data as { message: string }).message);
      }
    }
  }
}
