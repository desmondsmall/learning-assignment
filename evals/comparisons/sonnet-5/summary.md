# Eval results

Model `claude-sonnet-5`, judge effort `low`, 29 cases x 3 repeat(s); coach effort `low`, 43 messages. Estimated cost $1.24.

Every count is over all judgments, not just the first repeat of each case.

## Headline

- **Strong or not (or too short): 82/87 judgments match the label; right on every repeat for 26/29 cases.**
- Element levels: 411/486 match (recognition 70/81, reasoning 71/81, options 69/81, action_plan 69/81, voice 60/81, reflection 72/81).
- Two levels out: none.
- Primary pattern in the judge's top two: 51/51.
- Closest path overlaps: 74/75.
- Consistency across 3 repeats: the same verdict every time on 26/29 cases; the same level every time on 146/174 elements.
- Judge time: median 8.6s, 90th percentile 15.0s.
- Quotes dropped by the exact-match check: 18.

## The coach

The coach's first feedback on each case, and every round of 6 resubmission sequences, all checked in code. The checks are heuristics: a flag says where to look, and `feedback.md` has every message to read.

- **Messages with a failed check: 25/43.** By check: too-many-questions 18, quote-not-exact 8, mentions-paths 6, too-long 3, strong-when-not 2, verdict-word 1.
- Time to the coach's first word, judge then coach: median 9.9s, 90th percentile 17.6s.

