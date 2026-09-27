import { Workspace } from "@/components/Workspace";
import { content, pathById } from "@/lib/content";

export default function Home() {
  const { title, text, question, optionsQuestion, challengeOrder } = content.scenario;

  return (
    <Workspace
      scenario={{ title, text, question }}
      optionsQuestion={optionsQuestion}
      firstChallenge={pathById(challengeOrder[0]).challenge}
    />
  );
}
