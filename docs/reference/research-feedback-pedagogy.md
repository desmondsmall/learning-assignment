# Research: feedback on open-ended ethical reasoning

What learning science says about feedback on responses like the Marcus scenario, and what that means for our feedback. Gathered by a research agent.

How far to trust it: sections 1 to 5 summarize published findings, with sources. The AAC&U rubric was checked against the primary PDF; the other citations were not individually re-checked, and some 2026 arXiv papers are recent enough to deserve a look before being relied on. Anything marked **[Inference]** is reasoning about how the findings apply to us, not a finding.

## 1. Core formative feedback research

- **Hattie & Timperley (2007), "The Power of Feedback".** Good feedback answers three questions: where am I going (feed up), how am I going (feed back), where to next (feed forward). It can work at four levels: task (is it correct), process (the strategies behind the work), self-regulation (monitoring and self-assessment) and self ("great job"). Process and self-regulation feedback do most for deep learning and transfer. Praise aimed at the person is least effective. https://journals.sagepub.com/doi/abs/10.3102/003465430298487
- **Wisniewski, Zierer & Hattie (2020)**, a meta-analysis of 435 studies: average effect d = 0.48 with wide variation, and feedback works better the more information it carries. Elaborated feedback beats right/wrong or praise. https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2019.03087/full
- **Kluger & DeNisi (1996)**, 607 effect sizes: average d = 0.41, but **more than a third of feedback interventions made performance worse**. Feedback loses effect the more it draws attention to the self (ego, comparison) and away from the task. https://psycnet.apa.org/doi/10.1037/0033-2909.119.2.254
- **Butler (1988).** Comments alone improved interest and performance. Grades, and grades plus comments, undermined both: the grade crowds out the comment. This is direct support for "not a score". https://eric.ed.gov/?id=EJ380489
- **Sadler (1989).** To improve, a learner must hold a concept of the standard, compare their work against it, and act to close the gap. The long-term aim is for learners to build the evaluative expertise to judge their own work. https://link.springer.com/article/10.1007/BF00117714
- **Nicol & Macfarlane-Dick (2006), seven principles.** Good feedback clarifies what good performance is, supports self-assessment, gives high-quality information, encourages dialogue, encourages positive motivational beliefs, creates chances to close the gap (resubmission), and informs teaching. https://www.tandfonline.com/doi/abs/10.1080/03075070600572090
- **Shute (2008), "Focus on Formative Feedback".** Elaborated feedback (what, how and why), focused on the task, specific, in manageable units. Avoid grades, comparisons and heavy praise. **If feedback is too long or complicated, learners ignore it.** Directive feedback suits novices; facilitative feedback (hints, cues, questions) suits stronger learners. https://journals.sagepub.com/doi/10.3102/0034654307313795
- **Wiliam**: "Feedback should cause thinking… it should be more work for the recipient than the donor."

Taken together: effective feedback on complex work is anchored to explicit criteria, specific to this piece of work, aimed at process and self-regulation rather than the person, limited in quantity, asks the learner to do something, and avoids grades and ego-directed praise.

Juniper's case study "The Feedback Problem" describes two earlier versions of its AI feedback that fell short, and both map onto this. The first ("evaluative without being diagnostic") was task-level feedback with no process-level diagnosis. The second ("a single directive") was directive, task-level feed forward with nothing at the self-regulation level.

## 2. Feedback that doesn't give away the answer

