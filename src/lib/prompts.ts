import "server-only";
import fs from "node:fs";
import path from "node:path";
import { content } from "./content";

// Prompt templates live in prompts/ as Markdown, with {{placeholders}} filled
// from content/. A placeholder with no value is an error, so a renamed field
// can't quietly leave a gap in a prompt.

export function readPrompt(name: string) {
  return fs.readFileSync(path.join(process.cwd(), "prompts", `${name}.md`), "utf8");
}

export function fill(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    if (!(key in vars)) throw new Error(`Prompt placeholder {{${key}}} has no value`);
    return vars[key];
  });
}

const { scenario, rubric, paths } = content;
const elementName = (key: string) => rubric.elements.find((e) => e.key === key)!.name;
const list = (items: string[]) => (items.length > 1 ? `${items.slice(0, -1).join(", ")} and ${items.at(-1)}` : items[0]);

/** The content, rendered as the Markdown the prompts expect. */
export const contentVars: Record<string, string> = {
  scenario: `${scenario.text}\n\n${scenario.question}`,
  principles: rubric.principles.map((p) => `- ${p}`).join("\n"),
  elements: rubric.elements
    .map(
      (e) =>
        `### ${e.name}: ${e.focus}\n\n` +
        `- **Beginning.** ${e.levels.beginning}\n` +
        `- **Developing.** ${e.levels.developing}\n` +
        `- **Strong.** ${e.levels.strong}\n\n` +
        `Key: \`${e.key}\``,
    )
    .join("\n\n"),
  strong_rule: `${list(rubric.strongRule.mustBeStrong.map(elementName))} must be strong, and ${list(rubric.strongRule.atLeastDeveloping.map(elementName))} at least developing`,
  patterns: rubric.patterns.map((p) => `- \`${p.key}\`: "${p.text}"`).join("\n"),
  paths: paths.map((p) => `- **${p.id}. ${p.name}.** ${p.summary}`).join("\n"),
};
