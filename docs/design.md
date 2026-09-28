# Design

Why the coach's feedback and the learner's experience are designed the way they are, and how the coach coaches. What the learner sees, step by step, is in `experience.md`, and what the coach judges is in `rubric.md`. The evidence is in `reference/`: `research-the-situation.md` (the dilemma itself), `research-feedback-pedagogy.md` (feedback on open-ended reasoning, including AI feedback) and `research-experience-design.md` (branching scenarios, consequences and AI role-play).

## The shape of the dilemma

The scenario reads as a professional services firm, where "quality checks" and a report that "goes out under your name" carry professional weight. The domain has been stripped out on purpose: we don't know what was checked, how serious the two failures are, what the project is, or whether "by Monday" means before or after the board meets. Professional judgment means reasoning "in situations the textbook didn't anticipate", in Juniper's words. It works because the professions agree: the IESBA and CPA Canada codes, PMI's code and consulting codes converge on the same answer here. So the feedback never assumes a domain or settles what the scenario leaves open. A strong learner notices what is missing and reasons about it conditionally.

The *whether* is settled; the *how* is the dilemma. Certifying failed checks as complete is right versus wrong. How to act on that is right versus right: truth against loyalty to Marcus, short-term calm against long-term trust (Kidder). Giving Voice to Values starts from the same place: **the learner almost certainly knows what's right, and the question is what they would actually say and do, to whom, and in what order.**

So the coach is not there to find out whether the learner knows lying is wrong. **It coaches how to act well under pressure, which is where learners differ and where they can improve.**

## Why these six elements

The rubric judges the quality of the reasoning and the action, not the choice of path. Its six elements (recognition, reasoning, options, action plan, voice, reflection) are synthesized from:

- Rest's four components (sensitivity, judgment, motivation, character): most weak answers stop after judgment.
- Giving Voice to Values: knowing what you'd actually say, and answers to the rationalizations the learner will meet.
- The IESBA code's ladder of responses to pressure from a superior.
- Keefer & Ashley's finding that experts cite role-specific obligations and propose practical alternatives where novices reach for generic principles.

Reasoning tends to develop from personal interest ("I'd get in trouble"), to maintaining norms ("it's lying"), to reasoning from purpose ("the board will rely on this, so here's what I'd do and say"). The most common weak answer reaches the right conclusion with norms-level reasoning and no plan. The feedback develops that; it doesn't mark it wrong.

The descriptors, the rule for strong and the limiting patterns are in `rubric.md`. The fuller list of what separates strong answers from weak ones, which the descriptors were built from, is section 5 of `reference/research-the-situation.md`.

## How the coach coaches

### The rules

- **No score, no level label.** Grades crowd out comments (Butler).
- **Aimed at the work, not the person.** Feedback aimed at the self made performance worse in over a third of studies (Kluger & DeNisi).
- **Short.** Long feedback gets ignored (Shute).
- **Seconds, not minutes.** Long delays are the first problem Juniper's case study "The Feedback Problem" names. The coach reads the response before it writes, which takes several seconds, so the page shows at once that the response is being read, then streams the coach's words as they are written.
- **Never write the answer for the learner.** In this scenario that means the stakeholder list, the options or the script. Answer-giving AI tutors raised practice scores and then lowered unassisted performance (Bastani et al.). Anything in quotation marks is either the learner's own words or an authored challenge.
- **Quotes are exact.** Every quote from the learner is checked in code as an exact substring of what they wrote.

### One round of feedback

The coach judges all six elements every round, but the learner reads a prioritized pass, not six paragraphs:

1. **What's working**, credited with a short quote. Elements that are already strong are credited together, briefly.
2. **Element by element, for the two or three that matter most right now**, taken only from the elements that stand between the response and strong. For each: a short quote, what it shows, and what it doesn't show yet. The rest wait for a later round, and elements already good enough for strong are left alone.
3. **The limiting pattern**: one, two at most, named at the level of process ("Your reasoning stops at the rule", "Every consequence you name is to you"). The patterns the coach looks for first are listed in `rubric.md`.
4. **One question, at the end, not a fix**: "What does the client need from you before Monday morning?", "What would your note to Marcus tell him?" It is the only question the coach asks; every other point is made as a statement.
5. **Something to consider**, authored and chosen in code: the options question in the first round, a challenge after that. It is shown as written, after the coach's own words, marked "Something to consider", because taking it up is optional.

