"use client";

import { useRef, useState } from "react";
import { LuX } from "react-icons/lu";
import type { Scenario } from "@/lib/content";
import { debriefOffer, newSession, type SessionState } from "@/lib/session";
import { Debrief, type DebriefPath } from "./Debrief";
import { DebriefButton } from "./DebriefButton";
import { ScenarioCard } from "./ScenarioCard";
import { Session } from "./Session";

type Props = {
  scenario: Pick<Scenario, "title" | "text" | "question">;
  paths: DebriefPath[];
};

// Large screens show the scenario beside the work throughout. Small screens
// take it in two steps: read the scenario and start, then work, with the
// scenario one tap away in a dialog. The Reflection button, which opens the debrief, is always there, below the
// scenario or beside its button, and opens once the rules in code allow it.
export function Workspace({ scenario, paths }: Props) {
  const [started, setStarted] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const [session, setSession] = useState<SessionState>(newSession);
  const sessionIdRef = useRef<string | null>(null);
  const sessionId = () => (sessionIdRef.current ??= crypto.randomUUID());
  // Starting fresh bumps this, which remounts the work and the debrief with nothing in them.
  const [run, setRun] = useState(0);
  const [debriefOpen, setDebriefOpen] = useState(false);
  const offer = debriefOffer(session);

  function start() {
    setStarted(true);
    window.scrollTo({ top: 0 });
  }

  function startFresh() {
    sessionIdRef.current = null;
    setSession(newSession());
    setRun((r) => r + 1);
    setDebriefOpen(false);
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
        <div className="mt-5 hidden lg:block">
          <DebriefButton
            available={offer !== null}
            onOpen={() => setDebriefOpen(true)}
            className="w-full rounded-full border border-sage/50 bg-card px-6 py-3 font-semibold text-sage-deep transition hover:bg-sage-soft aria-disabled:hover:bg-card"
          >
            Reflection
          </DebriefButton>
        </div>
      </section>

      {/* min-w-0 lets the version tabs scroll, rather than widen the page. */}
      <div className={`${started ? "" : "hidden"} min-w-0 lg:block`}>
        <Session
          key={run}
          session={session}
          onSession={setSession}
          sessionId={sessionId}
          onShowScenario={() => dialog.current?.showModal()}
          onShowDebrief={() => setDebriefOpen(true)}
        />
      </div>

      <Debrief
        key={run}
        open={debriefOpen}
        onClose={() => setDebriefOpen(false)}
        onStartFresh={startFresh}
        session={session}
        sessionId={sessionId}
        paths={paths}
      />

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
