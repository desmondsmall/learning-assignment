import { Workspace } from "@/components/Workspace";
import { content } from "@/lib/content";

export default function Home() {
  const { title, text, question } = content.scenario;
  // Only what the debrief shows of each path: never the summaries the judge reads or the challenges.
  const paths = content.paths.map(({ id, name, mostLikely, couldAlsoHappen, cost, protected: kept }) => ({ id, name, mostLikely, couldAlsoHappen, cost, protected: kept }));
  return <Workspace scenario={{ title, text, question }} paths={paths} />;
}
