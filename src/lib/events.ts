/**
 * The events in a streamed reply from the app's routes: newline-delimited JSON,
 * one event per line, split across chunks as it arrives.
 */
export async function* readEvents<E>(res: Response): AsyncGenerator<E> {
  if (!res.ok || !res.body) throw new Error(`status ${res.status}`);
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += value;
    const lines = buffer.split("\n");
    buffer = lines.pop()!;
    for (const line of lines) if (line) yield JSON.parse(line) as E;
  }
}
