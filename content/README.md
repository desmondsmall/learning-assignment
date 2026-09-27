# Content

The authored material the coach works from, kept as data rather than written into prompts. In Juniper's model a program's learning designers write this, and adding a scenario should mean adding files here, not changing code.

Planned files:

- `scenario.json`: the scenario text the learner reads.
- `rubric.json`: the six elements, their descriptors at each level, the rule for a strong response, and the limiting patterns.
- `paths.json`: the seven paths, each with its challenge and its account of how it might play out, shown in the debrief.
- `situational.json`: the last test, a moment of pressure after the decision that ends the feedback once a response is strong.

Each file is checked against a schema in `src/lib/content.ts` when it is loaded, so a mistake in the content fails loudly rather than reaching a learner.
