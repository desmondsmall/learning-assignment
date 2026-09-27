import "server-only";
import Anthropic from "@anthropic-ai/sdk";

// The one Anthropic client for the app. It reads ANTHROPIC_API_KEY from the
// environment. The server-only import makes the build fail if a client
// component ever imports this file, so the key can't reach the browser.
export const anthropic = new Anthropic();

export const MODEL = process.env.CLAUDE_MODEL ?? "claude-opus-5";
