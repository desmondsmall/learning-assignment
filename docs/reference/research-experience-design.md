# Research: experiences where there is no correct answer to pick

Research into a "field of paths" for the learner experience: branching scenarios, consequence-based feedback, AI role-play, and free-text designs in between. Gathered by a research agent. It ends with a map of the design space.

How far to trust it: **[Established]** means the source says it directly or it is a published finding; **[Inference]** is reasoning about how it applies to us. Citations were not individually re-checked, and the 2026 arXiv papers are recent enough to deserve a look before being relied on.

## 1. Branching scenarios: how practitioners handle wrong choices

**Cathy Moore** (action mapping, scenario design)

- **[Established] Show, don't tell.** Skip judgments like "Incorrect!"; "show the result and let them draw the conclusion themselves." A weak choice plays out inside the story. She calls judgment-style feedback preachy and "eager-beaver". https://blog.cathy-moore.com/feedback-in-scenarios-let-them-think/ , https://blog.cathy-moore.com/scenarios-the-good-the-bad-and-the-preachy/
- **[Established]** Her compromise with stakeholders: poor choices get consequences without explanation; explanatory feedback arrives only once the learner reaches a good choice, or sits behind an optional link.
- **[Established] Structure and recovery.** Roughly seven or more decisions on the best path, short paths that fail quickly for common mistakes, one best ending plus mediocre and poor ones, plotted so learners can "realize they're heading for a poor ending and get on a better path". And "let learners go back to the previous decision. This encourages them to explore." https://blog.cathy-moore.com/branching-scenarios-how-many-decision-points/
- **[Established] Mini-scenario or branching.** A mini-scenario is one decision and one realistic consequence. Branching is only needed when an earlier decision changes what is available later. https://blog.cathy-moore.com/do-you-need-a-branching-scenario-or-a-mini-scenario/

**Clark Quinn**

- **[Established]** A scenario needs a story context, a triggering event that forces a decision, and consequences. Wrong options should represent *reliable misconceptions*: people make patterned mistakes from wrong mental models, and each misconception gets its own consequence. Scenarios need models, examples and reflection around them, not to stand alone. https://blog.learnlets.com/2015/12/scenarios-and-conceptual-clarity/
- **[Inference]** For the Marcus scenario the misconceptions are the rationalizations: "it's Marcus's call, not mine", "the checks will probably pass by Monday", "flagging this makes the client look bad", "I can't reach Marcus, so I'll refuse to send anything". Each can drive its own consequence.

**Ruth Clark** (Scenario-based e-Learning)

- **[Established]** Separates *intrinsic* feedback (the world responds) from *instructional* feedback (explicit analysis). More immediate feedback for novices, delayed for more advanced learners. https://christytuckerlearning.com/intrinsic-and-instructional-feedback-in-learning-scenarios/

**Managing complexity** (Christy Tucker and others)

- **[Established]** Let learners correct course after minor errors so paths rejoin; vary path lengths; write good, OK and bad options rather than right and wrong; prototype in Twine. Common patterns are collapsed branches that rejoin into a shared second act, and guardrails that loop back to a decision after a critical failure. https://christytuckerlearning.com/managing-the-complexity-of-branching-scenarios/

**Known criticisms**

- **Combinatorial explosion.** [Established] Every choice multiplies content, which is why designers collapse paths, and why interactive-fiction work moved to modular "storylets". https://arxiv.org/pdf/2601.15295
- **Recognition instead of generation.** [Established, from medical education] Multiple choice measures recognition and gives cues; students score lower when they have to generate the answer. https://pmc.ncbi.nlm.nih.gov/articles/PMC13285184/
- **Gaming the options.** [Inference] Sharper than usual in ethics, where the "right" option is socially obvious. Learners pick what the course wants to hear, and fixed choices can't capture the most important real move: a nuanced, well-worded message.

## 2. Consequence-based ("play it forward") feedback

- **[Established]** Intrinsic feedback is the defining feature of scenario-based learning. Practitioners layer instructional feedback on top, often from an in-world mentor, focused on why rather than right or wrong.
- **[Established, thin evidence]** In simulation-based health education, advanced learners rated feedback on how they performed as most effective, outcome-only feedback as least, and intrinsic feedback in between. This is perceived effectiveness, not measured learning. https://pubmed.ncbi.nlm.nih.gov/37772244/
- **[Established]** A small RCT with medical students (N = 21): LLM patient simulation plus structured AI feedback beat simulation alone on clinical decision-making. https://pmc.ncbi.nlm.nih.gov/articles/PMC11605890/
- **[Established]** "Anticipating consequences" is one of Mumford's seven trainable sensemaking strategies in ethics training, with large pre/post gains partly kept at six months. https://pmc.ncbi.nlm.nih.gov/articles/PMC2705124/
- **[Established]** Productive failure's evidence is mostly from STEM and scarce outside it, so it shouldn't be cited as proof for ethics.
- **[Inference] Implications for us.**
  - Consequences in ethics are probabilistic. The realistic Monday after "send as instructed" might be that nothing happens, or the board catches it, or it surfaces three weeks later with the junior's name on it.
  - Showing only disaster is preachy and teaches the wrong lesson.
  - Good choices have realistic costs too: Marcus is irritated, the client is unhappy.
  - "Most likely, plausible worst, what it cost you" is more honest than one catastrophe.
  - Consequences should come from authored content that keeps the facts consistent: what the two failed checks mean, what the board cares about, how Marcus behaves. Without it, the LLM invents dramatic, inconsistent outcomes.

