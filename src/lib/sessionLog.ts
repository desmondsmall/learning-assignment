import "server-only";
import { put } from "@vercel/blob";
import type { Judgment, Prompt } from "./rules";
import type { Mode } from "./session";

// A record of each exchange on the live app, so we can see what learners write
// and where the judge and coach fall short. One private JSON file per exchange,
// grouped by environment and session, in Vercel Blob. Anonymous: a session is
// known only by a random ID the page makes, and nothing else about the learner
// is kept. Function logs never carry learner text; this store is the one place
// it's kept.

export type ExchangeRecord = {
  sessionId: string;
  /** The version this submission would become. */
  version: number;
  mode?: Mode;
  response: string;
  judgment?: Judgment;
  strong?: boolean;
  prompt?: (Prompt & { text: string }) | null;
  feedback?: string;
  model: string;
  judge?: { ms: number; usage?: unknown };
  coach?: { ms: number; firstTextMs: number | null; usage?: unknown };
  error?: string;
  /** When it was saved: runtime data in the store. */
  at?: string;
};

/** The debrief's closing note, beside the feedback files of the same session. */
export type ClosingRecord = {
  sessionId: string;
  /** The final version the note is about. */
  version: number;
  first: string;
  final: string;
  strong: boolean;
  note?: string;
  model: string;
  closing?: { ms: number; firstTextMs: number | null; usage?: unknown };
  error?: string;
  at?: string;
};

/**
 * Saves one exchange. Does nothing without BLOB_READ_WRITE_TOKEN, so local
 * development and the evals store nothing unless we choose to.
 */
export function saveExchange(record: ExchangeRecord) {
  return save(record, "feedback");
}

/** Saves one closing note, the same way. */
export function saveClosing(record: ClosingRecord) {
  return save(record, "closing");
}

async function save(record: { sessionId: string; version: number }, kind: "feedback" | "closing") {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;
  const env = process.env.VERCEL_ENV ?? "development";
  // One file per exchange: a blob can't be appended to, and the random suffix
  // means a retried round never overwrites another.
  await put(`${env}/sessions/${record.sessionId}/${record.version}-${kind}.json`, JSON.stringify({ ...record, at: new Date().toISOString() }, null, 2), {
    access: "private",
    addRandomSuffix: true,
    contentType: "application/json",
  });
}