- **Scaffolding** (van de Pol, Volman & Beishuizen, 2010) has three features: contingency (support matched to the learner's current state), fading (support withdrawn over time) and transfer of responsibility to the learner. https://link.springer.com/article/10.1007/s10648-010-9127-6
- **Intelligent tutoring systems** (VanLehn, 2011). Step-based tutoring (d ≈ 0.76) came close to human tutoring (d ≈ 0.79); answer-only feedback was much weaker (≈ 0.31). https://www.tandfonline.com/doi/full/10.1080/00461520.2011.611369 Tutoring hints usually escalate from a pointer, to the relevant principle, to a "bottom-out" hint that gives the answer. Learners who jump straight to the bottom-out hint learn less (Aleven et al., "Help Helps, But Only So Much"). https://link.springer.com/article/10.1007/s40593-015-0089-1
- **Productive failure** (Sinha & Kapur, 2021, 53 studies). Struggling with a problem before instruction beat instruction first (g = 0.36, higher when implemented faithfully). https://journals.sagepub.com/doi/10.3102/00346543211019105
- **Desirable difficulties** (Bjork & Bjork). Conditions that make practice feel harder, like generating answers and varying the task, often improve retention and transfer.
- **Bastani et al. (PNAS 2025)**, about 1,000 high-school students. An unrestricted GPT-4 tutor improved practice scores by 48% but **cut later unassisted exam performance by 17%**. A tutor limited to teacher-designed hints (no answers) improved practice by 127% and largely removed the harm. https://www.pnas.org/doi/10.1073/pnas.2422633122

**[Inference]** An ethics dilemma has no single answer to give away. The equivalent is writing the model response for the learner: the full stakeholder list, or the script for what to say. A hint ladder for this scenario might run:

1. a question pointing at what they haven't noticed ("Who else relies on this report?");
2. a lens ("What happens downstream if the client acts on a 'complete' status?");
3. a contrast between two options;
4. only after several stuck attempts, a partial worked example of one move, never the whole answer.

## 3. Rubrics for ethical reasoning and judgment

### AAC&U Ethical Reasoning VALUE rubric

Checked against the primary PDF: https://assessment.unc.edu/wp-content/uploads/sites/1284/2022/08/AACU_ER_ValueRubric.pdf

Four levels (Benchmark 1, Milestones 2 and 3, Capstone 4) across five criteria:

- **Ethical self-awareness.** From stating core beliefs or their origins, to analyzing both in depth.
- **Understanding different ethical perspectives.** From naming the theory used, to explaining its details accurately.
- **Ethical issue recognition.** Level 1 recognizes the obvious issues but misses complexity and how issues relate. Level 3 recognizes issues in a complex grey context, or sees how they relate. Level 4 does both.
- **Application of ethical perspectives.** Level 1 applies concepts only with support. Level 2 applies them independently but inaccurately. Level 3 applies them accurately without considering the implications. Level 4 considers the full implications.
- **Evaluation of different ethical perspectives.** Level 1 states a position but can't state objections. Level 2 states objections that don't affect the position. Level 3 responds to objections, inadequately. Level 4 defends against them adequately.

AAC&U says the rubric is for institutional use, "not for grading", and should be translated into local language. It also concedes that a rubric can judge whether students have the intellectual tools, not whether they would act ethically.

**[Inference]** The criteria built on naming ethical theories fit professional learners poorly. Issue recognition, handling complexity and responding to objections transfer well.

### Frameworks closer to professional judgment

- **Mumford et al.'s sensemaking model.** Seven trainable strategies: recognizing your circumstances, seeking outside help, questioning your own and others' judgment, dealing with emotions, anticipating consequences, analyzing personal motivations, considering effects on others. Training in them produced large gains, largely kept at six months. https://pmc.ncbi.nlm.nih.gov/articles/PMC2705124/
- **Giving Voice to Values** (Gentile, UVA Darden). It changes the question from "what is right?" to "if I were going to act on my values, what would I say and do, to whom, and how?", using scripting, rehearsal and anticipating the rationalizations you'll meet. It fits "What do you do?" closely. https://www.darden.virginia.edu/ibis/initiatives/gvv
- **Lasater Clinical Judgment Rubric** (nursing). Noticing, interpreting, responding, reflecting, across four levels from Beginning to Exemplary. Well validated, and a good structural model for judgment in realistic cases. https://www.nursing.umaryland.edu/media/son/mnwc/2021next-gen-nclex/Lasater-Handout_Rubric.pdf

### The developmental view: neo-Kohlbergian schemas

Rest, Narvaez, Thoma & Bebeau (the DIT-2 research) describe three schemas that people generally develop through in order:

- **Personal interests**: what I, or those close to me, gain or lose.
- **Maintaining norms**: rules, law, authority and role duties keep order.
- **Postconventional**: norms are examined for their purpose and the shared good.

Bebeau and Thoma add **intermediate concepts**: profession-specific ideas like integrity of reporting, which sit between the broad schemas and codes of conduct. https://ethicaldevelopment.ua.edu/about-the-dit/

**[Inference]** Applied to the Marcus scenario:

- *Personal interests*: "I'd get in trouble" or "I don't want to anger Marcus."
- *Maintaining norms*: "It's against policy" or "it's lying". Often correct, but thin.
- *Postconventional with intermediate concepts*: why accurate status reporting matters (the client's decisions, the board, trust in the firm, precedent), weighing Marcus's legitimate pressures, and landing on a concrete, proportionate action.

A common weak answer reaches the right conclusion ("I wouldn't send it") with norms-level reasoning and no plan. Feedback should treat that as a pattern to develop, not as wrong.

## 4. Revision cycles, uptake and mastery

- **Feedback literacy** (Carless & Boud, 2018): appreciating feedback, making judgments, managing emotion, taking action. Uptake, not delivery, is the bottleneck. https://www.tandfonline.com/doi/full/10.1080/02602938.2018.1463354
- **Winstone et al. (2017)**, a review of 195 studies, frames uptake as "proactive recipience", which works through self-appraisal, goal-setting and engagement. https://www.tandfonline.com/doi/full/10.1080/00461520.2016.1207538
- **Mastery learning** (Bloom): formative assessment, corrective feedback, reassessment. Positive effects across 108 studies, strongest for weaker students, at the cost of more time (Kulik, Kulik & Bangert-Drowns, 1990). https://journals.sagepub.com/doi/10.3102/00346543060002265
- **Mastery on open-ended tasks** isn't reaching a threshold on one fixed item. It means meeting the criteria independently, applying them to a new case, and being able to judge your own work against the standard.

**[Inference]** A fifth revision of the same scenario after four rounds of coaching shows less than a strong first attempt on a fresh one. Resubmission is practice. "Mastery" should ideally mean transfer, or at least improvement the learner can explain.

The research says little about how to write feedback that is aware of the previous attempt. Practitioner consensus and the scaffolding research suggest: name what changed, quoting before and after; say whether it addressed the earlier concern; then fade support where there was progress, and take a new angle, not louder repetition, where there wasn't. Almousa et al. (2026) found no LLM matched teachers at adapting across drafts, so this has to be engineered in. https://arxiv.org/abs/2609.28026

## 5. LLM-generated feedback, 2023 to 2026

### Effectiveness

- **Meyer et al. (2024).** LLM feedback on secondary students' essays improved revisions over no feedback (small effect, d = 0.19) and raised motivation. https://www.sciencedirect.com/science/article/pii/S2666920X23000784
- **Thomas, Koedinger et al. (2025)**, the closest analogue to JuniperAI: LLM feedback on scenario-based open responses in tutor training, 885 learners. After adjusting for selection, only 2 of 7 lessons showed significant gains. Learners who chose to use the feedback benefited, and the lessons weren't longer to complete. https://arxiv.org/abs/2506.17006
- **Steiss et al. (2024).** Humans beat ChatGPT on accuracy, prioritizing what matters, clarity and supportive tone, but ChatGPT came close at far lower cost. https://www.sciencedirect.com/science/article/pii/S0959475224000215
- **Jacobsen & Weber (2025).** Only the highest-quality, theory-based prompt gave consistently good feedback, and at that level it matched or beat experts. https://doi.org/10.3390/ai6020035

### Uptake matters more than raw quality

- **Alsaiari, Khosravi et al. (2026)**, 13,037 students. Uptake was 0.1% with self-directed AI access, 14.1% with directed feedback, and 26.2% with an "enacted" workflow where learners selected feedback points, judged their relevance and had an AI dialogue anchored to them. https://arxiv.org/abs/2608.11625
- **Karjus et al. (2026).** Across a semester of repeated AI feedback, how useful students found it declined. https://arxiv.org/abs/2607.16115

### Known failure modes

- **Generic and not adaptive**: covering every category instead of prioritizing like a teacher (Almousa et al.).
- **Too long, everything at once**, against Shute's warning.
- **Gives the answer**, which harms unassisted performance (Bastani).
- **Sycophancy and praise inflation**, including backing down when challenged. https://aclanthology.org/2025.findings-emnlp.1222.pdf
- **Misrepresenting the learner's text**: misquoting, paraphrasing inside quote marks, crediting a point the learner didn't make.
- **LLM judges favour their own output**, rating their feedback higher than human experts do (Chen et al., 2026, whose quality rubric covers acknowledging what's correct, identifying a flaw, actionable guidance, concealing the answer and tone). https://arxiv.org/abs/2608.21850 This matters if we evaluate our feedback with an LLM.

### Practices with support

Rubric-grounded, theory-based prompts (Jacobsen & Weber); hint-not-answer guardrails (Bastani); pedagogy-specific principles such as Google's LearnLM set (active learning, cognitive load, adaptivity, curiosity, metacognition) https://arxiv.org/abs/2407.12687; and workflows that make the learner select and act on feedback (Alsaiari et al.).

## 6. Design principles for our feedback

All **[Inference]**, each tied to the evidence above.

### Structure of one round of feedback

1. **Orientation, one line**: the goal of the task in rubric terms (feed up). No score or level label.
2. **Element by element, prioritized.** For each rubric element: a short verbatim quote, what it shows, and what it doesn't show yet. Elements that are fine collapse to one line. Quotes are checked in code as exact substrings of the submission.
3. **The pattern.** One limiting pattern, two at most, at the process level. This is the diagnostic layer the case study's first version lacked. For example: "Your reasoning stops at the rule", "You decide what's right but not what you'd say to Marcus", "Every consequence you name is to you."
4. **Feed forward as questions or challenges, not fixes.** One to three prompts that make the learner do the thinking. For example: "What does the client do next if they believe the checks passed?" or "Draft the first two sentences of your message to Marcus." This is what separates it from the case study's second version, a single directive.
5. **A self-regulation hook.** Before resubmitting, the learner says what they intend to change and why, and perhaps picks which point to work on.

### Tone

- A coach, not a grader: warm but candid, about the task, not the person.
- Name real strengths specifically, with a quote, never generically. Don't soften an ethical gap into a compliment.
- Hold the line on substance when the learner pushes back. A well-argued position the rubric doesn't favour still earns credit.

### Length

About 200 to 350 words for a typical round (an estimate, not a research threshold), with at most three feed-forward items. Detail can sit behind progressive disclosure.

### Weak answers and strong answers

- **Weak** (a bare refusal, rule-only reasoning, no action): more directive and specific, as suits novices. Focus on the single most limiting pattern and offer one lens or contrast. Don't list every gap, and never supply the model answer.
- **Strong**: more facilitative, and raise the difficulty with a complication or counterargument to respond to, which is AAC&U level 4. For example: "Marcus calls on Saturday and says sending a partial report breaches the contract. Now what?" Push on the how: the script, the timing, proportionate escalation. Say plainly that it is strong, since hiding that is its own dishonesty.

### Across attempts

1. Always open by recognizing what changed, quoting before and after, and saying whether it addressed the earlier pattern. The model needs the previous submission and feedback as input.
2. On progress, fade support: from directive to question, and raise the challenge.
3. When stuck (the same pattern after a revision), change the angle rather than repeat: a different lens (stakeholders, consequences, the script, Marcus's view), a contrast, or a smaller sub-task. Move one rung down the hint ladder per stuck attempt.
4. Track patterns across attempts, not just per-element status, and avoid repeating the same feedback.
5. Treat mastery as transfer: when a response is strong across the elements, suggest a new scenario rather than more polishing.

### Engineering safeguards

- Structured output per rubric element (fields for the pattern and the questions), then rendered as prose.
- Exact-substring validation of quotes.
- An explicit instruction not to write the answer for the learner.
- Human-rated evaluation, since LLM judges favour their own output.
- Measure uptake (did the revision address the flagged pattern?), not only how helpful learners say it was.
