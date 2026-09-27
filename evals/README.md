# Evals

How we know the coach behaves as designed. How to run them and read the results is in `docs/evals.md`.

- `cases.json`: 29 labelled learner responses, each with a level per element, whether it is strong, its limiting pattern and the paths it is closest to.
- `run.ts`: runs the judge against the cases and reports agreement with the labels on strong or not, per element, on patterns and paths, and across repeated runs. `npm run eval`.
- `baseline/`: the five-repeat run on the current judge prompt, committed: `summary.md` has the numbers, and `results.json` every judgment behind them, with its quotes and reasoning. `npm run eval -- --baseline` replaces it; run it when a prompt change is ready to keep, and commit the baseline with the change, so the diff of `summary.md` shows what the change did. `npm run eval -- --rescore=baseline` recomputes the summary from `results.json` without calling the API.
- `results/`: every other run, one folder each with the same two files, named with `--tag` (`latest` by default). It is gitignored: runs made while iterating stay on the machine that ran them.

Nothing the eval writes is dated; git records when a baseline changed.

Planned, with the coach: resubmission and closing-note cases, checks on everything the coach writes, and the coach's feedback in the baseline for reading.
