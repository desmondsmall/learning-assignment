# Content

The authored material the coach works from, kept as data rather than written into prompts. In Juniper's model a program's learning designers write this, and adding a scenario should mean adding files here, not changing code.

- `scenario.json`: the scenario the learner reads (its title, the situation and the question), the question the first round of feedback ends with, and the order in which the paths are offered as challenges. It also holds what the coach needs to keep to the scenario's facts: what the scenario settles, what it leaves open on purpose, and every time it gives.
- `rubric.json`: the six elements, their descriptors at each level, the rule for a strong response, and the limiting patterns.
- `paths.json`: the seven paths, each with a one-line summary the judge reads, its challenge, and its account of how it might play out, shown in the debrief.
- `last-test.json`: the last test, a moment of pressure after the decision that ends the feedback once a response is strong.

`src/lib/content.ts` checks each file against a schema when the server loads it, and checks the files against each other: every element, pattern and path a file names must exist. A mistake in the content stops the app with an error naming the file and the field, rather than reaching a learner.
