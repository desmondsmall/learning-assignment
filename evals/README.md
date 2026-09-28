# Evals

How we know the judge and the coach behave as designed. How to run them and read the results is in `docs/evals.md`.

- `cases.json`: 29 labelled learner responses, each with a level per element, whether it is strong, its limiting pattern and the paths it is closest to; six resubmission sequences, each with what to look for in the coach's feedback; and four closing cases, each a starting point and a final response for the debrief's closing note, with what to look for.
- `run.ts`: runs the judge against the cases and reports agreement with the labels on strong or not, per element, on patterns and paths, and across repeated runs. Then the coach gives feedback on each response, plays each sequence round by round and writes the closing note for each closing case, and every message is checked. `npm run eval`.
- `checks.ts`: the checks on the coach's text: exact quotes, no scores or level names, no path lists, no invented times, at most one question of its own, and length; and on the closing note, a quote from each version, no questions, and at most 70 words. Tested in `checks.test.ts`.
- `baseline/`: the five-repeat run on the current prompts, committed. `summary.md` has the numbers, `feedback.md` every message the coach wrote, closing notes included, for reading, and `results.json` everything behind them. `npm run eval -- --baseline` replaces it; run it when a prompt change is ready to keep, and commit the baseline with the change, so the diff shows what the change did. `npm run eval -- --rescore=baseline` recomputes the summary and the checks from `results.json` without calling the API.
- `comparisons/`: runs kept for reference, such as another model, with the same three files. Committed.
- `results/`: every other run, one folder each, named with `--tag` (`latest` by default). It is gitignored: runs made while iterating stay on the machine that ran them.

Nothing the eval writes is dated; git records when a baseline changed.