About 120 to 250 words. In testing, the coach given room for three questions wove rhetorical questions through the body and asked five to seven in total. With the prompt that follows, the learner meets two questions at most, and only one of them is the coach's.

This follows the loop in Juniper's case study: structured feedback on the rubric elements, then the bigger picture. It also avoids both of the failed versions the case study describes. The first was evaluative without being diagnostic, which the limiting pattern fixes. The second was a single directive, which the element pass and the question replace. Prioritizing keeps the feedback within what a learner will read, and stops a weak response getting a list of every gap.

### Weak and strong responses

How directive the coach is follows the level of the element it is working on:

- **At beginning**, more direction: one lens or contrast, aimed at the single most limiting pattern. More direction means pointing more precisely at where to look, never at what the learner will find there. In testing, "more direction" led the coach to state the timing insight outright, which is the answer the learner should reach.
- **At developing**, questions.
- **When the response is strong**, the coach says so plainly and stops pushing for polish. The feedback ends with a last test, a moment of pressure after the decision, which the learner can take up or not. Hiding that a response is strong is its own dishonesty.

### On a resubmission

- Open with what changed, quoting before and after, and say whether it dealt with the pattern flagged last time. If it takes on last round's challenge, say so; if it doesn't, let it go.
- Where the learner progressed, fade the support and raise the challenge.
- Where they're stuck, change the angle rather than repeat. Move one rung down a hint ladder: a question, then a lens, then a contrast, and only after repeated attempts a partial example of one move.
- Keep the starting point in view, so the learner can see how far they've come.

### What the coach remembers

Each call to the model starts from nothing, so memory is what the app passes in. The judge gets none: it judges the current response alone, so the same response always gets the same levels, whatever came before. The coach gets a short summary of the session, not the whole transcript:

- the previous version, its judgment and the feedback it gave, so it can say what changed and never repeat itself;
- the limiting pattern from each round, so it can see when the learner is stuck and move down the hint ladder;
- the starting point, so it can say how far the learner has come;
- the prompt the last feedback ended with, so it can recognize a version that takes it on;
- the prompt this feedback will end with, so its own question doesn't repeat or compete with it.

Every intermediate version and the full transcript are left out on purpose: they make feedback longer and more repetitive, and tempt the coach to reopen points the learner has already dealt with.

### Tone

A coach's: warm and candid. It credits real strengths with a quote, never generically, and doesn't soften a gap into a compliment. It holds the line on substance, and credits a well-argued choice about *how* to act even when it differs from the examples in the rubric.

## Why the experience looks like this

In short: the learner writes a first response on a blank page and gets feedback, which ends by asking what other options they had. They revise, and each round's feedback ends with a path they didn't take, argued by someone who would take it, to test the next version against. They go round as often as they like. They never write to the coach: revising is the only way to answer it. When the response is strong the coach says so and offers one last test. At the end, in a debrief, the coach says in a few sentences what moved between the starting point and the final response, and the seven paths are revealed.

It follows the loop in Juniper's case study closely: a realistic scenario, feedback element by element with examples from the learner's own work, then strengths and limiting patterns, without a score. The learner revises, and the tool "recognizes what changed", "deepening the challenge if the revision shows progress, finding a different angle if the learner is stuck". The challenges are those last two ideas made concrete. The feedback loop is the whole experience; the challenges live inside the feedback, and the debrief comes after it.

### The ideas behind it

**Exploration over the right answer.** Most learning modules make you feel you have to pick the right answer and move on. This one has the learner meet the paths they wouldn't choose, see why someone might take them, and watch their own response develop along the way.

- It follows Juniper's stated philosophy: learning that "develops the willingness to fail productively", with "no penalty for trying again".
- Comparing versions teaches what matters better than one good example does (contrasting cases).
- Meeting the other paths builds understanding of why people take them, including Marcus.
- Seeing the range and where your own attempts fall on it builds the learner's own sense of quality, which Sadler argues is the long-term goal of feedback.

