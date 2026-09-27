import scenario from "../../content/scenario.json";
import { Session } from "@/components/Session";

export default function Home() {
  return (
    <main className="mx-auto grid w-full max-w-6xl flex-1 content-start gap-6 px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10 lg:py-14">
      <section aria-labelledby="scenario-title" className="lg:sticky lg:top-8 lg:self-start">
        <div className="rounded-3xl bg-cream/60 p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage-deep">The scenario</p>
          <h1 id="scenario-title" className="mt-3 font-display text-2xl font-semibold leading-tight text-ink sm:text-3xl">
            {scenario.title}
          </h1>
          <p className="mt-5 leading-7 text-ink">{scenario.text}</p>
          <p className="mt-6 border-t border-sage/30 pt-5 font-display text-xl font-semibold text-sage-deep">
            {scenario.question}
          </p>
        </div>
      </section>

      <Session />
    </main>
  );
}
