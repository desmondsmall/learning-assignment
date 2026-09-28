import { after } from "next/server";
import { z } from "zod";
import { MODEL } from "@/lib/anthropic";
import { closing } from "@/lib/closing";
import { saveClosing, type ClosingRecord } from "@/lib/sessionLog";

// The debrief's closing note: what moved between the starting point and the
// final response, streamed as newline-delimited JSON events, like the feedback:
//
//   {"type":"text", "text"}     the coach's words, as written
//   {"type":"done", "note"}     the note is finished
//   {"type":"error", "message"} it failed; the page offers to try again

export const maxDuration = 60;

// Checked and capped like /api/feedback: the page's own session, sent back to it.
const text = z.string().trim().min(1).max(8000);
const RequestBody = z.object({
  sessionId: z.uuid(),
  version: z.int().min(1).max(50),
  first: text,
  final: text,
  strong: z.boolean(),
});

export async function POST(request: Request) {
  const parsed = RequestBody.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "That request isn't one this app sends." }, { status: 400 });
  const { sessionId, version, first, final, strong } = parsed.data;

  const record: ClosingRecord = { sessionId, version, first, final, strong, model: MODEL };
  let finished!: () => void;
  const done = new Promise<void>((resolve) => (finished = resolve));
  // Saved once the note is written, after the learner has it.
  after(async () => {
    await done;
    try {
      await saveClosing(record);
    } catch (err) {
      console.error("POST /api/closing: saving the note failed", { sessionId, error: String(err) });
    }
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: object) => controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      try {
        const out = await closing({ first, final, strong }, { onText: (piece) => send({ type: "text", text: piece }) });
        record.note = out.text;
        record.closing = { ms: out.ms, firstTextMs: out.firstTextMs, usage: out.usage };
        send({ type: "done", note: out.text });
      } catch (err) {
        // Logged without the learner's text; the record keeps the text, and the error.
        record.error = err instanceof Error ? err.message : String(err);
        console.error("POST /api/closing failed", { sessionId, error: record.error });
        send({ type: "error", message: "The coach couldn't write its note." });
      } finally {
        controller.close();
        finished();
      }
    },
  });

  return new Response(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" } });
}
