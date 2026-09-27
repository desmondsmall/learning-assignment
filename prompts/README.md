# Prompts

One Markdown file per job the model does. Each is a template that the server fills with content from `content/` and the learner's text before calling the model.

Planned files:

- `judge.md`: judges a response against the rubric and returns structured output: a level per element, the limiting pattern, the quotes it rests on, and the closest paths.
- `coach.md`: writes the feedback the learner reads, from the checked judgment. Streamed.
- `closing.md`: the closing note on what moved between the first and final response.

The learner's text always goes inside clearly marked tags and is treated as data, never as instructions.
