# Eval results

Model `claude-opus-5`, judge effort `low`, 29 cases x 5 repeat(s); coach effort `low`, 43 messages and 4 closing notes. Estimated cost $4.81.

Every count is over all judgments, not just the first repeat of each case.

## Headline

- **Strong or not (or too short): 137/145 judgments match the label; right on every repeat for 26/29 cases.**
- Element levels: 777/810 match (recognition 131/135, reasoning 130/135, options 127/135, action_plan 130/135, voice 124/135, reflection 135/135).
- Two levels out: none.
- Primary pattern in the judge's top two: 85/85.
- Closest path overlaps: 125/125.
- Consistency across 5 repeats: the same verdict every time on 26/29 cases; the same level every time on 155/174 elements.
- Judge time: median 12.0s, 90th percentile 16.5s.
- Quotes dropped by the exact-match check: 10.

## The coach

The coach's first feedback on each case, and every round of 6 resubmission sequences, all checked in code. The checks are heuristics: a flag says where to look, and `feedback.md` has every message to read.

- **Messages with a failed check: 5/43.** By check: mentions-paths 2, too-many-questions 1, invented-time 1, verdict-word 1.
- Time to the coach's first word, judge then coach: median 12.9s, 90th percentile 17.9s.

| Message | Failed checks |
| --- | --- |
| A | mentions-paths (paths) |
| E02 | too-many-questions (2 questions) |
| E13 | mentions-paths (paths) |
| RS2 round 2 | invented-time (saturday) |
| RS5 round 3 | verdict-word (wrong) |

## The closing note

The debrief's note on what moved, for each of 4 closing cases, given whether the judge calls the final response strong. Checked in code: a quote from each version, exact, at most 70 words, and no questions, paths, levels or verdicts.

- **Notes with a failed check: 0/4.**
- Length: CL1 65, CL2 67, CL3 68, CL4 66 words.

## Per case

Patterns and paths are from the first repeat.

| Case | Expected | Verdicts | Element differences (expected → judged, how often) | Patterns | Paths |
| --- | --- | --- | --- | --- | --- |
| W1 | DBBDDB | not strong 5/5 | options B→D 1/5, voice D→B 4/5 | defers-to-authority, omission-as-honesty (want defers-to-authority, misses-the-timing) | 4 (want 4) |
| W2 | SDDSDB | not strong 5/5 | reasoning D→S 2/5, action_plan S→D 1/5 | topic-not-message, stops-short-of-answering-marcus (want topic-not-message) | 6, 5 (want 6, 5) |
| W3 | SSDSSD ★ | **strong 3/5, not strong 2/5** | voice S→D 2/5 | options-not-weighed (want none) | 6, 5 (want 6, 5) |
| A | SSSSSS ★ | strong 5/5 |  |  (want none) | 6 (want 6) |
| B | SSDSSS ★ | **not strong 3/5, strong 2/5** | voice S→D 3/5 | softens-the-failures-to-the-client, all-or-nothing (want none) | 6, 5 (want 5, 6) |
| C | SSSSSS ★ | strong 5/5 |  |  (want none) | 6, 5 (want 6, 5) |
| E01 | BBBBBB | not strong 5/5 |  | defers-to-authority, consequences-only-to-self (want defers-to-authority, misses-the-timing) | 1 (want 1) |
| E02 | BBDBBB | not strong 5/5 | action_plan B→D 2/5 | omission-as-honesty, defers-to-authority (want omission-as-honesty) | 2 (want 2) |
| E03 | BBBDDD | not strong 5/5 |  | omission-as-honesty, defers-to-authority (want omission-as-honesty, defers-to-authority) | 3, 1 (want 3) |
| E04 | BBBBBB | not strong 5/5 |  | misreads-the-facts, defers-to-authority (want misreads-the-facts, misses-the-timing) | 4 (want 4) |
| E05 | BBDDDB | not strong 5/5 | recognition B→D 2/5 | defers-to-authority, misses-the-timing (want defers-to-authority) | 5 (want 5) |
| E06 | DDBDBD | not strong 5/5 |  | all-or-nothing, turns-on-marcus (want turns-on-marcus, all-or-nothing) | 7, 5 (want 7) |
| E07 | DDBBBB | not strong 5/5 |  | decides-but-doesnt-act, stops-at-the-rule (want decides-but-doesnt-act, stops-at-the-rule) | 4 (want –) |
| E08 | SSDDDD | not strong 5/5 |  | topic-not-message, silent-on-who-else-knows (want topic-not-message) | 6 (want 6) |
| E09 | SSSSSD ★ | strong 5/5 |  | none (want none) | 6 (want 6) |
| E10 | DDBBBB | not strong 5/5 |  | decides-but-doesnt-act, stops-at-the-rule (want decides-but-doesnt-act, stops-at-the-rule) | 4 (want –) |
| E11 | BBBBBB | not strong 5/5 | reasoning B→D 1/5 | misreads-the-facts, misses-the-timing (want misreads-the-facts, misses-the-timing) | 4 (want 4) |
| E12 | DBDDBB | not strong 5/5 | options D→B 1/5 | consequences-only-to-self, topic-not-message (want consequences-only-to-self) | 6 (want 6) |
| E13 | SSSSSS ★ | strong 5/5 |  |  (want none) | 6, 5 (want 6) |
| E14 | BBDDDS | not strong 5/5 | options D→B 4/5 | omission-as-honesty, defers-to-authority (want defers-to-authority, omission-as-honesty) | 3, 1 (want 3) |
| E15 | SSDSSD ★ | strong 5/5 | options D→S 2/5 | none (want none) | 6, 5 (want 6) |
| E16 | too short | too short 5/5 |  |  (want none) |  (want –) |
| E17 | DBDDDB | not strong 5/5 | voice D→B 1/5 | reasons-left-unstated, topic-not-message (want none) | 6 (want 6) |
| E18 | too short | **not strong 3/5, too short 2/5** |  |  (want none) |  (want –) |
| E19 | DDDSBD | not strong 5/5 |  | turns-on-marcus, misses-the-timing (want turns-on-marcus) | 6, 5 (want 6, 5) |
| E20 | DDDDDB | not strong 5/5 |  | misses-the-timing, omission-as-honesty (want misses-the-timing) | 6, 3 (want 6) |
| E21 | BBDDDB | not strong 5/5 | recognition B→D 1/5, reasoning B→D 2/5 | misreads-the-facts, omission-as-honesty (want misreads-the-facts, omission-as-honesty) | 4, 6 (want 4, 6) |
| E22 | SSDDSD | not strong 5/5 |  | silent-on-who-else-knows, no-alternatives-weighed (want none) | 6 (want 6) |
| E23 | DBBDDD | not strong 5/5 | recognition D→B 1/5, action_plan D→B 2/5, voice D→B 1/5 | defers-to-authority, stops-at-the-rule (want none) | 1, 4 (want 6, 1) |

Levels are in element order: recognition, reasoning, options, action_plan, voice, reflection. B beginning, D developing, S strong; ★ strong overall. A verdict in bold doesn't match the label every time.
