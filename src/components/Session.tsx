"use client";

import { useRef, useState } from "react";
import { LuFileText, LuPencil } from "react-icons/lu";
import { newSession, type Mode, type SessionState } from "@/lib/session";
import { CoachAvatar, type CoachState } from "./CoachAvatar";

// The learner's side of the loop. Each submission goes to /api/feedback, which
// streams back the round: the judge's verdict and the prompt the feedback ends
// with, then the coach's words as they're written, then the next session state.
// The session lives only in this page: a refresh starts over.

type ShownPrompt = { kind: "options" | "challenge" | "lastTest"; text: string };
/** What one submission got back. */
type Round = { feedback: string; prompt: ShownPrompt | null; mode: Mode };
type Version = Round & { text: string };

const OPENING = "Take your time. Write what you'd actually do, and why.";
const HINTS = {
  lastTest: "If your response already handles this, you're done. If not, you can add it.",
  tooShort: "Add to your response and submit it again.",
};
const FAILED = "The coach couldn't finish. Your response is still here: try submitting it again.";

export function Session({ onShowScenario }: { onShowScenario: () => void }) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [viewing, setViewing] = useState(0); // index into versions; versions.length means the version being written
  const [draft, setDraft] = useState("");
  const [coach, setCoach] = useState<CoachState>("idle");
  const [streamed, setStreamed] = useState("");
  const [session, setSession] = useState<SessionState>(newSession);
  // Feedback on a submission that isn't kept as a version: too short, or unchanged.
  const [note, setNote] = useState<Round | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sessionId = useRef<string | null>(null);

  const busy = coach !== "idle";
  const onDraft = viewing === versions.length;
  const latest = note ?? versions.at(-1);
  const shown: Round | undefined = onDraft ? latest : versions[viewing];

  async function submit() {
    const text = draft.trim();
    if (!text || busy) return;
    sessionId.current ??= crypto.randomUUID();
    const count = versions.length;
    setViewing(count);
    setCoach("thinking");
    setStreamed("");
    setError(null);

    let round: Omit<Round, "feedback"> | null = null;
    let feedback = "";
    let next: SessionState | null = null;
    let failure: string | null = null;
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionId.current, response: text, session }),
      });
      if (!res.ok || !res.body) throw new Error(`status ${res.status}`);
      // Newline-delimited JSON: one event per line, split across chunks as it arrives.
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += value;
        const lines = buffer.split("\n");
        buffer = lines.pop()!;
        for (const line of lines.filter(Boolean)) {
          const event = JSON.parse(line);
          if (event.type === "judgment") round = { mode: event.mode, prompt: event.prompt };
          else if (event.type === "text") {
            feedback += event.text;
            setCoach("speaking");
            setStreamed(feedback);
          } else if (event.type === "done") {
            feedback = event.feedback;
            next = event.session;
          } else if (event.type === "error") failure = event.message;
        }
      }
    } catch {
      failure = FAILED;
    }

    if (failure || !round || !next) {
      setError(failure ?? FAILED);
    } else if (round.mode === "too_short" || round.mode === "unchanged") {
      setSession(next);
      setNote({ ...round, feedback });
    } else {
      setSession(next);
      setNote(null);
      setVersions((v) => [...v, { ...round!, feedback, text }]);
      setViewing(count + 1);
    }
    setCoach("idle");
  }

  // Makes the version on screen the one being written. Every submitted version stays
  // in the history, so only unsubmitted changes can be lost: ask first.
  function reviseFromViewed() {
    const unsubmitted = draft.trim() !== (versions.at(-1)?.text ?? "");
    if (unsubmitted && !window.confirm(`Replace what you've written in version ${versions.length + 1} with version ${viewing + 1}? Your changes since your last submission will be lost.`)) return;
    setDraft(versions[viewing].text);
    setViewing(versions.length);
  }

  const failed = onDraft && !busy && error;
  const feedbackText = busy ? streamed : failed ? error : (shown?.feedback ?? OPENING);
  const prompt = busy || failed ? null : shown?.prompt;
  const hint =
    busy || failed || shown !== latest || !shown
      ? null
      : shown.mode === "too_short"
        ? HINTS.tooShort
        : shown.prompt?.kind === "lastTest"
          ? HINTS.lastTest
          : null;
  const status =
    coach === "thinking"
      ? "Reading your response…"
      : coach === "speaking"
        ? "Writing feedback…"
        : shown && shown === note
          ? "Feedback on your last submission"
          : shown
            ? `Feedback on version ${versions.indexOf(shown as Version) + 1}`
            : "Ready when you are";

  // The version being written is numbered as the version it will become.
  const versionLabel = (i: number) =>
    i === 0 ? "Version 1 · your starting point" : i === versions.length ? `Version ${i + 1} · in progress` : `Version ${i + 1}`;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <nav aria-label="Your versions" className="min-w-0 overflow-x-auto">
          <div className="flex w-max gap-1 rounded-full border border-line bg-card p-1">
            {[...versions.keys(), versions.length].map((i) => {
              const isDraft = i === versions.length;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setViewing(i)}
                  disabled={busy}
                  aria-current={viewing === i ? "true" : undefined}
                  title={versionLabel(i)}
                  className={`min-w-9 rounded-full px-3 py-1.5 text-sm tabular-nums transition disabled:opacity-40 ${
                    viewing === i ? "bg-sage-deep font-semibold text-white" : "text-ink-soft hover:bg-sage-soft"
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {isDraft && <LuPencil className="size-3.5" aria-hidden="true" />}
                    {i + 1}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Small screens only: the scenario isn't on screen beside the work. */}
        <button
          type="button"
          onClick={onShowScenario}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-card px-3.5 py-2 text-sm font-semibold text-sage-deep hover:bg-sage-soft lg:hidden"
        >
          <LuFileText className="size-4" aria-hidden="true" />
          Scenario
        </button>
      </div>

      <section aria-label="The coach's feedback" className="rounded-3xl border border-line bg-card p-6 shadow-[0_18px_50px_rgb(45_75_55/0.05)] sm:p-7">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-sage-soft">
            <CoachAvatar state={coach} size="72px" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-sage-deep">Your coach</p>
            <p className="text-sm text-ink-soft" aria-live="polite">
              {status}
            </p>
          </div>
        </div>

        {/* While the coach is reading there are no words yet, so the card is just its header. */}
        {feedbackText && (
          <p className="mt-5 whitespace-pre-line leading-7 text-ink">
            {feedbackText}
            {coach === "speaking" && <span className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-sage" aria-hidden="true" />}
          </p>
        )}

        {prompt && (
          <p className="mt-5 leading-7 text-ink">
            <span className="font-semibold text-sage-deep">{prompt.kind === "lastTest" ? "Want to see if it holds? " : "Something to consider: "}</span>
            &ldquo;{prompt.text}&rdquo;
          </p>
        )}

        {hint && <p className="mt-6 border-t border-line pt-4 text-sm text-ink-soft">{hint}</p>}
      </section>

      <section aria-label="Your response" className="rounded-3xl border border-line bg-card p-6 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label htmlFor="response" className="font-display text-lg font-semibold text-ink">
            Your response
          </label>
          <span className="text-sm text-ink-soft">{versionLabel(viewing)}</span>
        </div>

        <textarea
          id="response"
          value={onDraft ? draft : versions[viewing].text}
          onChange={(e) => setDraft(e.target.value)}
          readOnly={!onDraft || busy}
          rows={9}
          placeholder="What would you do, and why?"
          className="mt-4 w-full resize-y rounded-2xl border border-line bg-paper/60 px-4 py-3 leading-7 text-ink outline-none placeholder:text-ink-soft/60 read-only:text-ink-soft focus:border-sage focus:ring-2 focus:ring-sage/25"
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          {onDraft && (
            <p className="text-sm text-ink-soft">
              Revise and resubmit as often as you like.
              <span className="mt-0.5 block text-xs text-ink-soft/60">Responses are saved anonymously to improve the coach.</span>
            </p>
          )}
          {onDraft ? (
            <button
              type="button"
              onClick={submit}
              disabled={busy || !draft.trim()}
              className="ml-auto rounded-full bg-sage-deep px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-ink disabled:opacity-40"
            >
              {versions.length ? "Submit revision" : "Submit"}
            </button>
          ) : (
            <div className="ml-auto flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={reviseFromViewed}
                disabled={busy}
                className="rounded-full border border-sage/50 px-5 py-2.5 text-sm font-semibold text-sage-deep transition hover:bg-sage-soft disabled:opacity-40"
              >
                Revise from this version
              </button>
              <button
                type="button"
                onClick={() => setViewing(versions.length)}
                disabled={busy}
                className="rounded-full bg-sage-deep px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-ink disabled:opacity-40"
              >
                Back to version {versions.length + 1}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
