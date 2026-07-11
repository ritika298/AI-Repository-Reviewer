import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import GlassCard from "../common/GlassCard";

interface PipelineStep {
  key: string;
  label: string;
  status: string;
}

interface AIThinkingProps {
  steps: PipelineStep[];
  AGENT_KEYS: string[];
  AGENT_LABELS: Record<string, string>;
}

export default function AIThinking({
  steps,
  AGENT_KEYS,
  AGENT_LABELS,
}: AIThinkingProps) {
  const runningAgents = AGENT_KEYS.filter(
    (k) => steps.find((s) => s.key === k)?.status === "running"
  );

  const displayAgent =
    runningAgents[0] ||
    AGENT_KEYS.find(
      (k) => steps.find((s) => s.key === k)?.status !== "completed"
    );

  return (
    <GlassCard>
      <div className="flex items-center gap-3">
        <Sparkles
          size={20}
          style={{ color: "#3DD9EB" }}
          className="animate-pulse"
        />

        <span
          className="text-sm"
          style={{ color: "#CBD5E1" }}
        >
          {displayAgent
            ? AGENT_LABELS[displayAgent]
            : "Preparing agents"}{" "}
          thinking
        </span>

        <span className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#3DD9EB" }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </span>
      </div>
    </GlassCard>
  );
}