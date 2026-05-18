import { z } from "zod";
import { CLAUDE_MODEL, TRIAGE_SYSTEM_PROMPT, getClaude } from "@/lib/claude";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const InputSchema = z.object({
  chiefComplaint: z.string().min(2).max(500),
  age: z.number().int().min(0).max(120),
  vitals: z
    .object({
      heartRate: z.number().int().min(20).max(260).optional(),
      systolicBP: z.number().int().min(40).max(260).optional(),
      spO2: z.number().int().min(40).max(100).optional(),
      temperatureC: z.number().min(28).max(45).optional(),
      painScale: z.number().int().min(0).max(10).optional(),
    })
    .optional(),
});

function vitalsLine(v: z.infer<typeof InputSchema>["vitals"]): string {
  if (!v) return "Signos vitales no registrados.";
  const parts: string[] = [];
  if (v.heartRate !== undefined) parts.push(`FC ${v.heartRate} bpm`);
  if (v.systolicBP !== undefined) parts.push(`TA sistólica ${v.systolicBP} mmHg`);
  if (v.spO2 !== undefined) parts.push(`SpO2 ${v.spO2}%`);
  if (v.temperatureC !== undefined) parts.push(`Temp ${v.temperatureC}°C`);
  if (v.painScale !== undefined) parts.push(`Dolor ${v.painScale}/10`);
  return parts.length > 0 ? parts.join(", ") : "Signos vitales no registrados.";
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = InputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { chiefComplaint, age, vitals } = parsed.data;

  const userPrompt = `Paciente
Edad: ${age} años
Queja principal: ${chiefComplaint}
${vitalsLine(vitals)}`;

  let claude;
  try {
    claude = getClaude();
  } catch (err) {
    return Response.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };

      try {
        const response = await claude.messages.stream({
          model: CLAUDE_MODEL,
          max_tokens: 600,
          system: [
            {
              type: "text",
              text: TRIAGE_SYSTEM_PROMPT,
              cache_control: { type: "ephemeral" },
            },
          ],
          messages: [{ role: "user", content: userPrompt }],
        });

        let full = "";
        for await (const event of response) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const piece = event.delta.text;
            full += piece;
            send("delta", { text: piece });
          }
        }

        send("done", { full });
        controller.close();
      } catch (err) {
        send("error", { message: (err as Error).message });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
