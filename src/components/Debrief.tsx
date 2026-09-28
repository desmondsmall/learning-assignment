"use client";

import { useEffect, useRef, useState } from "react";
import { LuChevronDown, LuX } from "react-icons/lu";
import type { Path } from "@/lib/content";
import { readEvents } from "@/lib/events";
import type { SessionState } from "@/lib/session";
import { CoachAvatar, ThinkingDots } from "./CoachAvatar";

// The debrief, in a dialog over the work: the coach's closing note on what
// moved between the starting point and the final response, then every path
// someone could take, marking the ones raised as challenges. Nothing is ranked, and
// nothing marks the learner's own path. The learner can go back and keep
// revising; a new version gets a new note when the debrief is opened again.

export type DebriefPath = Pick<Path, "id" | "name" | "mostLikely" | "couldAlsoHappen" | "cost" | "protected">;

type Props = {
  open: boolean;
  onClose: () => void;
  onStartFresh: () => void;
  session: SessionState;
  sessionId: () => string;
  paths: DebriefPath[];
};

type Note = { version: number; text: string; state: "reading" | "writing" | "done" | "failed" };
type ClosingEvent = { type: "text"; text: string } | { type: "done"; note: string } | { type: "error"; message: string };

const ACCOUNT = [
  ["mostLikely", "Most likely"],
  ["couldAlsoHappen", "Could also happen"],
  ["cost", "What it cost"],
  ["protected", "What it protected"],
] as const;

export function Debrief({ open, onClose, onStartFresh, session, sessionId, paths }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [note, setNote] = useState<Note | null>(null);
  // The version a note was last asked for, so opening again doesn't ask twice.
  const asked = useRef<number | null>(null);

  const first = session.first?.response;
  const final = session.previous?.response;
  const version = session.rounds.length;
  const oneVersion = version === 1;

  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
    if (!open && dialog.current?.open) dialog.current.close();
  }, [open]);

  async function writeNote() {
    if (!first || !final) return;
    asked.current = version;
    setNote({ version, text: "", state: "reading" });
    let text = "";
    try {
      const res = await fetch("/api/closing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionId(), version, first, final, strong: session.previous!.strong }),
      });
      for await (const event of readEvents<ClosingEvent>(res)) {
        if (event.type === "text") {
          text += event.text;
          setNote({ version, text, state: "writing" });
        } else if (event.type === "done") setNote({ version, text: event.note, state: "done" });
        else if (event.type === "error") throw new Error(event.message);
      }
    } catch {
      setNote({ version, text: "", state: "failed" });
    }
  }

  useEffect(() => {
    if (open && asked.current !== version) void writeNote();
    // Only opening, or a new version, asks for a note.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, version]);

  function startFresh() {
    if (window.confirm("Start fresh? Your versions and this debrief will be cleared.")) onStartFresh();
  }

  const coach = note?.state === "reading" ? "thinking" : note?.state === "writing" ? "speaking" : "idle";
  const status =
    note?.state === "reading" ? (oneVersion ? "Reading your response" : "Reading your versions") : note?.state === "writing" ? "Writing…" : oneVersion ? "On your response" : "On what moved";
  const raised = new Set(session.raised);

  return (
    <dialog
      ref={dialog}
      aria-labelledby="debrief-title"
      onClose={onClose}
      // A click on the backdrop lands on the dialog element itself.
      onClick={(e) => e.target === dialog.current && dialog.current.close()}
      className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-4xl overflow-y-auto rounded-3xl bg-paper p-0 backdrop:bg-ink/40"
    >
      <div className="relative p-6 sm:p-8">
        <button
          type="button"
          onClick={() => dialog.current?.close()}
          className="absolute right-4 top-4 rounded-full p-2 text-ink-soft hover:bg-sage-soft"
          aria-label="Close the reflection"
        >
          <LuX className="size-5" aria-hidden="true" />
        </button>

        <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage-deep">Reflection</p>
        <h2 id="debrief-title" className="mt-3 pr-10 font-display text-2xl font-semibold leading-tight text-ink sm:text-3xl">
          Looking back
        </h2>

        <section aria-label="The coach's note" className="mt-6 rounded-3xl border border-line bg-card p-6 sm:p-7">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-sage-soft">
              <CoachAvatar state={coach} size="56px" />
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-sage-deep">Your coach</p>
              <p className="text-sm text-ink-soft" aria-live="polite">
                {status}
                {coach === "thinking" && <ThinkingDots />}
              </p>
            </div>
          </div>
          {note?.state === "failed" ? (
            <p className="mt-5 leading-7 text-ink">
              The coach couldn&rsquo;t write its note.{" "}
              <button type="button" onClick={writeNote} className="font-semibold text-sage-deep underline underline-offset-4 hover:text-ink">
                Try again
              </button>
            </p>
          ) : (
            note?.text && (
              <p className="mt-5 whitespace-pre-line leading-7 text-ink">
                {note.text}
                {note.state === "writing" && <span className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-sage" aria-hidden="true" />}
              </p>
            )
          )}
        </section>

        <section aria-labelledby="paths-title" className="mt-8">
          <h3 id="paths-title" className="font-display text-xl font-semibold text-ink">
            Every path someone could take here
          </h3>
          <p className="mt-2 text-sm leading-6 text-ink-soft">
            Nothing here is ranked.{raised.size > 0 && " The ones marked came up as challenges while you worked."} Open any of them to see how it might play out.
          </p>
          <ul className="mt-4 space-y-2">
            {paths.map((p) => (
              <li key={p.id}>
                <details className="group rounded-2xl border border-line bg-card">
                  <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <span className="font-semibold text-ink">{p.name}</span>
                      {raised.has(p.id) && (
                        <span className="rounded-full bg-sage-soft px-2.5 py-0.5 text-xs font-semibold text-sage-deep">Raised with you</span>
                      )}
                    </span>
                    <LuChevronDown className="ml-auto size-5 shrink-0 text-ink-soft transition group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <dl className="space-y-3 px-5 pb-5 leading-7">
                    {ACCOUNT.map(([key, label]) => (
                      <div key={key}>
                        <dt className="text-sm font-semibold text-sage-deep">{label}</dt>
                        <dd className="text-ink">{p[key]}</dd>
                      </div>
                    ))}
                  </dl>
                </details>
              </li>
            ))}
          </ul>
        </section>

        {/* Going back is the default; starting fresh clears everything, so it asks first. */}
        <div className="mt-8 flex flex-col gap-2 border-t border-line pt-6 sm:flex-row-reverse sm:justify-start">
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            className="rounded-full bg-sage-deep px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-ink"
          >
            Back to your response
          </button>
          <button
            type="button"
            onClick={startFresh}
            className="rounded-full border border-sage/50 px-5 py-2.5 text-sm font-semibold text-sage-deep transition hover:bg-sage-soft"
          >
            Start fresh
          </button>
        </div>
      </div>
    </dialog>
  );
}
