# Evals

How we know the coach behaves as designed.

Planned files:

- `cases.json`: labelled learner responses (a level per element, whether the response is strong, the limiting pattern, the closest path), plus resubmission and closing-note cases.
- `run.ts`: runs the prompts against the cases and writes a results file with:
  - agreement on strong or not strong, for every response;
  - agreement per element;
  - whether the judge gives the same levels across repeated runs;
  - the checks made in code on everything the coach writes: quotes are exact, no scores or level names, no path lists, length and question limits.
- `baseline/`: the full five-repeat run on the current prompts, committed. `summary.md` has the numbers and `feedback.md` every message the coach wrote, for reading. `npm run eval -- --baseline` replaces it; run it when a prompt change is ready to keep, and commit the baseline with the change, so the diff of `summary.md` shows what the change did.
- `results/`: every other run, one folder each, named with `--tag` (`latest` by default). It is gitignored: runs made while iterating stay on the machine that ran them.

Nothing the eval writes is dated; git records when a baseline changed.

Every run calls the API and costs money. Use a single repeat while iterating, and the full five repeats before trusting a result or writing the baseline.