**Challenges come from the learner's own position.** The coach challenges even a strong learner with the paths they didn't take ("why couldn't you just send it?").

- The learner answers in their own response, so every challenge is a reason to put their thinking into words, not just to read.
- It starts from their actual reasoning: the "curiosity about the learner's frame" of simulation debriefing (Rudolph).
- Each path becomes an argument to answer rather than a story to read. That is Giving Voice to Values' rehearsal against the arguments you will actually face, and the top level of the AAC&U rubric: defending a position against objections.

**The baseline.** The first blind attempt is the baseline, and everything after it shows how the learner's thinking moved. You can't show change without a baseline set before anything else happens, as Juniper's white paper argues.

**Generate before revealing.** The first feedback asks for the learner's own options before any challenge introduces a path, and the full set is only revealed at the end. Productive failure research supports this order: struggle with the problem first, then see the structure.

### What we decided against

**Steering the learner to the best path.** We considered having the coach question the learner until they switched to the optimal path.

- It is a hidden answer key made into a conversation. Learners learn that the exchange ends when they say the right thing, and say it.
- The path isn't what we are teaching. A learner who switches to the "right" path with a weak plan hasn't improved; one who reasons well from a defensible path of their own has.
- A coach that keeps pushing a junior until they adopt its view mirrors the pressure the scenario is about.
- A long AI-led dialogue is hard to keep consistent, and consistency is the point of an AI coach.

So a challenge is one prompt, answered in the next version or not at all, and the coach never chases it. The finish line is the quality of the response, not converting to a path.

**Paths as a menu.** We considered presenting the paths as multiple choice, with the learner writing a response for each.

- A menu of paths is a menu of *whethers*, the settled part of the dilemma. It puts attention on the easy question.
- Coming up with options, especially the middle path, is the skill that most separates expert from novice reasoning (Keefer & Ashley). A menu gives it away, and recognizing a good option feels like having thought of it.
- If attempt two follows a menu, we can't tell whether the learner's thinking moved or they recognized a better answer. That muddies the baseline.

So the paths stay hidden while the learner works, and reach them only through the coach, as challenges.

**A conversation with the coach.** The coach speaks only in feedback, and the learner answers it only by revising.

- Learners with open, self-directed AI access acted on feedback 0.1% of the time, against 26% when the dialogue was anchored to specific feedback points (Alsaiari et al.).
- An AI you can question freely becomes an answer machine (Bastani et al.).
- Even a reply space anchored to the coach's question would add a second place to write. Leaving it out keeps the loop simple and clear: one piece of feedback per version, and one place to write.

### The authored content

The paths, their challenges, how each plays out and the last test are authored, not generated. Two principles matter most:

- **Challenges never hand over the answer.** A challenge argues *for* a path, voiced by someone who would take it. Where a path is close to the strong response, the challenge comes from the person it serves, not from someone recommending it.
- **Consequences are honest in both directions.** Each path has a short account of how Monday might go, never "Incorrect" (Cathy Moore's "show, don't tell"). After "just send it", the realistic Monday is often that nothing happens, which is part of the lesson; good choices have costs too. Every account is written from the same facts, so they stay consistent and don't turn into invented drama.

## What the AI does, and what code does

The AI does three jobs:

1. **Judging the response** against the rubric: a level for each element, the limiting pattern, the quotes it rests on, and which paths the response is closest to.
2. **The feedback the learner reads**, written from that judgment, including what changed since the last version.
3. **The closing note** on what moved between the starting point and the final response.

Code does the rest, so it is the same for every learner and can be tested without a model:

- whether the response is strong, by applying the rule in `rubric.md` to the element levels;
- what the feedback ends with, and when the learner seems stuck enough to be offered the debrief, by the rules in `experience.md`;
- checking that every quote is an exact substring of the learner's text;
- the lines that tell the learner what to do next, and everything authored.

## Authored content is data, not prompt

The rubric, the paths and how they play out, and the challenges are the real design work. They live as data in `content/`, not inside prompts. Each program's learning designers write this, and an AI coach is only as good as the rubric and scenarios it is configured with. Keeping the content separate from the prompts and the code is meant to let someone write the next scenario without a developer.
