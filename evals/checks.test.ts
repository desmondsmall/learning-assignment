import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { checkFeedback, inventedTimes } from "./checks";

const scenario = "It is 4:30 p.m. on a Friday afternoon. The client is presenting to their board on Monday morning.";
const response = "I'd send the report tonight with the two failed checks shown, and email Marcus to explain.";
const check = (text: string, strong = false) => checkFeedback(text, { response, strong, mode: "first", scenario }).issues.map((i) => i.check);

describe("checkFeedback", () => {
  test("passes feedback that quotes exactly and asks one question", () => {
    assert.deepEqual(check('You\'d "send the report tonight with the two failed checks shown". What would your email to Marcus tell him?'), []);
  });

  test("flags a paraphrase in quotation marks", () => {
    assert.deepEqual(check('You said you would "send it tonight".'), ["quote-not-exact"]);
  });

  test("accepts curly quotes, a changed capital and an ellipsis joining parts", () => {
    assert.deepEqual(check("“I'd send the report tonight … and email Marcus to explain.”"), []);
  });

  test("flags level words, scores, paths and verdicts", () => {
    assert.deepEqual(check("Your voice is developing, about 4 out of 6."), ["level-word", "number-score"]);
    assert.deepEqual(check("There's another path here. That would be wrong."), ["mentions-paths", "verdict-word"]);
  });

  test("flags 'strong' on a response that isn't, and questions on one that is", () => {
    assert.deepEqual(check("This is strong."), ["strong-when-not"]);
    assert.deepEqual(check("This is strong. Anything else?", true), ["questions-when-strong"]);
  });

  test("counts only the coach's own questions", () => {
    assert.deepEqual(check("Who needs to know? And when?"), ["too-many-questions"]);
  });
});

describe("inventedTimes", () => {
  test("allows the scenario's and the learner's times, however they're written", () => {
    assert.deepEqual(inventedTimes("Before 4:30pm on Friday, or first thing Monday.", [scenario]), []);
  });

  test("flags times neither of them gave", () => {
    assert.deepEqual(inventedTimes("At 4:45, or by 9 a.m. on Saturday.", [scenario]), ["4:45", "9am", "saturday"]);
  });
});
