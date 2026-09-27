# Evals

How we know the judge agrees with the rubric, and with itself. The coach's feedback will be checked the same way once it is built.

## What the judge is checked against

`evals/cases.json` holds 29 learner responses, each labelled with what the judge should find: a level for each of the six elements, whether the response is strong, the limiting pattern, and the paths it is closest to. They cover:

- the worked example in `experience.md`, one version at a time;
- the three strong examples in `rubric.md`, which take different routes;
- responses that aren't strong, including several near misses on either side of the line, and two too short to judge;
- responses built to test a single rule: a caveat treated as honesty, a stance with no plan, a plan that depends on reaching Marcus, a response that recites ethical theories without acting, and one that tells the judge how to mark it.

The responses and their labels were drafted with an AI model and accepted by a person as the working ground truth. They haven't had an independent human review. So when the judge disagrees with a label, check the label against the descriptors in `rubric.md` before changing the prompt: the fault can be in either, and a model's labels tend to agree with a model's reasoning.

`npm test` also checks the labels against the rule for strong: every response labelled strong must meet the rule, and every response that meets it must be labelled strong.

## What a run reports

`npm run eval` judges every case and writes a `summary.md`, counting every judgment rather than the first repeat of each case, since a case judged right three times in five is a problem one run can hide. It reports:

- **Strong or not.** How many responses the judge puts on the same side of the line as the label, after code applies the rule for strong to its levels. This is the number that matters most: calling a weak response strong ends the coaching early, and withholding strong from a strong one pushes the learner to polish.
- **Element levels.** Exact agreement per element, and any element two levels out (beginning where the label says strong, or the reverse), which should never happen.
- **Patterns.** Whether the labelled pattern is among the one or two the judge names.
- **Paths.** Whether the judge's closest paths overlap the labelled ones. They decide which challenge comes next.
- **Consistency**, with repeats. Whether each response gets the same strong-or-not, and the same level on each element, every time. The judge sees only the current response, so the same response should always get the same judgment.
- **Judge time and dropped quotes.** How long each judgment takes, and how many quotes the exact-match check threw away.
- **Per case**, a table of the verdicts across repeats, with each element's differences from the label and how often they happened.

Beside it, `results.json` holds every judgment: the levels, the quotes each rests on, and what the judge said each element shows and doesn't yet show. That's where to look when a number moves.

## Running it

It needs `ANTHROPIC_API_KEY` in `.env.local`. Every run calls the API and costs money, roughly a dollar per repeat of all 29 cases.

```bash
npm run eval                          # every case, once
npm run eval -- --cases=E08,E09       # a subset while iterating on a prompt
npm run eval -- --repeats=5           # consistency
npm run eval -- --tag=before          # name a run, to compare it with a later one
npm run eval -- --baseline            # five repeats, written to evals/baseline/
npm run eval -- --rescore=baseline    # rescore saved judgments, without the API
```

Runs go to `evals/results/<tag>/`, which is gitignored. The baseline is the exception: `evals/baseline/` is committed, and replaced in the same commit as a prompt change, so the diff shows what the change did to the numbers.
