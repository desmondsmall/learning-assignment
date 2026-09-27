import "server-only";
import { anthropic, MODEL } from "./anthropic";
import { content, pathById } from "./content";
import type { Effort } from "./judge";
import { contentVars, fill, readPrompt } from "./prompts";
import { blockingElements, normalise, type Judgment, type Prompt } from "./rules";
import type { Mode, SessionState } from "./session";

// The coach writes the feedback the learner reads, from the checked judgment,
// streamed as it's written. It never sees the rubric's levels as labels, and
// never decides anything the rules decide: whether the response is strong, and
// what the feedback ends with, arrive as facts in its message.

const SYSTEM = fill(readPrompt("coach"), contentVars);
const { rubric, scenario, lastTest } = content;
const ELEMENT_NAMES = Object.fromEntries(rubric.elements.map((e) => [e.key, e.name]));

/** One judged version, as the coach remembers it. */
export type Version = { response: string; judgment: Judgment; strong: boolean; feedback?: string };

/**
 * The short summary of the session the coach is given. The judge gets none of
 * this: it judges the current response alone, so the same response always gets
 * the same levels.
 */
export type History = {
  /** The learner's first response. */
  first?: { response: string };
  /** The last judged version, with the feedback it got. */
  previous?: Version;
  /** One entry per judged version so far. */
  rounds?: { strong: boolean; patterns: string[] }[];
  /** The prompt the previous feedback ended with, as the learner saw it. */
  lastPrompt?: string;
};

export type CoachInput = {
  mode: Mode;
  response: string;
  judgment: Judgment;
  strong: boolean;
  history?: History;
  /** The prompt this feedback ends with, if any, as the learner will see it. */
  prompt?: string | null;
};

/** What the coach remembers of a session: a short summary, never the whole transcript. */
export function historyOf(session: SessionState): History {
  return {
    first: session.first ? { response: session.first.response } : undefined,
    previous: session.previous ?? undefined,
    rounds: session.rounds,
    lastPrompt: session.lastPrompt ? promptText(session.lastPrompt) : undefined,
  };
}

/** The authored text of a prompt, exactly as the learner sees it after the feedback. */
export function promptText(prompt: Prompt): string {
  if (prompt.kind === "options") return scenario.optionsQuestion;
  if (prompt.kind === "lastTest") return `${lastTest.whatHappens} ${lastTest.coachAsks}`;
  return pathById(prompt.pathId).challenge;
}

const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;

/** How long the feedback should be: a one-liner gets a few sentences, a full response up to 250 words. */
export function feedbackBudget(response: string, mode: Mode) {
  if (mode === "unchanged" || mode === "too_short") return 80;
  return Math.round(Math.min(250, Math.max(60, 40 + wordCount(response) * 1.2)));
}

// What the coach sees of a judgment. For a response that isn't strong, gaps are
// shown only for the elements that block strong, and a pattern from the
// rubric's list only if it limits one of them, so the coach can't push on what
// is already good enough.
function describeJudgment(judgment: Judgment, strong: boolean) {
  if (!judgment.assessable) return "Too short to judge.";
  const blocking = strong ? [] : blockingElements(judgment, rubric.strongRule);
  const lines = [`Strong: ${strong ? "yes" : "no"}`, ""];
  for (const [key, el] of Object.entries(judgment.elements)) {
    const status = strong ? el.level : blocking.includes(key) ? `${el.level}, stands between this response and strong` : `${el.level}, good enough for now`;
    lines.push(`${ELEMENT_NAMES[key]} (${status})`);
    lines.push(`  Shows: ${el.shows}`);
    if (el.not_yet && blocking.includes(key)) lines.push(`  Not yet: ${el.not_yet}`);
    if (el.evidence.length) lines.push(`  Evidence: ${el.evidence.map((q) => `"${q}"`).join(" ")}`);
  }
  const limits = Object.fromEntries(rubric.patterns.map((p) => [p.key, p.limits]));
  const patterns = strong ? [] : judgment.patterns.filter((p) => !limits[p] || limits[p].some((k) => blocking.includes(k)));
  if (!strong) lines.push("", `Standing between this response and strong: ${blocking.map((k) => ELEMENT_NAMES[k]).join(", ")}`);
  lines.push("", `Limiting patterns: ${patterns.length ? patterns.join(", ") : "none"}`);
  return lines.join("\n");
}

const SITUATION: Record<Mode, string> = {
  first: "This is the learner's first response.",
  revision: "This is a revision of the previous response.",
  unchanged: "The learner resubmitted without changing anything: this response is identical to the previous one.",
  too_short: "The response is too short to judge.",
};

/** The user message: the session summary, then the learner's text in tags, as data. */
export function coachMessage({ mode, response, judgment, strong, history = {}, prompt }: CoachInput) {
  const parts: string[] = [];
  const { first, previous, rounds, lastPrompt } = history;
  if (first && (!previous || normalise(first.response) !== normalise(previous.response))) {
    parts.push(`<starting_point>\n${first.response}\n</starting_point>`);
  }
  if (previous) {
    parts.push(`<previous_response>\n${previous.response}\n</previous_response>`);
    parts.push(`<previous_judgment>\n${describeJudgment(previous.judgment, previous.strong)}\n</previous_judgment>`);
    if (previous.feedback) parts.push(`<your_previous_feedback>\n${previous.feedback}\n</your_previous_feedback>`);
  }
  if (rounds?.length) {
    const lines = rounds.map((r, i) => `Round ${i + 1}: ${r.strong ? "strong" : `not strong; limiting patterns: ${r.patterns.join(", ") || "none"}`}`);
    parts.push(`<rounds_so_far>\n${lines.join("\n")}\n</rounds_so_far>`);
  }
  if (lastPrompt) parts.push(`<previous_prompt>\n${lastPrompt}\n</previous_prompt>`);
  parts.push(`<response>\n${response}\n</response>`);
  parts.push(`<judgment>\n${describeJudgment(judgment, strong)}\n</judgment>`);
  parts.push(`<situation>${SITUATION[mode]}</situation>`);
  if (prompt) parts.push(`<prompt_after_your_feedback>\n${prompt}\n</prompt_after_your_feedback>`);
  parts.push(`<length>The response is ${wordCount(response)} words. Keep your feedback to about ${feedbackBudget(response, mode)} words.</length>`);
  return parts.join("\n\n");
}

/** Streams the coach's feedback, calling onText with each piece as it arrives. */
export async function coach(input: CoachInput, { effort = "low", onText }: { effort?: Effort; onText?: (text: string) => void } = {}) {
  const started = Date.now();
  let firstTextAt: number | null = null;
  let text = "";
  const stream = anthropic.messages.stream({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: { effort },
    // The instructions, scenario and patterns are the same on every call, so they're cached.
    system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: coachMessage(input) }],
  });
  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      firstTextAt ??= Date.now();
      text += event.delta.text;
      onText?.(event.delta.text);
    }
  }
  const message = await stream.finalMessage();
  if (message.stop_reason === "refusal") throw new Error("The coach refused to give feedback on this response");
  return {
    text: text.trim(),
    usage: message.usage,
    ms: Date.now() - started,
    firstTextMs: firstTextAt === null ? null : firstTextAt - started,
  };
}
