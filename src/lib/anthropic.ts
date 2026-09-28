import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { Effort } from "./judge";

// The one Anthropic client for the app. It reads ANTHROPIC_API_KEY from the
// environment. The server-only import makes the build fail if a client
// component ever imports this file, so the key can't reach the browser.
export const anthropic = new Anthropic();

export const MODEL = process.env.CLAUDE_MODEL ?? "claude-opus-5";

/**
 * Streams a plain-text reply, calling onText with each piece as it arrives.
 * The system prompt is the same on every call, so it's cached.
 */
export async function streamText({ system, user, effort, onText, refusal }: { system: string; user: string; effort: Effort; onText?: (text: string) => void; refusal: string }) {
  const started = Date.now();
  let firstTextAt: number | null = null;
  let text = "";
  const stream = anthropic.messages.stream({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: { effort },
    system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: user }],
  });
  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      firstTextAt ??= Date.now();
      text += event.delta.text;
      onText?.(event.delta.text);
    }
  }
  const message = await stream.finalMessage();
  if (message.stop_reason === "refusal") throw new Error(refusal);
  return {
    text: text.trim(),
    usage: message.usage,
    ms: Date.now() - started,
    firstTextMs: firstTextAt === null ? null : firstTextAt - started,
  };
}
