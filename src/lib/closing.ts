import "server-only";
import { streamText } from "./anthropic";
import type { Effort } from "./judge";
import { contentVars, fill, readPrompt } from "./prompts";

// The closing note in the debrief: a few sentences on what moved between the
// learner's starting point and their final response, streamed as it's written.
// It sees the two responses and whether the final one is strong, nothing else.

const SYSTEM = fill(readPrompt("closing"), contentVars);

export type ClosingInput = {
  /** The learner's first response. */
  first: string;
  /** Their last submitted version: the same text as first if they submitted only once. */
  final: string;
  strong: boolean;
};

/** The user message: both responses in tags, as data, and whether the final one is strong. */
export function closingMessage({ first, final, strong }: ClosingInput) {
  return [
    `<starting_point>\n${first}\n</starting_point>`,
    `<final_response>\n${final}\n</final_response>`,
    `<final_is_strong>${strong ? "yes" : "no"}</final_is_strong>`,
  ].join("\n\n");
}

/** Streams the closing note, calling onText with each piece as it arrives. */
export function closing(input: ClosingInput, { effort = "low", onText }: { effort?: Effort; onText?: (text: string) => void } = {}) {
  return streamText({ system: SYSTEM, user: closingMessage(input), effort, onText, refusal: "The coach refused to write the closing note" });
}