## 3. AI role-play and conversational simulation

**Giving Voice to Values** (Mary Gentile)

- **[Established]** Changes the question from "what is right?" to "if I were going to act on my values, what would I say and do?", with scripting, rehearsal and peer coaching to build "moral muscle memory". It assumes most people already want to act on their values but need to believe they can do it effectively, and it rehearses answers to the "reasons and rationalizations" others will raise. https://ssir.org/articles/entry/giving_voice_to_values , https://www.darden.virginia.edu/ibis/initiatives/gvv
- **[Inference]** It fits the Marcus scenario almost perfectly. The dilemma isn't really whether to misreport; it's how to handle an unreachable lead, a deadline and your own name on the document. It also gives a frame without shame: assume the learner wants to do right, and coach the how.

**Research systems**

- **[Established] Rehearsal** (Stanford, CHI 2024). An LLM plays the other party in a conflict, users explore "what if" paths, and they get theory-grounded feedback. With 40 participants, the Rehearsal group used 67% fewer competitive strategies in real conflicts afterwards and doubled cooperative ones, compared with a lecture-only control. The key technique: first classify which strategy the simulated person should use next, then generate their reply. https://arxiv.org/abs/2309.12309
- **[Established] CommCoach** (Virginia Tech, 2025). A role-play partner plus a coach agent, with branching so managers can try alternatives. Managers valued low-stakes practice and retrying; their concerns were control over personas, bias, feedback without the why, and optimizing for the AI's approval. https://arxiv.org/html/2505.14452
- **[Established] Conversation Coach** (Amazon, 2026). Voice role-play used by 40,000+ managers over six months. The authors say there is still no causal evidence that simulated practice transfers to real conversations. https://arxiv.org/abs/2609.00441
- **[Established]** 968 participants practising with an LLM partner: personalized LLM coaching improved empathic expression without making responses uniform. https://arxiv.org/abs/2603.15245
- **[Established] Mollick & Mollick** (Wharton). A mentor, role-player and evaluator pattern, with warnings about hallucination and characters breaking role. https://arxiv.org/abs/2407.12796 , https://www.moreusefulthings.com/instructor-prompts

**Pitfalls from LLM standardized-patient simulations**

- **[Established]** Virtual patients are "overly cooperative or homogeneous", lacking resistance; role consistency and hallucination problems are common; few studies measured learning objectively. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12661241/
- **[Established]** GPT-4 struggled to follow expert-written persona principles; a principle-adherence pipeline improved adherence by about 30%. https://arxiv.org/abs/2407.00870
- **[Established]** Persona drift: models snap back to helpful-assistant behaviour. https://arxiv.org/html/2604.09212v1
- **[Inference]** The concrete risk is an AI Marcus who caves the moment the learner pushes back, which teaches false confidence. Boal's Forum Theatre gets this right: actors "offer strong resistance so that the difficulties in making any change are also acknowledged."

## 4. Between free-text feedback and choose-your-own-adventure

- **[Established] Socratic tutors** such as Khanmigo ask what you tried and give progressively targeted hints. Evidence on outcomes is still inconclusive.
- **[Established] Older precedents.** In **FearNot!** (anti-bullying), a child types free-text advice to a bullied character, and it changes how the character behaves next episode, framed as "no strategy guaranteed to work, though some are more often successful". https://link.springer.com/chapter/10.1007/978-3-540-77039-8_19 In **Façade**, typed input is classified into a small set of "discourse acts" and a drama manager picks the next authored beat. https://eis.ucsc.edu/papers/MateasSternTIDSE04.pdf
- **[Established] Current hybrids.** **Drama Llama** (2025): authors write storylet triggers in natural language, and an LLM decides when to fire them. https://arxiv.org/abs/2501.09099 **Oak Story** (Stanford, 2025): LLM narrative steered by learning goals over pre-written scenes. https://doi.org/10.1145/3746059.3747698
- **[Inference] The design space has three axes.**
  - **Input:** choice, then choice plus justification, then free text.
  - **What the system gives back:** a verdict, a Socratic question, a consequence scene, a new twist, or a live counterpart.
  - **What revision means:** retry the same prompt, rewind to a decision point, or respond to a changed situation.

  JuniperAI's loop, as Juniper describes it, is free text, coaching feedback and retry. The "field of paths" idea is mostly about the middle axis: replacing the verdict with consequences and twists while keeping free text, which avoids the cueing and combinatorial problems of fixed choices. The LLM only has to *classify* the response into a handful of authored stances and moves, then *render* an authored consequence or twist. It never has to invent what happens.
