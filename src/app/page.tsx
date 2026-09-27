import { Workspace } from "@/components/Workspace";
import { content } from "@/lib/content";

export default function Home() {
  const { title, text, question } = content.scenario;
  return <Workspace scenario={{ title, text, question }} />;
}
