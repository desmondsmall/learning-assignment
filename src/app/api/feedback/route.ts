import { after } from "next/server";
import { z } from "zod";
import { MODEL } from "@/lib/anthropic";
import { coach, historyOf, promptText } from "@/lib/coach";
import { content } from "@/lib/content";
import { judge } from "@/lib/judge";
import { isStrong, verifyQuotes, type Judgment } from "@/lib/rules";
import { afterRound, modeOf, promptFor, unchanged, type SessionState } from "@/lib/session";
import { saveExchange, type ExchangeRecord } from "@/lib/sessionLog";

// One round of feedback: judge the response, apply the rules, then stream the
// coach's words. The server keeps no sessions: the page sends its session with
// each submission and gets the next one back at the end. The reply is
// newline-delimited JSON events:
//
//   {"type":"judgment", "mode", "strong", "prompt"}   once the judge is done
//   {"type":"text", "text"}                           the coach's words, as written
//   {"type":"done", "feedback", "session"}            the round is over
//   {"type":"error", "message"}                       it failed; the page keeps the draft

// The judge and the coach together take 15 to 30 seconds.
export const maxDuration = 60;

// Everything the page sends is checked and capped: it's the one input a visitor controls.
const text = (max: number) => z.string().max(max);
const Level = z.enum(["beginning", "developing", "strong"]);
const JudgmentInput = z.object({
  assessable: z.boolean(),
  elements: z.record(
    z.string().max(50),
    z.object({ evidence: z.array(text(1000)).max(20), shows: text(2000), not_yet: text(2000), level: Level }),
  ),
  patterns: z.array(text(100)).max(10),
  closest_paths: z.array(z.int()).max(10),
});
const PromptInput = z.union([
  z.object({ kind: z.literal("options") }),
  z.object({ kind: z.literal("lastTest") }),
  z.object({ kind: z.literal("challenge"), pathId: z.int() }),
]);
const SessionInput = z.object({
  first: z.object({ response: text(8000), closest: z.int().nullable() }).nullable(),
  previous: z
    .object({ response: text(8000), judgment: JudgmentInput, strong: z.boolean(), feedback: text(6000), prompt: PromptInput.nullable() })
    .nullable(),
  rounds: z.array(z.object({ strong: z.boolean(), patterns: z.array(text(100)).max(10) })).max(50),
  raised: z.array(z.int()).max(20),
  lastTestDone: z.boolean(),
  lastPrompt: PromptInput.nullable(),
});
const RequestBody = z.object({
  sessionId: z.uuid(),
  response: z.string().trim().min(1).max(8000),
  session: SessionInput,
});

export async function POST(request: Request) {
  const parsed = RequestBody.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "That request isn't one this app sends." }, { status: 400 });
  const { sessionId, response } = parsed.data;
  const session = parsed.data.session as SessionState;

  const record: ExchangeRecord = { sessionId, version: session.rounds.length + 1, response, model: MODEL };
  let finished!: () => void;
  const done = new Promise<void>((resolve) => (finished = resolve));
  // Saved once the round is over, after the learner has their feedback.
  after(async () => {
    await done;
    try {
      await saveExchange(record);
    } catch (err) {
      console.error("POST /api/feedback: saving the exchange failed", { sessionId, error: String(err) });
    }
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: object) => controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      try {
        // An unchanged resubmission keeps its judgment; anything else is judged afresh.
        let judgment: Judgment;
        let strong: boolean;
        if (unchanged(session, response)) {
          ({ judgment, strong } = session.previous!);
        } else {
          const judged = await judge(response);
          judgment = verifyQuotes(judged.judgment, response).judgment;
          strong = isStrong(judgment, content.rubric.strongRule);
          record.judge = { ms: judged.ms, usage: judged.usage };
        }
        const mode = modeOf(session, response, judgment);
        const prompt = promptFor(session, mode, judgment, strong, content.scenario.challengeOrder);
        const shown = prompt ? { ...prompt, text: promptText(prompt) } : null;
        Object.assign(record, { mode, judgment, strong, prompt: shown });
        send({ type: "judgment", mode, strong, prompt: shown });

        const out = await coach(
          { mode, response, judgment, strong, history: historyOf(session), prompt: shown?.text },
          { onText: (piece) => send({ type: "text", text: piece }) },
        );
        record.feedback = out.text;
        record.coach = { ms: out.ms, firstTextMs: out.firstTextMs, usage: out.usage };
        send({ type: "done", feedback: out.text, session: afterRound(session, { response, judgment, strong, mode, prompt, feedback: out.text }) });
      } catch (err) {
        // Logged without the learner's text; the exchange record keeps the text, and the error.
        record.error = err instanceof Error ? err.message : String(err);
        console.error("POST /api/feedback failed", { sessionId, error: record.error });
        send({ type: "error", message: "The coach couldn't finish. Your response is still here: try submitting it again." });
      } finally {
        controller.close();
        finished();
      }
    },
  });

  return new Response(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" } });
}
