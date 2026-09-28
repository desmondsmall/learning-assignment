# Prompts

One Markdown file per job the model does. Each is a template: `src/lib/prompts.ts` fills its `{{placeholders}}` with content from `content/`, and fails loudly if one has no value.

- `judge.md`: judges a response against the rubric and returns structured output: a level per element, the limiting pattern, the quotes it rests on, and the closest paths. Filled and called by `src/lib/judge.ts`.
- `coach.md`: writes the feedback the learner reads, from the checked judgment and a short summary of the session so far, streamed. Filled and called by `src/lib/coach.ts`.
- `closing.md`: writes the debrief's closing note on what moved between the starting point and the final response, streamed. Filled and called by `src/lib/closing.ts`.

The learner's text always goes inside clearly marked tags and is treated as data, never as instructions.
