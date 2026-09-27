// The decisions the app makes in code rather than leaving to a model, so they
// are the same for every learner and can be tested without one. Each is a pure
// function of the rubric, the judge's output and the session so far. What the
// rules are, and why, is in docs/experience.md and docs/rubric.md.

export type Level = "beginning" | "developing" | "strong";

export type ElementJudgment = {
  evidence: string[];
  shows: string;
  not_yet: string;
  level: Level;
};

/** What the judge returns for one response. */
export type Judgment = {
  assessable: boolean;
  elements: Record<string, ElementJudgment>;
  patterns: string[];
  closest_paths: number[];
};

export type StrongRule = { mustBeStrong: string[]; atLeastDeveloping: string[] };

// --- Quotes ---------------------------------------------------------------------

/** Curly quotes and runs of whitespace are normalised before matching; nothing else is. */
export const normalise = (s: string) =>
  s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, " ").trim();

/**
 * Drops every quote the judge gives that isn't an exact substring of the
 * response, so the coach never quotes the learner saying something they didn't.
 */
export function verifyQuotes(judgment: Judgment, response: string) {
  const haystack = normalise(response);
  const dropped: { element: string; quote: string }[] = [];
  const elements: Record<string, ElementJudgment> = {};
  for (const [key, el] of Object.entries(judgment.elements)) {
    const kept = el.evidence.filter((quote) => {
      const q = normalise(quote);
      const ok = q !== "" && haystack.includes(q);
      if (!ok) dropped.push({ element: key, quote });
      return ok;
    });
    elements[key] = { ...el, evidence: kept };
  }
  return { judgment: { ...judgment, elements }, dropped };
}

// --- Strong ---------------------------------------------------------------------

/** The rubric's rule: some elements must be strong, the rest at least developing. */
export function isStrong(judgment: Judgment, rule: StrongRule) {
  if (!judgment.assessable) return false;
  const level = (key: string) => judgment.elements[key].level;
  return rule.mustBeStrong.every((k) => level(k) === "strong") && rule.atLeastDeveloping.every((k) => level(k) !== "beginning");
}

/** The elements standing between a response and strong: the only ones the coach pushes on. */
export function blockingElements(judgment: Judgment, rule: StrongRule) {
  const level = (key: string) => judgment.elements[key].level;
  return [
    ...rule.mustBeStrong.filter((k) => level(k) !== "strong"),
    ...rule.atLeastDeveloping.filter((k) => level(k) === "beginning"),
  ];
}

// --- What the feedback ends with ------------------------------------------------

export type Prompt = { kind: "lastTest" } | { kind: "options" } | { kind: "challenge"; pathId: number };

export type PromptInput = {
  /** Whether the current response is strong, by isStrong. */
  strong: boolean;
  /** Whether this is the learner's first response. */
  first: boolean;
  /** Whether the current response is already strong on Options. */
  optionsStrong: boolean;
  /** Whether the last test has been shown before. */
  lastTestDone: boolean;
  /** Paths already raised as challenges, in any earlier round. */
  raised: number[];
  /** The paths the current response is closest to, by the judge. */
  closest: number[];
  /** The path the learner's starting point was closest to. */
  startedClosest: number | null;
  /** The scenario's authored challenge order. */
  order: number[];
};

/**
 * What a round of feedback ends with, by the rule in docs/experience.md. A
 * response too short to judge, or unchanged since the last version, is handled
 * before this: the first gets nothing, the second the same prompt as last time.
 */
export function nextPrompt(input: PromptInput): Prompt | null {
  if (input.strong) return input.lastTestDone ? null : { kind: "lastTest" };
  if (input.first && !input.optionsStrong) return { kind: "options" };

  // Never a path already raised, and never the learner's own position.
  const candidates = input.order.filter((id) => !input.raised.includes(id) && !input.closest.includes(id));
  if (candidates.length === 0) return null;

  // First choice: where they started, once they've moved away from it. It
  // tests whether the move holds. Otherwise, the authored order.
  const started = input.first ? null : input.startedClosest;
  const pathId = started !== null && candidates.includes(started) ? started : candidates[0];
  return { kind: "challenge", pathId };
}

/** A resubmission that changes nothing but spacing or quote marks isn't a new version. */
export const isUnchanged = (previous: string, next: string) => normalise(previous) === normalise(next);

// --- Stuck ------------------------------------------------------------------------

export const STUCK_ROUNDS = 3;
export const MAX_ROUNDS = 5;

/**
 * Whether to offer the debrief to a learner who hasn't reached strong: the same
 * limiting pattern in the last three versions, or five versions in all. Takes
 * the patterns the judge named for each version, oldest first.
 */
export function seemsStuck(patternsByVersion: string[][]) {
  if (patternsByVersion.length >= MAX_ROUNDS) return true;
  if (patternsByVersion.length < STUCK_ROUNDS) return false;
  const [first, ...others] = patternsByVersion.slice(-STUCK_ROUNDS);
  return first.some((p) => others.every((ps) => ps.includes(p)));
}
