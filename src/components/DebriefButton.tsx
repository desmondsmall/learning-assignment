"use client";

import { useId, useState } from "react";

const NOT_YET = "Available once you have a strong response, or if you get stuck.";

type Props = {
  available: boolean;
  onOpen: () => void;
  children: React.ReactNode;
  className: string;
  /** Where the hint lines up under the button: centred, or with its right edge when the button sits at the edge of a phone screen. */
  align?: "center" | "end";
};

/**
 * The Reflection button, which opens the debrief. It is on the page from the
 * start, so nothing appears when it becomes available. Until then it does
 * nothing, and hovering, focusing or tapping it shows when it will. It's
 * aria-disabled rather than disabled, so it can still be focused and tapped.
 */
export function DebriefButton({ available, onOpen, children, className, align = "center" }: Props) {
  const hintId = useId();
  // Phones have no hover: a tap shows the hint until the next tap elsewhere.
  const [tapped, setTapped] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-disabled={!available}
        aria-describedby={available ? undefined : hintId}
        onClick={() => (available ? onOpen() : setTapped(true))}
        onBlur={() => setTapped(false)}
        className={`peer aria-disabled:cursor-not-allowed aria-disabled:opacity-40 ${className}`}
      >
        {children}
      </button>
      {!available && (
        <span
          id={hintId}
          role="tooltip"
          className={`pointer-events-none absolute top-full z-10 mt-2 w-max max-w-60 rounded-xl bg-ink px-3 py-2 text-center text-xs leading-5 text-white shadow-lg transition-opacity peer-hover:opacity-100 peer-focus-visible:opacity-100 ${
            tapped ? "opacity-100" : "opacity-0"
          } ${align === "end" ? "right-0" : "left-1/2 -translate-x-1/2"}`}
        >
          {NOT_YET}
        </span>
      )}
    </div>
  );
}
