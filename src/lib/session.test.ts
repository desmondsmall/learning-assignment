import assert from "node:assert/strict";
import { describe, test } from "node:test";
import type { Judgment, Level } from "./rules";
import { afterRound, modeOf, newSession, promptFor, type SessionState } from "./session";

const ORDER = [1, 4, 5, 6, 3, 2, 7];

function judged(level: Level, closest: number[], assessable = true): Judgment {
  const el = { evidence: [], shows: "", not_yet: "", level };
  const keys = ["recognition", "reasoning", "options", "action_plan", "voice", "reflection"];
  return { assessable, elements: Object.fromEntries(keys.map((k) => [k, el])), patterns: ["topic-not-message"], closest_paths: closest };
}

/** Plays one submission through the session, as the route does. */
function submit(session: SessionState, response: string, judgment: Judgment, strong = false) {
  const mode = modeOf(session, response, judgment);
  const prompt = promptFor(session, mode, judgment, strong, ORDER);
  return { mode, prompt, next: afterRound(session, { response, judgment, strong, mode, prompt, feedback: `feedback on: ${response}` }) };
}

describe("a session", () => {
  test("keeps each judged version, and remembers where the learner started", () => {
    const one = submit(newSession(), "I'd wait for Marcus.", judged("developing", [4]));
    assert.equal(one.mode, "first");
    assert.deepEqual(one.prompt, { kind: "options" });
    const two = submit(one.next, "I'd still wait, and email the client.", judged("developing", [4]));
    assert.equal(two.mode, "revision");
    assert.deepEqual(two.prompt, { kind: "challenge", pathId: 1 });
    assert.equal(two.next.rounds.length, 2);
    assert.deepEqual(two.next.first, { response: "I'd wait for Marcus.", closest: 4 });
    assert.deepEqual(two.next.raised, [1]);
  });

  test("an unchanged resubmission gets the same prompt, and isn't kept as a version", () => {
    const one = submit(newSession(), "I'd wait for Marcus.", judged("developing", [4]));
    const again = submit(one.next, "  I'd wait for  Marcus. ", judged("developing", [4]));
    assert.equal(again.mode, "unchanged");
    assert.deepEqual(again.prompt, one.prompt);
    assert.equal(again.next.rounds.length, 1);
    assert.equal(again.next.previous!.feedback, "feedback on:   I'd wait for  Marcus. ");
  });

  test("a response too short to judge gets no prompt, isn't kept, and clears the last prompt", () => {
    const one = submit(newSession(), "I'd wait for Marcus.", judged("developing", [4]));
    const short = submit(one.next, "idk", judged("beginning", [], false));
    assert.equal(short.mode, "too_short");
    assert.equal(short.prompt, null);
    assert.equal(short.next.rounds.length, 1);
    assert.equal(short.next.lastPrompt, null);
    assert.equal(short.next.previous!.response, "I'd wait for Marcus.");
  });

  test("a strong response gets the last test once", () => {
    const one = submit(newSession(), "A strong plan.", judged("strong", [6]), true);
    assert.deepEqual(one.prompt, { kind: "lastTest" });
    const two = submit(one.next, "A strong plan, revised.", judged("strong", [6]), true);
    assert.equal(two.prompt, null);
  });
});
