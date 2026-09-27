// Checks made in code on everything the coach writes, for the evals. They're
// heuristics: a flag says where to look, and a person reads the feedback to
// judge it. "Strong" in a phrase like "a strong line", on a response that isn't
// strong, gets flagged even when it's harmless.

import type { Mode } from "@/lib/session";
import { feedbackBudget } from "@/lib/coach";
import { normalise } from "@/lib/rules";

export type Issue = { check: string; detail: string };

// Anything in double quotation marks, straight or curly.
const QUOTED = /"([^"]+)"|“([^”]+)”/g;
const withoutQuotes = (text: string) => text.replace(/"[^"]*"|“[^”]*”/g, "");

const questionsIn = (text: string) =>
  (withoutQuotes(text).match(/[^.?!\n]*\?/g) ?? []).map((q) => normalise(q).toLowerCase());

// Clock times and days of the week, normalised so "4:30 p.m." and "4:30pm" match.
const TIME = /\b(?:\d{1,2}(?::\d{2})?\s*[ap]\.?\s?m\b\.?|\d{1,2}:\d{2}|\d{1,2}\s*o['’]clock|noon|midnight|(?:mon|tues|wednes|thurs|fri|satur|sun)day)/gi;
const timesIn = (text: string) =>
  (text.match(TIME) ?? []).map((m) => m.toLowerCase().replace(/[\s.]/g, "").replace(/’/g, "'").replace(/:00(?=[ap]m)/, ""));

/** Times and days the coach mentions that neither the scenario nor the learner did. */
export function inventedTimes(text: string, sources: string[]) {
  // A time given without a.m. or p.m. matches the same time with one.
  const known = new Set(sources.flatMap(timesIn).flatMap((t) => [t, t.replace(/[ap]m$/, "")]));
  return [...new Set(timesIn(text))].filter((t) => !known.has(t));
}

export type FeedbackContext = {
  response: string;
  previous?: string;
  strong: boolean;
  mode: Mode;
  /** The scenario text, which the coach may also quote. */
  scenario: string;
  /** Anything else the coach may quote, such as the starting point. */
  others?: string[];
  previousFeedback?: string;
};

export function checkFeedback(text: string, ctx: FeedbackContext) {
  const issues: Issue[] = [];
  const own = withoutQuotes(text); // the coach's own words
  const sources = [ctx.response, ctx.previous ?? "", ctx.scenario, ...(ctx.others ?? [])];

  // Quotes must be exact. Single and double quote marks count as the same, since
  // a quote nested inside a quote swaps them, and so does case, since changing
  // the capital at the start of a quote is normal quoting. An ellipsis may join parts.
  const loose = (t: string) => normalise(t).replace(/"/g, "'").toLowerCase();
  const allowed = sources.map(loose).join(" \u0000 ");
  for (const m of text.matchAll(QUOTED)) {
    const quote = m[1] ?? m[2];
    const parts = loose(quote)
      .replace(/^[.,;:!?…\s]+|[.,;:!?…\s]+$/g, "")
      .split(/\.\.\.|…/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (!parts.every((p) => allowed.includes(p))) issues.push({ check: "quote-not-exact", detail: quote });
  }

  const flag = (check: string, pattern: RegExp, source = text) => {
    const found = source.match(pattern);
    if (found) issues.push({ check, detail: found[0] });
  };
  flag("level-word", /\b(beginning|developing)\b/i);
  flag("rubric-language", /\b(rubric|elements?|score[sd]?|grade[sd]?)\b/i);
  flag("number-score", /\b\d+\s*(?:\/|out of|of)\s*\d+\b/i);
  flag("mentions-paths", /\bpaths?\b/i);
  flag("verdict-word", /\b(wrong|unethical|incorrect)\b/i, own);
  if (!ctx.strong && /\bstrong\b/i.test(text)) issues.push({ check: "strong-when-not", detail: "says 'strong' about a response that isn't" });

  const invented = inventedTimes(text, sources);
  if (invented.length) issues.push({ check: "invented-time", detail: invented.join(", ") });

  // Questions the coach asks, not question marks inside the learner's quoted words.
  const questions = (own.match(/\?/g) ?? []).length;
  if (questions > 1) issues.push({ check: "too-many-questions", detail: `${questions} questions` });
  if (ctx.strong && ctx.mode !== "too_short" && questions > 0) issues.push({ check: "questions-when-strong", detail: `${questions} questions` });
  if (ctx.previousFeedback) {
    const before = new Set(questionsIn(ctx.previousFeedback));
    const repeated = questionsIn(text).find((q) => before.has(q));
    if (repeated) issues.push({ check: "repeated-question", detail: repeated });
  }

  const words = text.split(/\s+/).filter(Boolean).length;
  const limit = Math.round(feedbackBudget(ctx.response, ctx.mode) * 1.2);
  if (words > limit) issues.push({ check: "too-long", detail: `${words} words (limit ${limit})` });

  return { issues, words, questions };
}
