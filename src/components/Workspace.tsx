"use client";

import { useRef, useState } from "react";
import { LuX } from "react-icons/lu";
import type { Scenario } from "@/lib/content";
import { ScenarioCard } from "./ScenarioCard";
import { Session } from "./Session";

type Props = {
  scenario: Pick<Scenario, "title" | "text" | "question">;
  optionsQuestion: string;
  firstChallenge: string;
};

// Large screens show the scenario beside the work throughout. Small screens
// take it in two steps: read the scenario and start, then work, with the
// scenario one tap away in a dialog.
export function Workspace({ scenario, optionsQuestion, firstChallenge }: Props) {
  const [started, setStarted] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  function start() {
    setStarted(true);
    window.scrollTo({ top: 0 });
  }

  return (
    <main className="mx-auto grid w-full max-w-6xl flex-1 content-start gap-6 px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10 lg:py-14">
      {/* On a phone, before starting, the scenario and button fill the screen and sit centred in it. */}
      <section
        aria-labelledby="scenario-title"
        className={`${started ? "hidden" : "flex min-h-[calc(100dvh-4rem)] flex-col justify-center sm:min-h-[calc(100dvh-5rem)]"} lg:sticky lg:top-8 lg:block lg:min-h-0 lg:self-start`}
      >
        <ScenarioCard scenario={scenario} heading="h1" titleId="scenario-title" />
        <button
          type="button"
          onClick={start}
          className="mt-5 w-full rounded-full bg-sage-deep px-6 py-3 font-semibold text-white transition hover:bg-ink lg:hidden"
        >
          Start writing
        </button>
      </section>

      <div className={`${started ? "" : "hidden"} lg:block`}>
        <Session optionsQuestion={optionsQuestion} firstChallenge={firstChallenge} onShowScenario={() => dialog.current?.showModal()} />
      </div>

      <dialog
        ref={dialog}
        aria-labelledby="scenario-dialog-title"
        // A click on the backdrop lands on the dialog element itself.
        onClick={(e) => e.target === dialog.current && dialog.current.close()}
        className="m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-3xl bg-paper p-0 backdrop:bg-ink/40"
      >
        <div className="relative">
          <ScenarioCard scenario={scenario} heading="h2" titleId="scenario-dialog-title" />
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            className="absolute right-4 top-4 rounded-full p-2 text-ink-soft hover:bg-sage-soft"
            aria-label="Close the scenario"
          >
            <LuX className="size-5" aria-hidden="true" />
          </button>
        </div>
      </dialog>
    </main>
  );
}
