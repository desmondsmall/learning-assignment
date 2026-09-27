import assert from "node:assert/strict";
import { describe, test } from "node:test";
import rubric from "../../content/rubric.json";
import cases from "../../evals/cases.json";
import {
  blockingElements,
  isStrong,
  isUnchanged,
  nextPrompt,
  seemsStuck,
  verifyQuotes,
  type Judgment,
  type Level,
  type PromptInput,
} from "./rules";

const rule = rubric.strongRule;
const ORDER = [1, 4, 5, 6, 3, 2, 7];

/** A judgment with the given levels and nothing else. */
function judged(levels: Record<string, string>, assessable = true): Judgment {
  const elements = Object.fromEntries(
    Object.entries(levels).map(([k, level]) => [k, { evidence: [], shows: "", not_yet: "", level: level as Level }]),
  );
  return { assessable, elements, patterns: [], closest_paths: [] };
}

describe("isStrong", () => {
  test("agrees with the label on every labelled response", () => {
    for (const c of cases.responses) {
      if (c.expected.assessable === false) continue;
      assert.equal(isStrong(judged(c.expected.levels!), rule), c.expected.strong, c.id);
    }
  });

  test("a response too short to judge is never strong", () => {
    const allStrong = Object.fromEntries(rubric.elements.map((e) => [e.key, "strong"]));
    assert.equal(isStrong(judged(allStrong, false), rule), false);
  });
});

describe("blockingElements", () => {
  test("lists only the elements short of what strong needs", () => {
    const w1 = cases.responses.find((c) => c.id === "W1")!;
    // W1: recognition, action plan and voice developing; reasoning, options and reflection beginning.
    assert.deepEqual(blockingElements(judged(w1.expected.levels!), rule), [
      "recognition",
      "reasoning",
      "action_plan",
      "voice",
      "options",
      "reflection",
    ]);
    const w3 = cases.responses.find((c) => c.id === "W3")!;
    assert.deepEqual(blockingElements(judged(w3.expected.levels!), rule), []);
  });
});

describe("verifyQuotes", () => {
  const response = "I'd send it tonight.\nMarcus said the fixes are  “small”.";
  const withQuotes = (evidence: string[]): Judgment => ({
    ...judged({ recognition: "developing" }),
    elements: { recognition: { evidence, shows: "", not_yet: "", level: "developing" } },
  });

  test("keeps exact quotes, ignoring curly quote marks and spacing", () => {
    const { judgment, dropped } = verifyQuotes(withQuotes(["I'd send it tonight.", 'the fixes are "small"']), response);
    assert.equal(judgment.elements.recognition.evidence.length, 2);
    assert.deepEqual(dropped, []);
  });

  test("drops paraphrases and empty quotes", () => {
    const { judgment, dropped } = verifyQuotes(withQuotes(["I would send it tonight", ""]), response);
    assert.deepEqual(judgment.elements.recognition.evidence, []);
    assert.equal(dropped.length, 2);
  });
});

describe("nextPrompt", () => {
  const round = (input: Partial<PromptInput>): PromptInput => ({
    strong: false,
    first: false,
    optionsStrong: false,
    lastTestDone: false,
    raised: [],
    closest: [],
    startedClosest: null,
    order: ORDER,
    ...input,
  });

  test("follows the worked example in docs/experience.md", () => {
    // First response, closest to path 4 (hold it): the options question.
    assert.deepEqual(nextPrompt(round({ first: true, closest: [4] })), { kind: "options" });
    // First revision, still closest to 4, nothing raised: the fixed order gives path 1.
    assert.deepEqual(nextPrompt(round({ closest: [4], startedClosest: 4 })), { kind: "challenge", pathId: 1 });
    // Second revision, now closest to 6, path 1 raised: they've moved from 4, so 4 comes first.
    assert.deepEqual(nextPrompt(round({ closest: [6], raised: [1], startedClosest: 4 })), { kind: "challenge", pathId: 4 });
    // Third revision is strong: the last test, once.
    assert.deepEqual(nextPrompt(round({ strong: true, raised: [1, 4] })), { kind: "lastTest" });
    assert.equal(nextPrompt(round({ strong: true, lastTestDone: true })), null);
  });

  test("a first response already strong on Options gets a challenge, not the options question", () => {
    assert.deepEqual(nextPrompt(round({ first: true, optionsStrong: true, closest: [6] })), { kind: "challenge", pathId: 1 });
  });

  test("never challenges with the learner's own position", () => {
    assert.deepEqual(nextPrompt(round({ closest: [1, 4] })), { kind: "challenge", pathId: 5 });
  });

  test("ends with nothing once every other path has been raised", () => {
    assert.equal(nextPrompt(round({ closest: [6], raised: [1, 2, 3, 4, 5, 7] })), null);
  });
});

describe("isUnchanged", () => {
  test("ignores spacing and quote marks, nothing else", () => {
    assert.equal(isUnchanged("I'd send it.", "  I’d send  it. "), true);
    assert.equal(isUnchanged("I'd send it.", "I'd send it tonight."), false);
  });
});

describe("seemsStuck", () => {
  test("the same pattern in the last three versions", () => {
    assert.equal(seemsStuck([["topic-not-message"], ["topic-not-message", "all-or-nothing"], ["topic-not-message"]]), true);
    assert.equal(seemsStuck([["topic-not-message"], ["all-or-nothing"], ["topic-not-message"]]), false);
  });

  test("five versions in all, whatever the patterns", () => {
    assert.equal(seemsStuck([["a"], ["b"], ["c"], ["d"], ["e"]]), true);
    assert.equal(seemsStuck([["a"], ["a"]]), false);
  });
});
