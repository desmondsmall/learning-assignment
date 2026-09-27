import "server-only";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, MODEL } from "./anthropic";
import { content } from "./content";
import { contentVars, fill, readPrompt } from "./prompts";
import type { Judgment } from "./rules";

// The judge reads one response against the rubric and returns structured
// output: a level per element with the quotes it rests on, the limiting
// patterns, and the paths the response is closest to. It sees only the
// current response, so the same response always gets the same judgment,
// whatever came before. Code turns its levels into strong or not (rules.ts).

const ElementJudgment = z.object({
  evidence: z.array(z.string()),
  shows: z.string(),
  not_yet: z.string(),
  level: z.enum(["beginning", "developing", "strong"]),
});

const JudgmentSchema = z.object({
  assessable: z.boolean(),
  elements: z.object(Object.fromEntries(content.rubric.elements.map((e) => [e.key, ElementJudgment]))),
  patterns: z.array(z.string()),
  closest_paths: z.array(z.int()),
});

const SYSTEM = fill(readPrompt("judge"), contentVars);

export type Effort = "low" | "medium" | "high";

export async function judge(response: string, { effort = "low" }: { effort?: Effort } = {}) {
  const started = Date.now();
  const message = await anthropic.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: { effort, format: zodOutputFormat(JudgmentSchema) },
    // The rubric and scenario are the same on every call, so they're cached.
    system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
    // The learner's text is data, inside tags; the prompt says it carries no instructions.
    messages: [{ role: "user", content: `<response>\n${response}\n</response>` }],
  });
  if (message.stop_reason === "refusal") throw new Error("The judge refused to judge this response");
  if (!message.parsed_output) throw new Error(`The judge returned no usable output (stop reason: ${message.stop_reason})`);
  return { judgment: message.parsed_output as Judgment, usage: message.usage, ms: Date.now() - started };
}