- **[Inference] Candidate twists for the Marcus scenario**, in the Giving Voice to Values sense of rehearsing against pressure:
  - "Marcus calls back Saturday: 'Everyone rounds these up, just send it.'"
  - "The client emails Sunday asking you to confirm all checks passed."
  - "A colleague says the checks were re-run and passed; you can't verify it."
  - "Monday: the board asks the client a direct question."

  Each tests whether the learner's reasoning holds, and gives a natural reason to revise.

## 5. No single correct answer, and wrong choices without shame

- **[Established] Score the reasoning, not the choice.** Kohlberg's Moral Judgment Interview scores the structure of the justification, not the yes or no. Quandary (MIT Education Arcade): "what is valued is not getting to a so-called 'right answer,' but rather how you use evidence and input… to create a possible solution." https://quandarygame.org/ Mumford's seven strategies are a ready-made rubric of reasoning moves.
- **[Established]** Feedback aimed at the self rather than the task reduced performance in over a third of interventions (Kluger & DeNisi). Shute recommends feedback that is non-evaluative, specific and elaborated, with no comparison to others.
- **[Established] Curiosity about the learner's frame.** "Debriefing with good judgment" (Rudolph, Center for Medical Simulation) treats actions as the product of the learner's frames, their assumptions and feelings. It pairs a clear observation with genuine curiosity about the frame behind it, rejecting both fake non-judgmental softness and harsh verdicts. https://pubmed.ncbi.nlm.nih.gov/19088574/
- **[Inference]** A learner who sends the report as Marcus asked gets a realistic consequence, then "What made sending it feel like the right call: the deadline, deference to Marcus, something else?", then a twist that tests that frame. Never "That was unethical." A learner who refuses outright or goes over Marcus's head gets the same treatment, since their choice has costs too. That keeps the tool from feeling like it hides an answer key, and it matches Juniper's stated principle of "no penalty for trying again".

## Map of the design space

All **[Inference]**. Build effort assumes a solo developer with an LLM API and a simple web page.

**A. Write, play it forward, revise.** The learner writes a response. The LLM classifies it into authored stances (comply silently, comply with a caveat, flag the failures to the client, hold and escalate, refuse) and reasoning moves, renders a short Monday-morning scene from an authored consequence sheet, and asks one curious coaching question. The learner revises, and the next scene reflects the change.

- Pros: delivers "learn more about what you chose" directly; keeps free text, so no cueing; backed by the evidence on intrinsic feedback, forecasting and structured feedback; cheap to run.
- Cons: moralizing or catastrophizing unless consequences are authored and marked as probabilistic; a misclassification produces a mismatched scene.
- Effort: low to moderate: one scenario, four to six stances, a consequence sheet and two prompts.

**B. Write, twist, revise.** After each response, the tool picks one authored twist aimed at the weakest part of the learner's plan. The learner responds, and the tool tracks how their stance and reasoning change.

- Pros: revision becomes the main mechanism, with a natural reason each time; tests how robust the reasoning is, not the choice; close to Giving Voice to Values; easy to author.
- Cons: a fixed bank of twists feels repetitive by the third or fourth attempt; needs a clear end state ("your plan holds up").
- Effort: low to moderate. It combines naturally with A: A for the first submission, B for later rounds.

**C. Live role-play rehearsal.** The learner scripts and then rehearses the actual conversation or email exchange with an AI Marcus or client; a separate coach debriefs; the learner can rewind any turn.

- Pros: the strongest fit for Giving Voice to Values; the best outcome evidence (Rehearsal); engaging.
- Cons: persona drift and sycophancy (Marcus caves); longer sessions; harder to evaluate; needs a strategy-first persona and resistance principles.
- Effort: moderate for a thin single-persona version; doing it well is a much larger piece of work.

**D. Authored branching with rewind** (Moore or Twine style). Two or three decision points with authored consequences, best, mediocre and poor endings, and "go back" at every node, optionally with free-text justification.

- Pros: fully controlled and predictable; no AI risk; established practice.
- Cons: cueing and "spot the ethical option"; heavy authoring; can't capture how the learner words the message; discards JuniperAI's free-text core.
- Effort: technically low but authoring-heavy, and it gives up free text, the core of JuniperAI.

**E. Storylet engine, the full hybrid.** Many authored storylets with natural-language triggers; the learner's free text moves a persistent world state (Marcus's trust, what the client knows, the junior's exposure); several characters; a timeline of alternative paths.

- Pros: the most faithful version of a "field of interactions"; reusable across scenarios.
- Cons: hard to test; state bugs; needs authoring tools; unclear learning evidence.
- Effort: high.

**Where this points.** A and B combine into one loop (write, consequence scene and one curious question, twist, revise), plus a simple timeline of attempts so learners see how their reasoning changed. C (rehearsing the call with Marcus), then E, are larger pieces of work. For reliability, anchor consequences in authored content and classify before generating; that is where the Rehearsal, Façade and Drama Llama patterns get most of their reliability.
