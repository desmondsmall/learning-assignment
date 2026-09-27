import type { Scenario } from "@/lib/content";

type Props = {
  scenario: Pick<Scenario, "title" | "text" | "question">;
  /** The page heading on the page; a second-level heading inside the dialog. */
  heading: "h1" | "h2";
  titleId: string;
};

export function ScenarioCard({ scenario, heading: Heading, titleId }: Props) {
  return (
    <div className="rounded-3xl bg-cream/60 p-6 sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage-deep">The scenario</p>
      <Heading id={titleId} className="mt-3 font-display text-2xl font-semibold leading-tight text-ink sm:text-3xl">
        {scenario.title}
      </Heading>
      <p className="mt-5 leading-7 text-ink">{scenario.text}</p>
      <p className="mt-6 border-t border-sage/30 pt-5 font-display text-xl font-semibold text-sage-deep">
        {scenario.question}
      </p>
    </div>
  );
}
