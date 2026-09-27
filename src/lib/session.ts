// A learner's session, and how each submission moves it on. Pure functions, so
// the route and the evals run exactly the same logic: the evals play their
// resubmission sequences through these, and the route serves learners with them.
//
// The server keeps no sessions. The page holds this state, sends it with each
// submission, and gets the next state back when the round is done.

import { isUnchanged, nextPrompt, type Judgment, type Prompt } from "./rules";

export type SessionState = {
  /** The learner's first judged response, and the path it was closest to. */
  first: { response: string; closest: number | null } | null;
  /** The last judged version, with the feedback it got and the prompt it ended with. */
  previous: { response: string; judgment: Judgment; strong: boolean; feedback: string; prompt: Prompt | null } | null;
  /** One entry per judged version: whether it was strong, and its limiting patterns. */
  rounds: { strong: boolean; patterns: string[] }[];
  /** Paths already raised as challenges. */
  raised: number[];
  /** Whether the last test has been shown. */
  lastTestDone: boolean;
  /** The prompt the last feedback ended with, whatever the round. */
  lastPrompt: Prompt | null;
};

export const newSession = (): SessionState => ({ first: null, previous: null, rounds: [], raised: [], lastTestDone: false, lastPrompt: null });

/** The first response, a revision, an unchanged resubmission, or one too short to judge. */
export type Mode = "first" | "revision" | "unchanged" | "too_short";

/** Whether this submission changes nothing, so the last judgment and prompt stand. */
export const unchanged = (session: SessionState, response: string) =>
  session.previous !== null && isUnchanged(session.previous.response, response);

export function modeOf(session: SessionState, response: string, judgment: Judgment): Mode {
  if (!judgment.assessable) return "too_short";
  if (unchanged(session, response)) return "unchanged";
  return session.previous ? "revision" : "first";
}

/** What the feedback ends with: nothing when too short, the same prompt when unchanged, otherwise the rule. */
export function promptFor(session: SessionState, mode: Mode, judgment: Judgment, strong: boolean, order: number[]): Prompt | null {
  if (mode === "too_short") return null;
  if (mode === "unchanged") return session.previous!.prompt;
  return nextPrompt({
    strong,
    first: session.previous === null,
    optionsStrong: judgment.elements.options?.level === "strong",
    lastTestDone: session.lastTestDone,
    raised: session.raised,
    closest: judgment.closest_paths,
    startedClosest: session.first?.closest ?? null,
    order,
  });
}

/**
 * The session after a round. A response too short to judge, or unchanged,
 * isn't kept as a version; only the feedback it got is remembered.
 */
export function afterRound(
  session: SessionState,
  round: { response: string; judgment: Judgment; strong: boolean; mode: Mode; prompt: Prompt | null; feedback: string },
): SessionState {
  const raised = round.prompt?.kind === "challenge" && !session.raised.includes(round.prompt.pathId) ? [...session.raised, round.prompt.pathId] : session.raised;
  const lastTestDone = session.lastTestDone || round.prompt?.kind === "lastTest";
  if (round.mode === "too_short" || round.mode === "unchanged") {
    return { ...session, raised, lastTestDone, lastPrompt: round.prompt, previous: session.previous && { ...session.previous, feedback: round.feedback } };
  }
  return {
    first: session.first ?? { response: round.response, closest: round.judgment.closest_paths[0] ?? null },
    previous: { response: round.response, judgment: round.judgment, strong: round.strong, feedback: round.feedback, prompt: round.prompt },
    rounds: [...session.rounds, { strong: round.strong, patterns: round.judgment.patterns }],
    raised,
    lastTestDone,
    lastPrompt: round.prompt,
  };
}
