# Judge eval results

Model `claude-opus-5`, judge effort `low`, 29 cases x 5 repeat(s). Estimated cost $4.06.

Every count is over all judgments, not just the first repeat of each case.

## Headline

- **Strong or not (or too short): 139/145 judgments match the label; right on every repeat for 27/29 cases.**
- Element levels: 781/810 match (recognition 128/135, reasoning 129/135, options 133/135, action_plan 128/135, voice 128/135, reflection 135/135).
- Two levels out: none.
- Primary pattern in the judge's top two: 85/85.
- Closest path overlaps: 125/125.
- Consistency across 5 repeats: the same verdict every time on 28/29 cases; the same level every time on 162/174 elements.
- Judge time: median 11.4s, 90th percentile 16.2s.
- Quotes dropped by the exact-match check: 10.

## Per case

Patterns and paths are from the first repeat.

| Case | Expected | Verdicts | Element differences (expected → judged, how often) | Patterns | Paths |
| --- | --- | --- | --- | --- | --- |
| W1 | DBBDDB | not strong 5/5 | voice D→B 5/5 | defers-to-authority, omission-as-honesty (want defers-to-authority, misses-the-timing) | 4 (want 4) |
| W2 | SDDSDB | not strong 5/5 | reasoning D→S 2/5 | topic-not-message, no-follow-through (want topic-not-message) | 6, 5 (want 6, 5) |
| W3 | SSDSSD ★ | strong 5/5 |  | none (want none) | 6, 5 (want 6, 5) |
| A | SSSSSS ★ | strong 5/5 |  |  (want none) | 6 (want 6) |
| B | SSDSSS ★ | **strong 4/5, not strong 1/5** | voice S→D 1/5 | options-not-weighed (want none) | 6, 5 (want 5, 6) |
| C | SSSSSS ★ | strong 5/5 |  |  (want none) | 6, 5 (want 6, 5) |
| E01 | BBBBBB | not strong 5/5 |  | defers-to-authority, consequences-only-to-self (want defers-to-authority, misses-the-timing) | 1 (want 1) |
| E02 | BBDBBB | not strong 5/5 | action_plan B→D 4/5 | omission-as-honesty, defers-to-authority (want omission-as-honesty) | 2 (want 2) |
| E03 | BBBDDD | not strong 5/5 |  | omission-as-honesty, defers-to-authority (want omission-as-honesty, defers-to-authority) | 3, 1 (want 3) |
| E04 | BBBBBB | not strong 5/5 |  | misreads-the-facts, defers-to-authority (want misreads-the-facts, misses-the-timing) | 4 (want 4) |
| E05 | DBDDDB | not strong 5/5 | recognition D→B 4/5 | defers-to-authority, misses-the-timing (want defers-to-authority) | 5, 4 (want 5) |
| E06 | DDBDBD | not strong 5/5 |  | turns-on-marcus, all-or-nothing (want turns-on-marcus, all-or-nothing) | 7, 5 (want 7) |
| E07 | DDBBBB | not strong 5/5 |  | decides-but-doesnt-act, stops-at-the-rule (want decides-but-doesnt-act, stops-at-the-rule) | 4 (want –) |
| E08 | SSDDDD | not strong 5/5 |  | topic-not-message, silent-on-who-else-knows (want topic-not-message) | 6 (want 6) |
| E09 | SSSSSD ★ | strong 5/5 |  | none (want none) | 6 (want 6) |
| E10 | DDBBBB | not strong 5/5 |  | decides-but-doesnt-act, stops-at-the-rule (want decides-but-doesnt-act, stops-at-the-rule) | 6 (want –) |
| E11 | BBBBBB | not strong 5/5 |  | misreads-the-facts, misses-the-timing (want misreads-the-facts, misses-the-timing) | 4, 1 (want 4) |
| E12 | DBDDBB | not strong 5/5 |  | consequences-only-to-self, topic-not-message (want consequences-only-to-self) | 6 (want 6) |
| E13 | SSSSSS ★ | strong 5/5 |  |  (want none) | 6, 5 (want 6) |
| E14 | BBDDDS | not strong 5/5 | options D→B 1/5 | omission-as-honesty, defers-to-authority (want defers-to-authority, omission-as-honesty) | 3, 1 (want 3) |
| E15 | SSDSSD ★ | strong 5/5 | options D→S 1/5 |  (want none) | 6, 5 (want 6) |
| E16 | too short | too short 5/5 |  |  (want none) |  (want –) |
| E17 | DBDDDB | not strong 5/5 |  | decides-but-doesnt-act, misses-the-timing (want none) | 6 (want 6) |
| E18 | too short | **not strong 5/5** |  | decides-but-doesnt-act, stops-at-the-rule (want none) | 6 (want –) |
| E19 | DDDSBD | not strong 5/5 |  | turns-on-marcus, misses-the-timing (want turns-on-marcus) | 6, 5 (want 6, 5) |
| E20 | DDDDDB | not strong 5/5 |  | misses-the-timing, stops-at-the-rule (want misses-the-timing) | 6 (want 6) |
| E21 | BBDDDB | not strong 5/5 | recognition B→D 2/5, reasoning B→D 4/5 | omission-as-honesty, misreads-the-facts (want misreads-the-facts, omission-as-honesty) | 4, 6 (want 4, 6) |
| E22 | SSDDSD | not strong 5/5 |  | silent-on-who-else-at-the-firm, all-or-nothing (want none) | 6 (want 6) |
| E23 | DBBDDD | not strong 5/5 | recognition D→B 1/5, action_plan D→B 3/5, voice D→B 1/5 | defers-to-authority, consequences-only-to-self (want none) | 1, 4 (want 6, 1) |

Levels are in element order: recognition, reasoning, options, action_plan, voice, reflection. B beginning, D developing, S strong; ★ strong overall. A verdict in bold doesn't match the label every time.
