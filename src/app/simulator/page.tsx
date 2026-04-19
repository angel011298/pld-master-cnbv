import { QuizSimulator } from "@/components/QuizSimulator";
import { PaywallGate } from "@/components/PaywallGate";

export default function SimulatorPage() {
  return (
    <PaywallGate>
      <div className="flex-1 px-4">
        <QuizSimulator />
      </div>
    </PaywallGate>
  );
}
