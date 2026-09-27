// Runs the judge against the labelled responses in evals/cases.json and reports
// how often it agrees with the labels, and with itself across repeated runs.
//
//   npm run eval                          every case, once
//   npm run eval -- --repeats=5           each case five times, for consistency
//   npm run eval -- --cases=E08,E09       a subset
//   npm run eval -- --tag=before          name the run (results/latest by default)
//   npm run eval -- --baseline            five repeats, written to evals/baseline/ (committed)
//   npm run eval -- --rescore=baseline    rescore a saved run without calling the API
//   options: --concurrency=4 --effort=low
//
// Every run that judges calls the API and costs money: roughly a dollar a repeat.

import fs from "node:fs";
import path from "node:path";
import type { Usage } from "@anthropic-ai/sdk/resources/messages";
import { MODEL } from "@/lib/anthropic";
import { content } from "@/lib/content";
import { judge, type Effort } from "@/lib/judge";
import { isStrong, verifyQuotes, type Judgment, type Level } from "@/lib/rules";
import cases from "./cases.json";

type Case = (typeof cases.responses)[number];
type Judged = { id: string; repeat: number; judgment: Judgment; strong: boolean; dropped: number; ms: number; cost: number };
type Failed = { id: string; repeat: number; error: string };
type Run = Judged | Failed;
type Saved = { model: string; effort: Effort; repeats: number; runs: Run[] };

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? "true"];
  }),
);
const rescoring = args.rescore !== undefined;
// The baseline is committed in evals/baseline/; every other run goes to evals/results/<tag>/, which is gitignored.
const runDir = (tag: string) => path.join(process.cwd(), "evals", tag === "baseline" ? "baseline" : path.join("results", tag));
const saved: Saved | null = rescoring
  ? JSON.parse(fs.readFileSync(path.join(runDir(args.rescore), "results.json"), "utf8"))
  : null;
const baseline = args.baseline === "true" || args.rescore === "baseline";
const repeats = saved?.repeats ?? (baseline ? 5 : Number(args.repeats ?? 1));
const effort = saved?.effort ?? ((args.effort ?? "low") as Effort);
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

// Claude Opus 5 list prices per million tokens; only an estimate for other models.
const PRICE = { input: 5, output: 25, cacheWrite: 6.25, cacheRead: 0.5 };
const cost = (u: Usage) =>
  ((u.input_tokens ?? 0) * PRICE.input +
    (u.output_tokens ?? 0) * PRICE.output +
    (u.cache_creation_input_tokens ?? 0) * PRICE.cacheWrite +
    (u.cache_read_input_tokens ?? 0) * PRICE.cacheRead) /
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

async function main() {
  const runs: Run[] = rescoring ? saved!.runs.filter((r) => selected.some((c) => c.id === r.id)) : await judgeAll();
  if (rescoring) log(`Rescoring ${args.rescore}: ${runs.length} judgments`);
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

  const summary = [
    "# Judge eval results",
    "",
    `Model \`${saved?.model ?? MODEL}\`, judge effort \`${effort}\`, ${judgedCases.length} cases x ${repeats} repeat(s). Estimated cost $${ok.reduce((n, r) => n + r.cost, 0).toFixed(2)}.`,
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

  // The summary, and every judgment it was scored from, so a run can be rescored
  // without calling the API.
  const outDir = runDir(baseline ? "baseline" : (args.tag ?? args.rescore ?? "latest"));
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "summary.md"), summary.join("\n") + "\n");
  if (!rescoring) fs.writeFileSync(path.join(outDir, "results.json"), JSON.stringify({ model: MODEL, effort, repeats, runs }, null, 2) + "\n");
  log("");
  log(summary.slice(0, 14).join("\n"));
  log(`\nWritten to ${path.relative(process.cwd(), outDir)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
