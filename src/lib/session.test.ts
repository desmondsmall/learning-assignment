import assert from "node:assert/strict";
import { describe, test } from "node:test";
import type { Judgment, Level } from "./rules";
import { afterRound, debriefOffer, modeOf, newSession, promptFor, type SessionState } from "./session";

const ORDER = [1, 4, 5, 6, 3, 2, 7];

function judged(level: Level, closest: number[], assessable = true, patterns = ["topic-not-message"]): Judgment {
  const el = { evidence: [], shows: "", not_yet: "", level };
  const keys = ["recognition", "reasoning", "options", "action_plan", "voice", "reflection"];
  return { assessable, elements: Object.fromEntries(keys.map((k) => [k, el])), patterns, closest_paths: closest };
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

describe("the debrief", () => {
  /** Plays a list of submissions from a new session. */
  const play = (steps: { text: string; judgment: Judgment; strong?: boolean }[]) =>
    steps.reduce((session, s) => submit(session, s.text, s.judgment, s.strong).next, newSession());

  test("is closed until a version is strong, then stays open", () => {
    const one = play([{ text: "A first try.", judgment: judged("developing", [4]) }]);
    assert.equal(debriefOffer(one), null);
    const strong = play([
      { text: "A first try.", judgment: judged("developing", [4]) },
      { text: "A strong plan.", judgment: judged("strong", [6], true, []), strong: true },
      { text: "A strong plan, undone.", judgment: judged("developing", [1]) },
    ]);
    assert.equal(debriefOffer(strong), "strong");
  });

  test("opens when the learner seems stuck, and stays open when the pattern changes", () => {
    const three = play(["One.", "Two.", "Three."].map((text) => ({ text, judgment: judged("developing", [4]) })));
    assert.equal(debriefOffer(three), "stuck");
    const four = play([
      ...["One.", "Two.", "Three."].map((text) => ({ text, judgment: judged("developing", [4]) })),
      { text: "Four.", judgment: judged("developing", [4], true, ["all-or-nothing"]) },
    ]);
    assert.equal(debriefOffer(four), "stuck");
  });

  test("doesn't count submissions that aren't kept as versions", () => {
    const session = play([
      { text: "One.", judgment: judged("developing", [4]) },
      { text: "One.", judgment: judged("developing", [4]) },
      { text: "idk", judgment: judged("beginning", [], false) },
    ]);
    assert.equal(debriefOffer(session), null);
  });
});
