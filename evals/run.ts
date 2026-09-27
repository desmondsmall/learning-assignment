// Runs the judge against the labelled responses in evals/cases.json and reports
// how often it agrees with the labels, and with itself across repeated runs.
// Then the coach gives feedback on each response and plays the resubmission
// sequences round by round, and every message it writes is checked in code.
//
//   npm run eval                          every case, once
//   npm run eval -- --repeats=5           each case five times, for consistency
//   npm run eval -- --cases=E08,E09       a subset
//   npm run eval -- --tag=before          name the run (results/latest by default)
//   npm run eval -- --baseline            five repeats, written to evals/baseline/ (committed)
//   npm run eval -- --rescore=baseline    rescore a saved run without calling the API
//   npm run eval -- --judge-only          skip the coach
//   CLAUDE_MODEL=claude-sonnet-5 npm run eval -- --tag=comparisons/sonnet-5
//                                         another model, kept as a committed comparison
//   options: --concurrency=4 --effort=low --coach-effort=low
//
// Every run that judges calls the API and costs money: roughly a dollar a repeat.

import fs from "node:fs";
import path from "node:path";
import type { Usage } from "@anthropic-ai/sdk/resources/messages";
import { MODEL } from "@/lib/anthropic";
import { coach, promptText, type History, type Mode } from "@/lib/coach";
import { content } from "@/lib/content";
import { judge, type Effort } from "@/lib/judge";
import { isStrong, isUnchanged, nextPrompt, verifyQuotes, type Judgment, type Level, type Prompt } from "@/lib/rules";
import cases from "./cases.json";
import { checkFeedback, type Issue } from "./checks";

type Case = (typeof cases.responses)[number];
type Judged = { id: string; repeat: number; judgment: Judgment; strong: boolean; dropped: number; ms: number; cost: number };
type Failed = { id: string; repeat: number; error: string };
type Run = Judged | Failed;
/** One message from the coach, with what it needs to be checked again later. */
type Coached = {
  id: string;
  response: string;
  mode: Mode;
  strong: boolean;
  prompt: string | null;
  first?: string;
  previous?: string;
  previousFeedback?: string;
  text: string;
  judgeMs: number;
  ms: number;
  firstTextMs: number | null;
  cost: number;
};
type Sequence = { id: string; title: string; note: string; steps: Coached[] } | { id: string; title: string; note: string; error: string };
type Saved = { model: string; effort: Effort; coachEffort?: Effort; repeats: number; runs: Run[]; coached?: (Coached | Failed)[]; sequences?: Sequence[] };

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? "true"];
  }),
);
const rescoring = args.rescore !== undefined;
// The baseline (evals/baseline/) and comparisons (evals/comparisons/<name>/, from
// --tag=comparisons/<name>) are committed; every other run goes to
// evals/results/<tag>/, which is gitignored.
const runDir = (tag: string) =>
  path.join(process.cwd(), "evals", tag === "baseline" || tag.startsWith("comparisons/") ? tag : path.join("results", tag));
const saved: Saved | null = rescoring
  ? JSON.parse(fs.readFileSync(path.join(runDir(args.rescore), "results.json"), "utf8"))
  : null;
const baseline = args.baseline === "true" || args.rescore === "baseline";
const repeats = saved?.repeats ?? (baseline ? 5 : Number(args.repeats ?? 1));
const effort = saved?.effort ?? ((args.effort ?? "low") as Effort);
const coachEffort = saved?.coachEffort ?? ((args["coach-effort"] ?? "low") as Effort);
const judgeOnly = args["judge-only"] === "true";
const concurrency = Number(args.concurrency ?? 4);
const only = args.cases?.split(",");

if (!rescoring && !process.env.ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY isn't set. Add it to .env.local in the repo root.");
  process.exit(1);
}

const ELEMENTS = content.rubric.elements.map((e) => e.key);
const rule = content.rubric.strongRule;
const selected = cases.responses.filter((c) => !only || only.includes(c.id));
const log = (line: string) => process.stdout.write(`${line}\n`);

