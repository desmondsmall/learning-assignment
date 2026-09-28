import Image from "next/image";
// coach-512.png is the original illustration (coach.png, 1254px) resized, nothing else
// changed; the avatar is shown at 72px, so 512px stays sharp on 3x screens.
import coach from "./coach-512.png";
import styles from "./CoachAvatar.module.css";

export type CoachState = "idle" | "thinking" | "speaking";

const labels: Record<CoachState, string> = {
  idle: "The coach",
  thinking: "The coach is reading",
  speaking: "The coach is giving feedback",
};

/** Pulsing dots that end the coach's status line while it reads: the ellipsis, moving. */
export function ThinkingDots() {
  return (
    <span className={styles.dots} aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

/** The coach's illustration, with a quiet cue for what it's doing. */
export function CoachAvatar({ state = "idle", size = "64px" }: { state?: CoachState; size?: string }) {
  return (
    <div
      className={`${styles.avatar} ${state === "idle" ? "" : styles[state]}`}
      style={{ "--coach-size": size } as React.CSSProperties}
      role="img"
      aria-label={labels[state]}
    >
      <div className={styles.aura} aria-hidden="true" />
      <div className={styles.art}>
        <Image src={coach} alt="" draggable={false} sizes={size} preload />
      </div>
      <div className={styles.voice} aria-hidden="true"><i /><i /><i /></div>
    </div>
  );
}