| Message | Failed checks |
| --- | --- |
| W2 | too-many-questions (2 questions) |
| W3 | quote-not-exact (small fixes) |
| A | quote-not-exact (it's untrue); quote-not-exact (we'll confirm once re-run); mentions-paths (path) |
| B | strong-when-not (says 'strong' about a response that isn't) |
| E02 | quote-not-exact (nothing false is written); quote-not-exact (nothing misleading is conveyed.); too-many-questions (2 questions) |
| E03 | too-many-questions (2 questions) |
| E06 | too-many-questions (2 questions) |
| E07 | too-many-questions (2 questions) |
| E08 | mentions-paths (path); too-many-questions (2 questions) |
| E10 | quote-not-exact (I would not mark the checks as complete); too-many-questions (2 questions) |
| E11 | mentions-paths (paths) |
| E14 | too-many-questions (3 questions) |
| E17 | mentions-paths (path); too-many-questions (2 questions); too-long (80 words (limit 72)) |
| E19 | verdict-word (wrong) |
| E20 | mentions-paths (path); too-many-questions (3 questions) |
| E22 | strong-when-not (says 'strong' about a response that isn't) |
| E23 | too-long (108 words (limit 107)) |
| RS1 round 1 | mentions-paths (path); too-many-questions (2 questions) |
| RS3 round 1 | quote-not-exact (sort it out Monday); too-many-questions (2 questions) |
| RS3 round 2 | too-many-questions (2 questions) |
| RS4 round 1 | quote-not-exact (wait for Marcus or don't act,); too-many-questions (2 questions); too-long (123 words (limit 112)) |
| RS4 round 2 | too-many-questions (4 questions) |
| RS5 round 1 | too-many-questions (2 questions) |
| RS5 round 2 | too-many-questions (2 questions) |
| RS5 round 3 | too-many-questions (2 questions) |

## Per case

Patterns and paths are from the first repeat.

| Case | Expected | Verdicts | Element differences (expected → judged, how often) | Patterns | Paths |
| --- | --- | --- | --- | --- | --- |
| W1 | DBBDDB | not strong 3/3 | recognition D→B 2/3, action_plan D→B 3/3, voice D→B 3/3 | defers-to-authority, all-or-nothing (want defers-to-authority, misses-the-timing) | 4 (want 4) |
| W2 | SDDSDB | not strong 3/3 | reasoning D→S 1/3 | topic-not-message, stops-at-the-rule (want topic-not-message) | 6, 5 (want 6, 5) |
| W3 | SSDSSD ★ | strong 3/3 | options D→S 1/3 |  (want none) | 6, 5 (want 6, 5) |
| A | SSSSSS ★ | strong 3/3 |  |  (want none) | 6 (want 6) |
| B | SSDSSS ★ | **not strong 2/3, strong 1/3** | options D→S 3/3, voice S→D 2/3 | topic-not-message (want none) | 6, 5 (want 5, 6) |
| C | SSSSSS ★ | strong 3/3 | reflection S→D 1/3 |  (want none) | 6, 5 (want 6, 5) |
| E01 | BBBBBB | not strong 3/3 |  | defers-to-authority, omission-as-honesty (want defers-to-authority, misses-the-timing) | 1 (want 1) |
| E02 | BBDBBB | not strong 3/3 | reasoning B→D 1/3, action_plan B→D 1/3 | omission-as-honesty, consequences-only-to-self, topic-not-message (want omission-as-honesty) | 2 (want 2) |
| E03 | BBBDDD | not strong 3/3 | options B→D 1/3, voice D→B 3/3 | omission-as-honesty, all-or-nothing (want omission-as-honesty, defers-to-authority) | 3 (want 3) |
| E04 | BBBBBB | not strong 3/3 | recognition B→D 2/3, reasoning B→D 1/3, reflection B→D 2/3 | misreads-the-facts, all-or-nothing, decides-but-doesnt-act (want misreads-the-facts, misses-the-timing) | 4 (want 4) |
| E05 | BBDDDB | not strong 3/3 | recognition B→D 3/3, options D→B 3/3, action_plan D→B 2/3, voice D→B 2/3 | defers-to-authority, decides-but-doesnt-act (want defers-to-authority) | 5 (want 5) |
| E06 | DDBDBD | not strong 3/3 | reflection D→B 1/3 | turns-on-marcus, all-or-nothing (want turns-on-marcus, all-or-nothing) | 7 (want 7) |
| E07 | DDBBBB | not strong 3/3 |  | decides-but-doesnt-act, all-or-nothing (want decides-but-doesnt-act, stops-at-the-rule) | 4, 6 (want –) |
| E08 | SSDDDD | not strong 3/3 |  | topic-not-message (want topic-not-message) | 6 (want 6) |
| E09 | SSSSSD ★ | strong 3/3 | options S→D 1/3 |  (want none) | 6 (want 6) |
| E10 | DDBBBB | not strong 3/3 |  | decides-but-doesnt-act, stops-at-the-rule (want decides-but-doesnt-act, stops-at-the-rule) | 6 (want –) |
| E11 | BBBBBB | not strong 3/3 |  | misreads-the-facts, all-or-nothing (want misreads-the-facts, misses-the-timing) | 4, 1 (want 4) |
| E12 | DBDDBB | not strong 3/3 |  | consequences-only-to-self, topic-not-message (want consequences-only-to-self) | 6 (want 6) |
| E13 | SSSSSS ★ | strong 3/3 |  |  (want none) | 6, 5 (want 6) |
| E14 | BBDDDS | not strong 3/3 | voice D→B 2/3, reflection S→D 3/3 | omission-as-honesty, defers-to-authority (want defers-to-authority, omission-as-honesty) | 3 (want 3) |
| E15 | SSDSSD ★ | strong 3/3 | options D→S 2/3 |  (want none) | 6, 5 (want 6) |
| E16 | too short | **not strong 2/3, too short 1/3** |  | defers-to-authority, omission-as-honesty (want none) | 1 (want –) |
| E17 | DBDDDB | not strong 3/3 | voice D→B 1/3 | stops-at-the-rule, topic-not-message (want none) | 6 (want 6) |
| E18 | too short | **too short 2/3, not strong 1/3** |  |  (want none) |  (want –) |
| E19 | DDDSBD | not strong 3/3 | recognition D→S 3/3, voice B→D 1/3, reflection D→B 2/3 | turns-on-marcus, stops-at-the-rule (want turns-on-marcus) | 6, 5 (want 6, 5) |
| E20 | DDDDDB | not strong 3/3 | recognition D→B 1/3, reasoning D→B 1/3, options D→B 1/3, action_plan D→B 2/3, voice D→B 3/3 | misses-the-timing, topic-not-message (want misses-the-timing) | 3, 6 (want 6) |
| E21 | BBDDDB | not strong 3/3 | reasoning B→D 3/3, action_plan D→B 1/3, voice D→B 2/3 | misreads-the-facts, omission-as-honesty (want misreads-the-facts, omission-as-honesty) | 4, 3 (want 4, 6) |
| E22 | SSDDSD | not strong 3/3 |  | action_plan-silent-on-firm (want none) | 6 (want 6) |
| E23 | DBBDDD | not strong 3/3 | reasoning B→D 3/3, action_plan D→B 3/3, voice D→B 2/3 | decides-but-doesnt-act, all-or-nothing (want none) | 1, 6 (want 6, 1) |

Levels are in element order: recognition, reasoning, options, action_plan, voice, reflection. B beginning, D developing, S strong; ★ strong overall. A verdict in bold doesn't match the label every time.
