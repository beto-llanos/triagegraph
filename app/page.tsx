import TriageStage from "./components/triage-stage";
import { buildInitialState } from "@/lib/triage/mock";

export default function Home() {
  const initialState = buildInitialState();
  return <TriageStage initialState={initialState} />;
}