// List prices per million tokens. Cache writes cost 1.25 times input, reads 0.1 times.
const PRICES: Record<string, { input: number; output: number }> = {
  "claude-opus-5": { input: 5, output: 25 },
  "claude-sonnet-5": { input: 2, output: 10 },
};
const price = PRICES[MODEL] ?? PRICES["claude-opus-5"];
const cost = (u: Usage) =>
  ((u.input_tokens ?? 0) * price.input +
    (u.output_tokens ?? 0) * price.output +
    (u.cache_creation_input_tokens ?? 0) * price.input * 1.25 +
    (u.cache_read_input_tokens ?? 0) * price.input * 0.1) /
  1e6;

async function pool<T, R>(items: T[], fn: (item: T) => Promise<R>) {
  const results: R[] = [];
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

// --- Judge -------------------------------------------------------------------------

function judgeAll(): Promise<Run[]> {
  log(`Model ${MODEL}; judge effort ${effort}; ${selected.length} cases x ${repeats}`);
  const jobs = selected.flatMap((c) => Array.from({ length: repeats }, (_, repeat) => ({ c, repeat })));
  return pool(jobs, async ({ c, repeat }): Promise<Run> => {
    try {
      const out = await judge(c.response, { effort });
      const { judgment, dropped } = verifyQuotes(out.judgment, c.response);
      const strong = isStrong(judgment, rule);
      const want = c.expected.assessable === false ? "too short" : c.expected.strong ? "STRONG" : "not strong";
      const got = !judgment.assessable ? "too short" : strong ? "STRONG" : "not strong";
      log(`  ${c.id}#${repeat} judged ${got} (expected ${want}) in ${(out.ms / 1000).toFixed(1)}s`);
      return { id: c.id, repeat, judgment, strong, dropped: dropped.length, ms: out.ms, cost: cost(out.usage) };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log(`  ${c.id}#${repeat} ERROR ${message}`);
      return { id: c.id, repeat, error: message };
    }
  });
}

// --- Coach -------------------------------------------------------------------------

const scenarioText = content.scenario.text;
const byId = Object.fromEntries(cases.responses.map((c) => [c.id, c]));
const optionsStrong = (j: Judgment) => j.elements.options?.level === "strong";

/**
 * Coaches one version, given the session so far, with the prompt the rules in
 * code choose for it, exactly as the app will.
 */
async function coachOne(id: string, response: string, judged: Judged, mode: Mode, history: History, prompt: Prompt | null): Promise<Coached> {
  const shown = prompt ? promptText(prompt) : null;
  const out = await coach(
    { mode, response, judgment: judged.judgment, strong: judged.strong, history, prompt: shown },
    { effort: coachEffort },
  );
  return {
    id,
    response,
    mode,
    strong: judged.strong,
    prompt: shown,
    first: history.first?.response,
    previous: history.previous?.response,
    previousFeedback: history.previous?.feedback,
    text: out.text,
    judgeMs: judged.ms,
    ms: out.ms,
    firstTextMs: out.firstTextMs,
    cost: cost(out.usage),
  };
}

/** The coach's first feedback on each labelled response, from its first judgment. */
function coachFirsts(runs: Run[]): Promise<(Coached | Failed)[]> {
  const firsts = runs.filter((r): r is Judged => !("error" in r) && r.repeat === 0);
  return pool(firsts, async (judged): Promise<Coached | Failed> => {
    try {
      const j = judged.judgment;
      const prompt = j.assessable
        ? nextPrompt({ strong: judged.strong, first: true, optionsStrong: optionsStrong(j), lastTestDone: false, raised: [], closest: j.closest_paths, startedClosest: null, order: content.scenario.challengeOrder })
        : null;
      const out = await coachOne(judged.id, byId[judged.id].response, judged, j.assessable ? "first" : "too_short", {}, prompt);
      log(`  ${judged.id} coached (${out.text.split(/\s+/).length} words)`);
      return out;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log(`  ${judged.id} coach ERROR ${message}`);
      return { id: judged.id, repeat: 0, error: message };
    }
  });
}

async function judgeOne(id: string, response: string): Promise<Judged> {
  const out = await judge(response, { effort });
  const { judgment, dropped } = verifyQuotes(out.judgment, response);
  return { id, repeat: 0, judgment, strong: isStrong(judgment, rule), dropped: dropped.length, ms: out.ms, cost: cost(out.usage) };
}

/**
 * Plays each resubmission sequence round by round, keeping the session the app
 * keeps: the starting point, the previous version with its judgment and
 * feedback, the patterns from each round, the paths raised, and the prompt the
 * previous feedback ended with.
 */
function playSequences(runs: Run[]): Promise<Sequence[]> {
  const judgedFirst = (id: string) => runs.find((r): r is Judged => r.id === id && r.repeat === 0 && !("error" in r));
  return pool(cases.resubmissions, async (seq): Promise<Sequence> => {
    try {
      const steps: Coached[] = [];
      const history: History = { rounds: [] };
      let first: { response: string; closest: number | null } | null = null;
      let previous: { response: string; judged: Judged; prompt: Prompt | null } | null = null;
      const raised: number[] = [];
      let lastTestDone = false;

      for (const step of seq.steps) {
        const response = "case" in step ? byId[step.case!].response : step.text!;
        const unchanged: boolean = previous !== null && isUnchanged(previous.response, response);
        const judged: Judged = unchanged ? previous!.judged : (("case" in step && judgedFirst(step.case!)) || (await judgeOne(seq.id, response)));
        const j = judged.judgment;
        const mode: Mode = !j.assessable ? "too_short" : unchanged ? "unchanged" : previous ? "revision" : "first";
        const prompt: Prompt | null =
          mode === "too_short"
            ? null
            : mode === "unchanged"
              ? previous!.prompt
              : nextPrompt({ strong: judged.strong, first: !previous, optionsStrong: optionsStrong(j), lastTestDone, raised, closest: j.closest_paths, startedClosest: first?.closest ?? null, order: content.scenario.challengeOrder });

        const out = await coachOne(seq.id, response, judged, mode, { ...history, rounds: [...history.rounds!] }, prompt);
        steps.push(out);

        if (prompt?.kind === "challenge" && !raised.includes(prompt.pathId)) raised.push(prompt.pathId);
        if (prompt?.kind === "lastTest") lastTestDone = true;
        history.lastPrompt = prompt ? promptText(prompt) : undefined;
        if (j.assessable && !unchanged) {
          history.rounds!.push({ strong: judged.strong, patterns: j.patterns });
          history.previous = { response, judgment: j, strong: judged.strong, feedback: out.text };
          previous = { response, judged, prompt };
          first ??= { response, closest: j.closest_paths[0] ?? null };
          history.first = { response: first.response };
        } else if (history.previous) {
          history.previous = { ...history.previous, feedback: out.text };
        }
      }
      log(`  ${seq.id} coached ${steps.length} rounds`);
      return { id: seq.id, title: seq.title, note: seq.note, steps };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log(`  ${seq.id} ERROR ${message}`);
      return { id: seq.id, title: seq.title, note: seq.note, error: message };
    }
  });
}

/** The checks, run on saved text every time, so a rescore uses the current checks. */
const checksOn = (c: Coached) =>
  checkFeedback(c.text, {
    response: c.response,
    previous: c.previous,
    strong: c.strong,
    mode: c.mode,
    scenario: scenarioText,
    others: c.first ? [c.first] : [],
    previousFeedback: c.previousFeedback,
  });

async function main() {
  const runs: Run[] = rescoring ? saved!.runs.filter((r) => selected.some((c) => c.id === r.id)) : await judgeAll();
  if (rescoring) log(`Rescoring ${args.rescore}: ${runs.length} judgments`);
  // The sequences draw on several cases, so they run only on the full set.
  const coached: (Coached | Failed)[] = rescoring ? (saved!.coached ?? []) : judgeOnly ? [] : await coachFirsts(runs);
  const sequences: Sequence[] = rescoring ? (saved!.sequences ?? []) : judgeOnly || only ? [] : await playSequences(runs);
  // A rescored run covers only the cases it judged.
  const judgedCases = rescoring ? selected.filter((c) => runs.some((r) => r.id === c.id)) : selected;

  // --- Score -------------------------------------------------------------------------
  // Every judgment counts, not just the first repeat of each case: a case the
  // judge gets right three times in five is a problem the first run can hide.

  const ABBR: Record<Level, string> = { beginning: "B", developing: "D", strong: "S" };
  const RANK: Record<Level, number> = { beginning: 0, developing: 1, strong: 2 };
  const ok = runs.filter((r): r is Judged => !("error" in r));
  const errors = runs.filter((r): r is Failed => "error" in r);

  type Verdict = "too short" | "not strong" | "strong";
  const judgedVerdict = (r: Judged): Verdict => (!r.judgment.assessable ? "too short" : r.strong ? "strong" : "not strong");
  const labelVerdict = (c: Case): Verdict => (c.expected.assessable === false ? "too short" : c.expected.strong ? "strong" : "not strong");
  const labelLevel = (c: Case, k: string) => c.expected.levels![k as keyof NonNullable<Case["expected"]["levels"]>] as Level;
  const tally = (items: string[]) =>
    Object.entries(items.reduce<Record<string, number>>((n, x) => ({ ...n, [x]: (n[x] ?? 0) + 1 }), {}))
      .sort((a, b) => b[1] - a[1])
      .map(([x, n]) => `${x} ${n}/${items.length}`)
      .join(", ");

  const rows = judgedCases.map((c) => {
    const mine = ok.filter((r) => r.id === c.id);
    const labelled = c.expected.assessable !== false;
    const verdictHits = mine.filter((r) => judgedVerdict(r) === labelVerdict(c)).length;
    const elementHits = labelled ? mine.reduce((n, r) => n + ELEMENTS.filter((k) => r.judgment.elements[k].level === labelLevel(c, k)).length, 0) : 0;
    // Each element's wrong levels across repeats, such as "voice D→B 5/5".
    const diffs = labelled
      ? ELEMENTS.flatMap((k) => {
          const wrong = mine.map((r) => r.judgment.elements[k].level).filter((l) => l !== labelLevel(c, k));
          return wrong.length ? [`${k} ${ABBR[labelLevel(c, k)]}→${[...new Set(wrong)].map((l) => ABBR[l]).join("/")} ${wrong.length}/${mine.length}`] : [];
        })
      : [];
    const twoOut = labelled
      ? ELEMENTS.filter((k) => mine.some((r) => Math.abs(RANK[r.judgment.elements[k].level] - RANK[labelLevel(c, k)]) === 2))
      : [];
    const patternHits = labelled && c.expected.patterns?.length ? mine.filter((r) => r.judgment.patterns.slice(0, 2).includes(c.expected.patterns![0])).length : null;
    const pathHits = labelled && c.expected.paths?.length ? mine.filter((r) => r.judgment.closest_paths.some((p) => c.expected.paths!.includes(p))).length : null;
    const stableVerdict = mine.every((r) => judgedVerdict(r) === judgedVerdict(mine[0]));
    const stableElements = ELEMENTS.filter((k) => mine.every((r) => r.judgment.elements[k].level === mine[0].judgment.elements[k].level)).length;
    return { c, mine, verdictHits, elementHits, diffs, twoOut, patternHits, pathHits, stableVerdict, stableElements };
  });

  const scored = rows.filter((r) => r.mine.length > 0);
  const labelledRows = scored.filter((r) => r.c.expected.assessable !== false);
  const judgments = scored.reduce((n, r) => n + r.mine.length, 0);
  const sum = (f: (r: (typeof rows)[number]) => number) => scored.reduce((n, r) => n + f(r), 0);
  const elementJudgments = labelledRows.reduce((n, r) => n + r.mine.length, 0);
  const perElement = ELEMENTS.map((k) => `${k} ${labelledRows.reduce((n, r) => n + r.mine.filter((m) => m.judgment.elements[k].level === labelLevel(r.c, k)).length, 0)}/${elementJudgments}`);
  const patternRows = scored.filter((r) => r.patternHits !== null);
  const pathRows = scored.filter((r) => r.pathHits !== null);
  const times = ok.map((r) => r.ms).sort((a, b) => a - b);
  const pct = (p: number) => (times.length ? times[Math.min(times.length - 1, Math.floor(p * times.length))] : 0);
  const secs = (ms: number) => `${(ms / 1000).toFixed(1)}s`;
  const every = repeats > 1 ? `; right on every repeat for ${scored.filter((r) => r.verdictHits === r.mine.length).length}/${scored.length} cases` : "";

  // The coach's messages: the first feedback on each case, then every round of every sequence.
  const firstMessages = coached.filter((c): c is Coached => !("error" in c));
  const sequenceMessages = sequences.flatMap((q) => ("steps" in q ? q.steps.map((st, i) => ({ ...st, id: `${q.id} round ${i + 1}` })) : []));
  const messages = [...firstMessages, ...sequenceMessages].map((m) => ({ ...m, checks: checksOn(m) }));
  const coachCost = messages.reduce((n, m) => n + m.cost, 0);
  const totalCost = ok.reduce((n, r) => n + r.cost, 0) + coachCost;

  const summary = [
    "# Eval results",
    "",
    `Model \`${saved?.model ?? MODEL}\`, judge effort \`${effort}\`, ${judgedCases.length} cases x ${repeats} repeat(s)${messages.length ? `; coach effort \`${coachEffort}\`, ${messages.length} messages` : ""}. Estimated cost $${totalCost.toFixed(2)}.`,
    "",
    "Every count is over all judgments, not just the first repeat of each case.",
    "",
    "## Headline",
    "",
    `- **Strong or not (or too short): ${sum((r) => r.verdictHits)}/${judgments} judgments match the label${every}.**`,
    `- Element levels: ${sum((r) => r.elementHits)}/${elementJudgments * ELEMENTS.length} match (${perElement.join(", ")}).`,
    `- Two levels out: ${scored.flatMap((r) => r.twoOut.map((k) => `${r.c.id} ${k}`)).join("; ") || "none"}.`,
    `- Primary pattern in the judge's top two: ${patternRows.reduce((n, r) => n + r.patternHits!, 0)}/${patternRows.reduce((n, r) => n + r.mine.length, 0)}.`,
    `- Closest path overlaps: ${pathRows.reduce((n, r) => n + r.pathHits!, 0)}/${pathRows.reduce((n, r) => n + r.mine.length, 0)}.`,
  ];
  if (repeats > 1) {
    summary.push(
      `- Consistency across ${repeats} repeats: the same verdict every time on ${scored.filter((r) => r.stableVerdict).length}/${scored.length} cases; the same level every time on ${sum((r) => r.stableElements)}/${scored.length * ELEMENTS.length} elements.`,
    );
  }
  summary.push(
    `- Judge time: median ${secs(pct(0.5))}, 90th percentile ${secs(pct(0.9))}.`,
    `- Quotes dropped by the exact-match check: ${ok.reduce((n, r) => n + r.dropped, 0)}.`,
  );
  if (errors.length) summary.push(`- Errors: ${errors.map((r) => `${r.id}#${r.repeat}: ${r.error}`).join("; ")}`);

  if (messages.length) {
    const failed = messages.filter((m) => m.checks.issues.length);
    const byCheck = tally(failed.flatMap((m) => m.checks.issues.map((i) => i.check)));
    const firstWord = firstMessages.filter((m) => m.firstTextMs !== null).map((m) => m.judgeMs + m.firstTextMs!).sort((a, b) => a - b);
    const at = (arr: number[], p: number) => (arr.length ? arr[Math.min(arr.length - 1, Math.floor(p * arr.length))] : 0);
    const coachErrors = [...coached.filter((c): c is Failed => "error" in c), ...sequences.filter((q) => "error" in q)];
    summary.push(
      "",
      "## The coach",
      "",
      `The coach's first feedback on each case, and every round of ${sequences.length} resubmission sequences, all checked in code. The checks are heuristics: a flag says where to look, and \`feedback.md\` has every message to read.`,
      "",
      `- **Messages with a failed check: ${failed.length}/${messages.length}.**${byCheck ? ` By check: ${byCheck.replace(/ (\d+)\/\d+/g, " $1")}.` : ""}`,
      `- Time to the coach's first word, judge then coach: median ${secs(at(firstWord, 0.5))}, 90th percentile ${secs(at(firstWord, 0.9))}.`,
    );
    if (coachErrors.length) summary.push(`- Errors: ${coachErrors.map((c) => `${c.id}: ${"error" in c ? c.error : ""}`).join("; ")}`);
    if (failed.length) {
      summary.push("", "| Message | Failed checks |", "| --- | --- |");
      for (const m of failed) summary.push(`| ${m.id} | ${m.checks.issues.map((i: Issue) => `${i.check} (${i.detail.replace(/\|/g, "/")})`).join("; ")} |`);
    }
  }

  summary.push(
    "",
    "## Per case",
    "",
    "Patterns and paths are from the first repeat.",
    "",
    "| Case | Expected | Verdicts | Element differences (expected → judged, how often) | Patterns | Paths |",
    "| --- | --- | --- | --- | --- | --- |",
  );
  for (const r of rows) {
    if (!r.mine.length) {
      summary.push(`| ${r.c.id} | | error | | | |`);
      continue;
    }
    const e = r.c.expected;
    const want = e.assessable === false ? "too short" : ELEMENTS.map((k) => ABBR[labelLevel(r.c, k)]).join("") + (e.strong ? " ★" : "");
    const verdicts = tally(r.mine.map(judgedVerdict));
    const flagged = r.verdictHits === r.mine.length ? verdicts : `**${verdicts}**`;
    const j = r.mine[0].judgment;
    summary.push(
      `| ${r.c.id} | ${want} | ${flagged} | ${r.diffs.join(", ")} | ${j.patterns.join(", ")} (want ${e.patterns?.join(", ") || "none"}) | ${j.closest_paths.join(", ")} (want ${e.paths?.join(", ") || "–"}) |`,
    );
  }
  summary.push("", `Levels are in element order: ${ELEMENTS.join(", ")}. B beginning, D developing, S strong; ★ strong overall. A verdict in bold doesn't match the label every time.`);

  // --- Write -------------------------------------------------------------------------

  // Every coach message, for a person to read: the numbers can't say whether the
  // feedback aims at the right thing or sounds like a coach.
  const quote = (text: string) => text.split("\n").map((l) => `> ${l}`);
  const checked = (m: Coached) => {
    const issues = checksOn(m).issues;
    return issues.length ? [`*Checks:* ${issues.map((i) => `${i.check} (${i.detail})`).join("; ")}`, ""] : [];
  };
  const feedback = ["# The coach's feedback", "", "Every message the coach wrote in this run, for reading.", "", "## First feedback on each case", ""];
  for (const m of firstMessages) {
    feedback.push(`### ${m.id}. ${byId[m.id].title}`, "", ...quote(m.response), "");
    feedback.push(`*${m.strong ? "Strong" : m.mode === "too_short" ? "Too short to judge" : "Not strong"}.${m.prompt ? ` Ends with: "${m.prompt}"` : ""}*`, "");
    feedback.push(m.text, "", ...checked(m));
  }
  feedback.push("## Resubmission sequences", "");
  for (const q of sequences) {
    if (!("steps" in q)) continue;
    feedback.push(`### ${q.id}. ${q.title}`, "", `*What to look for: ${q.note}*`, "");
    q.steps.forEach((m, i) => {
      feedback.push(`#### Round ${i + 1}: ${m.mode.replace("_", " ")}${m.strong ? ", strong" : ""}`, "", ...quote(m.response), "");
      if (m.prompt) feedback.push(`*Ends with: "${m.prompt}"*`, "");
      feedback.push(m.text, "", ...checked(m));
    });
  }

  // The summary, the feedback, and everything they were scored from, so a run
  // can be rescored without calling the API.
  const outDir = runDir(baseline ? "baseline" : (args.tag ?? args.rescore ?? "latest"));
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "summary.md"), summary.join("\n") + "\n");
  if (messages.length) fs.writeFileSync(path.join(outDir, "feedback.md"), feedback.join("\n").trimEnd() + "\n");
  if (!rescoring) {
    const results: Saved = { model: MODEL, effort, coachEffort, repeats, runs, coached, sequences };
    fs.writeFileSync(path.join(outDir, "results.json"), JSON.stringify(results, null, 2) + "\n");
  }
  log("");
  log(summary.slice(0, summary.indexOf("## Per case")).join("\n"));
  log(`\nWritten to ${path.relative(process.cwd(), outDir)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
