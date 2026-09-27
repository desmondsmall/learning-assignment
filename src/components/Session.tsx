"use client";

import { useEffect, useRef, useState } from "react";
import { LuFileText, LuPencil } from "react-icons/lu";
import { CoachAvatar, type CoachState } from "./CoachAvatar";

// A preview of the loop with no model behind it yet: submitting shows the
// coach reading, then streams placeholder text in place of real feedback.

type Version = { text: string; feedback: string; prompt: string };

const OPENING = "Take your time. Write what you'd actually do, and why.";
const PLACEHOLDER =
  "This is a preview. The coach isn't connected yet, so this isn't feedback on what you wrote. When it is, the coach's feedback on your response will appear here as it's written, and end with something to take into your next version.";
const NEXT_STEP =
  "The coach reads your next version, not replies. Work your answer into your response and submit it again.";

// The preview's stand-in for the rule in code: the options question after the
// first version, and the first challenge in the authored order after that.
export function Session({
  optionsQuestion,
  firstChallenge,
  onShowScenario,
}: {
  optionsQuestion: string;
  firstChallenge: string;
  onShowScenario: () => void;
}) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [viewing, setViewing] = useState(0); // index into versions; versions.length means the draft
  const [draft, setDraft] = useState("");
  const [coach, setCoach] = useState<CoachState>("idle");
  const [streamed, setStreamed] = useState("");
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const busy = coach !== "idle";
  const onDraft = viewing === versions.length;
  const shown = onDraft ? versions.at(-1) : versions[viewing];
  const latest = shown === versions.at(-1);

  function submit() {
    const text = draft.trim();
    if (!text || busy) return;
    const prompt = versions.length === 0 ? optionsQuestion : firstChallenge;
    setCoach("thinking");
    setStreamed("");
    const words = PLACEHOLDER.split(" ");
    timers.current.push(
      window.setTimeout(() => {
        setCoach("speaking");
        words.forEach((_, i) => {
          timers.current.push(
            window.setTimeout(() => {
              setStreamed(words.slice(0, i + 1).join(" "));
              if (i === words.length - 1) {
                setVersions((v) => [...v, { text, feedback: PLACEHOLDER, prompt }]);
                setViewing((i) => i + 1);
                setCoach("idle");
              }
            }, i * 45),
          );
        });
      }, 1800),
    );
  }

  // Makes the version on screen the working draft. Every submitted version stays
  // in the history, so only unsubmitted changes to the draft can be lost: ask first.
  function reviseFromViewed() {
    const unsubmitted = draft.trim() !== (versions.at(-1)?.text ?? "");
    if (unsubmitted && !window.confirm(`Replace what you've written in version ${versions.length + 1} with version ${viewing + 1}? Your changes since your last submission will be lost.`)) return;
    setDraft(versions[viewing].text);
    setViewing(versions.length);
  }

  const feedbackText = busy ? streamed : shown?.feedback ?? OPENING;
  const prompt = busy ? null : shown?.prompt;

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
              {coach === "thinking" ? "Reading your response…" : coach === "speaking" ? "Writing feedback…" : shown ? `Feedback on version ${versions.indexOf(shown) + 1}` : "Ready when you are"}
            </p>
          </div>
        </div>

        <p className="mt-5 min-h-12 whitespace-pre-line leading-7 text-ink">
          {feedbackText}
          {coach === "speaking" && <span className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-sage" aria-hidden="true" />}
        </p>

        {prompt && (
          <p className="mt-5 leading-7 text-ink">
            <span className="font-semibold text-sage-deep">For your next version: </span>
            &ldquo;{prompt}&rdquo;
          </p>
        )}

        {prompt && latest && (
          <p className="mt-6 border-t border-line pt-4 text-sm text-ink-soft">{NEXT_STEP}</p>
        )}
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
          {onDraft && <p className="text-sm text-ink-soft">Revise and resubmit as often as you like.</p>}
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
