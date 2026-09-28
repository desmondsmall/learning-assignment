# Scenario coach

A small web tool that gives learners feedback on a professional judgment scenario. The learner reads the scenario, writes a response and submits it. A coach gives feedback on what they wrote, ending with a path they didn't take to test their next version against, and they revise and resubmit as often as they like.

How the coach works, and why, is in `docs/`.

## View it live

https://learning-assignment-nine.vercel.app/

## Running it locally

Needs Node.js 20 or later.

```bash
npm install
cp .env.example .env.local   # then add your ANTHROPIC_API_KEY
npm run dev                  # http://localhost:3000
```

## Tests and evals

```bash
npm test          # the rules applied in code, without calling a model
npm run eval      # the judge against 29 labelled responses; calls the API
```

How the evals work and how to read them is in `docs/evals.md`.

## Layout

| Path | What's there |
| --- | --- |
| `src/app/` | The page the learner uses, and the API routes that call the model. |
| `src/lib/` | Server-side logic: the Anthropic client, content loading, the rules applied in code. |
| `content/` | The authored scenario, rubric, paths and challenges, as data. |
| `prompts/` | One prompt template per job the model does. |
| `evals/` | Labelled cases and the script that checks the coach against them. |
| `docs/` | How the coach works and why, and the research behind it in `docs/reference/`. |

## Deploying

The app deploys to Vercel as a standard Next.js project. Set `ANTHROPIC_API_KEY` in the project's environment variables.

To keep an anonymous record of each exchange (the response, the judgment and the feedback), create a private Vercel Blob store and connect it to the project, which sets `BLOB_READ_WRITE_TOKEN`. Without it, nothing is stored. Each exchange is one JSON file at `<environment>/sessions/<session id>/`, browsable in the Vercel dashboard under Storage.
