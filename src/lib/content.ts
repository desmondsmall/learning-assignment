import "server-only";
import { z } from "zod";
import scenarioJson from "../../content/scenario.json";
import rubricJson from "../../content/rubric.json";
import pathsJson from "../../content/paths.json";
import lastTestJson from "../../content/last-test.json";

// The authored content in content/, checked when the server loads it. The
// files are imported rather than read from disk, so they ship with the build.
// Schemas are strict: a missing field, a misspelled one or a wrong type stops
// the app with an error naming the file and the field, rather than reaching a
// learner.

const text = z.string().trim().min(1);

const Scenario = z.strictObject({
  id: text,
  title: text,
  text: text,
  question: text,
  // The question the first round of feedback ends with.
  optionsQuestion: text,
  // Path ids, in the order challenges are offered after the rules in code.
  challengeOrder: z.array(z.int()).min(1),
  // What the scenario settles, so the coach doesn't reopen it.
  settled: text,
  // What it leaves open on purpose; the coach never settles these, or asks the learner to.
  leftOpen: z.array(text).min(1),
  // Every time the scenario gives; the coach adds no others.
  times: z.array(text).min(1),
});

const Rubric = z.strictObject({
  principles: z.array(text).min(1),
  elements: z
    .array(
      z.strictObject({
        key: text,
        name: text,
        focus: text,
        levels: z.strictObject({ beginning: text, developing: text, strong: text }),
      }),
    )
    .min(1),
  strongRule: z.strictObject({
    mustBeStrong: z.array(text),
    atLeastDeveloping: z.array(text),
  }),
  patterns: z.array(z.strictObject({ key: text, text: text, limits: z.array(text).min(1) })).min(1),
});

const Paths = z
  .array(
    z.strictObject({
      id: z.int(),
      name: text,
      // What the judge reads to find the path a response is closest to.
      summary: text,
      // Shown as written at the end of the feedback.
      challenge: text,
      // The account shown in the debrief.
      mostLikely: text,
      couldAlsoHappen: text,
      cost: text,
      protected: text,
    }),
  )
  .min(1);

const LastTest = z.strictObject({
  name: text,
  whatHappens: text,
  coachAsks: text,
});

export type Scenario = z.infer<typeof Scenario>;
export type Rubric = z.infer<typeof Rubric>;
export type Path = z.infer<typeof Paths>[number];
export type LastTest = z.infer<typeof LastTest>;

function parse<T>(file: string, schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) throw new Error(`content/${file} is invalid:\n${z.prettifyError(result.error)}`);
  return result.data;
}

// Checks that span files: every key and id one file uses must exist in another.
function checkReferences(scenario: Scenario, rubric: Rubric, paths: Path[]) {
  const problems: string[] = [];
  const elementKeys = new Set(rubric.elements.map((e) => e.key));
  const pathIds = new Set(paths.map((p) => p.id));
  const unique = (label: string, values: (string | number)[]) => {
    const dupes = values.filter((v, i) => values.indexOf(v) !== i);
    if (dupes.length) problems.push(`${label} repeats ${[...new Set(dupes)].join(", ")}`);
  };

  unique("rubric.json elements", rubric.elements.map((e) => e.key));
  unique("rubric.json patterns", rubric.patterns.map((p) => p.key));
  unique("paths.json ids", paths.map((p) => p.id));
  unique("scenario.json challengeOrder", scenario.challengeOrder);

  const { mustBeStrong, atLeastDeveloping } = rubric.strongRule;
  for (const key of [...mustBeStrong, ...atLeastDeveloping]) {
    if (!elementKeys.has(key)) problems.push(`rubric.json strongRule names "${key}", which isn't an element`);
  }
  for (const key of elementKeys) {
    if (!mustBeStrong.includes(key) && !atLeastDeveloping.includes(key)) {
      problems.push(`rubric.json strongRule doesn't say what element "${key}" needs`);
    }
  }
  for (const pattern of rubric.patterns) {
    for (const key of pattern.limits) {
      if (!elementKeys.has(key)) problems.push(`rubric.json pattern "${pattern.key}" limits "${key}", which isn't an element`);
    }
  }
  for (const id of scenario.challengeOrder) {
    if (!pathIds.has(id)) problems.push(`scenario.json challengeOrder has ${id}, which isn't a path in paths.json`);
  }
  for (const id of pathIds) {
    if (!scenario.challengeOrder.includes(id)) problems.push(`scenario.json challengeOrder leaves out path ${id}`);
  }

  if (problems.length) throw new Error(`content/ is inconsistent:\n- ${problems.join("\n- ")}`);
}

function load() {
  const scenario = parse("scenario.json", Scenario, scenarioJson);
  const rubric = parse("rubric.json", Rubric, rubricJson);
  const paths = parse("paths.json", Paths, pathsJson);
  const lastTest = parse("last-test.json", LastTest, lastTestJson);
  checkReferences(scenario, rubric, paths);
  return { scenario, rubric, paths, lastTest };
}

export const content = load();

export function pathById(id: number): Path {
  const path = content.paths.find((p) => p.id === id);
  if (!path) throw new Error(`No path with id ${id}`);
  return path;
}
