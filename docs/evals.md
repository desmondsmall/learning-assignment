# Evals

How we know the judge agrees with the rubric and with itself, and that the coach's feedback keeps to its rules.

## What the judge is checked against

`evals/cases.json` holds 29 learner responses, each labelled with what the judge should find: a level for each of the six elements, whether the response is strong, the limiting pattern, and the paths it is closest to. They cover:

- the worked example in `experience.md`, one version at a time;
- the three strong examples in `rubric.md`, which take different routes;
- responses that aren't strong, including several near misses on either side of the line, and two too short to judge;
- responses built to test a single rule: a caveat treated as honesty, a stance with no plan, a plan that depends on reaching Marcus, a response that recites ethical theories without acting, and one that tells the judge how to mark it.

The responses and their labels were drafted with an AI model and accepted by a person as the working ground truth. They haven't had an independent human review. One has been corrected since: E05's recognition, where the judge disagreed with the label consistently and the descriptors backed the judge. So when the judge disagrees with a label, check the label against the descriptors in `rubric.md` before changing the prompt: the fault can be in either, and a model's labels tend to agree with a model's reasoning.

`npm test` also checks the labels against the rule for strong: every response labelled strong must meet the rule, and every response that meets it must be labelled strong.

## What the coach is checked on

The coach gives feedback on every labelled response, from the judge's first judgment of it, ending with the prompt the rules in code choose, exactly as the app will. Then it plays six resubmission sequences round by round, keeping the session the app keeps (the starting point, the previous version with its feedback, the patterns so far, the paths raised):

- **Nothing changed**: says so briefly and points to the one thing to work on.
- **Progress**: opens with what changed, quoting before and after.
- **Stuck**, for two rounds and for three: changes the angle each round, moving down the hint ladder, never repeating itself.
- **The worked example**, W1 to W3: names each shift, and calls the final version strong without pushing for polish.
- **An ambiguous revision**: asks which reading the learner means instead of asserting a contradiction.

`evals/checks.ts` checks every message in code: quotes are exact, there are no level names, scores or mentions of paths, "strong" appears only when the response is strong, no times appear that neither the scenario nor the learner gave, the coach asks at most one question of its own and none of a strong response, doesn't repeat a question from its last feedback, and stays within its length budget. They are heuristics: a flag says where to look.

The rest only a person can judge: whether the feedback aims at the right thing, gives the answer away, or sounds like a coach. `feedback.md` has every message for reading, with the response it answers and the prompt it ends with, and each sequence with what to look for.

## What the closing note is checked on

The debrief's closing note is written for four closing cases, each a starting point and a final response, given whether the judge calls the final one strong, as the app does:

- **The worked example**, W1 to W3: names the move from "not really my call" to a plan.
- **From a rule to a plan**, E07 to E09: names the movement in thinking, not just what was added.
- **Stopping before strong**, E04 to a written final that stays stuck: honest about the one thing still open, without pressing the learner to go on.
- **Strong on the first try**, E09 alone: says what it does well and invents no movement.

`checkClosing` in `evals/checks.ts` checks each note: a quote from each version (or from the one version), exact; at most 70 words; no questions; and no paths, level names, rubric words or verdicts. `feedback.md` has every note under "Closing notes", with both versions and what to look for.

## What a run reports

`npm run eval` judges every case and writes a `summary.md`, counting every judgment rather than the first repeat of each case, since a case judged right three times in five is a problem one run can hide. It reports:

- **Strong or not.** How many responses the judge puts on the same side of the line as the label, after code applies the rule for strong to its levels. This is the number that matters most: calling a weak response strong ends the coaching early, and withholding strong from a strong one pushes the learner to polish.
- **Element levels.** Exact agreement per element, and any element two levels out (beginning where the label says strong, or the reverse), which should never happen.
- **Patterns.** Whether the labelled pattern is among the one or two the judge names.
- **Paths.** Whether the judge's closest paths overlap the labelled ones. They decide which challenge comes next.
- **Consistency**, with repeats. Whether each response gets the same strong-or-not, and the same level on each element, every time. The judge sees only the current response, so the same response should always get the same judgment.
- **Judge time and dropped quotes.** How long each judgment takes, and how many quotes the exact-match check threw away.
- **The coach.** How many messages failed a check, which checks, and the time to the coach's first word: the judge, then the coach's first streamed text, which is how long a learner waits.
- **The closing note.** How many notes failed a check, which checks, and each note's length.
- **Per case**, a table of the verdicts across repeats, with each element's differences from the label and how often they happened.

Beside it, `feedback.md` holds every coach message, and `results.json` everything the run produced: every judgment, with the quotes each level rests on and what the judge said each element shows and doesn't yet show, and every coach message with what it was given. That's where to look when a number moves.

## Known disagreements

Four places where the judge disagrees with a label consistently, and the label is right: the judge misapplies a principle its prompt already has. None changes whether a response is strong. They are left as they are rather than fixed with a prompt change that hasn't been through the evals.

- **W1, Voice** (labelled developing, judged beginning every time). "Email the client saying the report is coming Monday" says what a message says, but is vague about the checks, which is developing. The judge reads the vagueness as saying nothing.
- **E02, Action plan** (beginning, judged developing 4 times in 5). One send, with the failed checks left out, is a stance rather than a plan, as the rubric's own example ("send it the way Marcus asked") says. The judge credits it as concrete.
- **E21, Reasoning** (beginning, judged developing every time). What drives the plan is not wanting to send bad news; the truth rule stated alongside it is a floor. The judge credits the rule, the move the rubric's "judge the reason that drives what it does" warns against.
- **E18, too short to judge** (judged too short about half the time). After the note to the marker, which the judge always ignores, what's left is one correct line with no plan. The judge splits on whether that is enough to judge. Either way it is never called strong, and the coach asks for more or gives feedback on the line.

## Choosing the model

The judge and the coach run on Claude Opus 5 at low effort. `evals/comparisons/sonnet-5/` is the same eval on Claude Sonnet 5, kept for reference. Its judge came close to Opus's, a little less accurate and less consistent, but most of its coach's messages failed a check, most often by asking two to four questions where the coach may ask one, and a few by calling a response strong that wasn't. The judge alone wouldn't have shown the difference; the coach is why Opus is used for both. Earlier runs, outside this repo, found low effort as accurate as medium on the judge, and faster.

## Running it

It needs `ANTHROPIC_API_KEY` in `.env.local`. Every run calls the API and costs money: about $0.80 per repeat of the judge on all 29 cases, about $2 for the coach's messages, and about $0.20 for the closing notes.

```bash
npm run eval                          # every case, once
npm run eval -- --cases=E08,E09       # a subset while iterating on a prompt
npm run eval -- --repeats=5           # consistency
npm run eval -- --tag=before          # name a run, to compare it with a later one
npm run eval -- --baseline            # five repeats, written to evals/baseline/
npm run eval -- --judge-only          # the judge alone, cheaper while iterating on it
npm run eval -- --closings-only       # just the closing notes, judging only their final responses
npm run eval -- --rescore=baseline    # rescore saved results, without the API
CLAUDE_MODEL=claude-sonnet-5 npm run eval -- --tag=comparisons/sonnet-5
```

Runs go to `evals/results/<tag>/`, which is gitignored. The baseline is the exception: `evals/baseline/` is committed, and replaced in the same commit as a prompt change, so the diff shows what the change did to the numbers. So is a comparison written to `evals/comparisons/`.
