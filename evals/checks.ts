// Checks made in code on everything the coach writes, for the evals. They're
// heuristics: a flag says where to look, and a person reads the feedback to
// judge it. "Strong" in a phrase like "a strong line", on a response that isn't
// strong, gets flagged even when it's harmless.

import type { Mode } from "@/lib/session";
import { feedbackBudget } from "@/lib/coach";
import { content } from "@/lib/content";
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

// Quotes must be exact. Single and double quote marks count as the same, since
// a quote nested inside a quote swaps them, and so does case, since changing
// the capital at the start of a quote is normal quoting. An ellipsis may join parts.
const loose = (t: string) => normalise(t).replace(/"/g, "'").toLowerCase();
const quoteParts = (quote: string) =>
  loose(quote)
    .replace(/^[.,;:!?…\s]+|[.,;:!?…\s]+$/g, "")
    .split(/\.\.\.|…/)
    .map((p) => p.trim())
    .filter(Boolean);
const quotedFrom = (quote: string, source: string) => quoteParts(quote).every((p) => loose(source).includes(p));

/** The quotes in a text that none of the sources contain. */
function inexactQuotes(text: string, sources: string[]) {
  const allowed = sources.join(" \u0000 ");
  return [...text.matchAll(QUOTED)].map((m) => m[1] ?? m[2]).filter((q) => !quotedFrom(q, allowed));
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

  for (const quote of inexactQuotes(text, sources)) issues.push({ check: "quote-not-exact", detail: quote });

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

export type ClosingContext = { first: string; final: string };

/**
 * The closing note: a quote from each version, exact; at most 70 words; no
 * questions; nothing about paths, levels, the rubric or verdicts.
 */
export function checkClosing(text: string, { first, final }: ClosingContext) {
  const issues: Issue[] = [];
  const own = withoutQuotes(text);
  const quotes = [...text.matchAll(QUOTED)].map((m) => m[1] ?? m[2]);
  for (const quote of inexactQuotes(text, [first, final])) issues.push({ check: "quote-not-exact", detail: quote });
  // Two versions need a quote from each; a single version, a quote from it.
  const versions = normalise(first) === normalise(final) ? [final] : [first, final];
  for (const [i, version] of versions.entries()) {
    if (!quotes.some((q) => quotedFrom(q, version))) issues.push({ check: "missing-quote", detail: versions.length === 1 ? "none from the response" : i === 0 ? "none from the starting point" : "none from the final response" });
  }

  const flag = (check: string, pattern: RegExp) => {
    const found = own.match(pattern);
    if (found) issues.push({ check, detail: found[0] });
  };
  flag("level-word", /\b(beginning|developing)\b/i);
  flag("rubric-language", /\b(rubric|elements?|score[sd]?|grade[sd]?)\b/i);
  flag("mentions-paths", /\bpaths?\b/i);
  flag("verdict-word", /\b(wrong|unethical|incorrect)\b/i);
  const named = content.paths.find((p) => own.toLowerCase().includes(p.name.toLowerCase()));
  if (named) issues.push({ check: "names-a-path", detail: named.name });

  const questions = (own.match(/\?/g) ?? []).length;
  if (questions > 0) issues.push({ check: "questions", detail: `${questions} questions` });
  const words = text.split(/\s+/).filter(Boolean).length;
  if (words > 70) issues.push({ check: "too-long", detail: `${words} words (limit 70)` });

  return { issues, words, questions };
}
