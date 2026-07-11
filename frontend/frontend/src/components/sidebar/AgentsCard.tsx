import { Layers } from "lucide-react";

import GlassCard from "../common/GlassCard";
import CardTitle from "../common/CardTitle";

interface PipelineStep {
  key: string;
  label: string;
  status: string;
}

interface AgentsCardProps {
  steps: PipelineStep[];
  AGENT_KEYS: string[];
  AGENT_LABELS: Record<string, string>;
}

export default function AgentsCard({
  steps,
  AGENT_KEYS,
  AGENT_LABELS,
}: AgentsCardProps) {
  return (
    <GlassCard delay={0.1}>
      <CardTitle icon={<Layers size={18} />}>
        AI Agents
      </CardTitle>

      <div className="space-y-3">
        {AGENT_KEYS.map((key) => {
          const status =
            steps.find((s) => s.key === key)?.status || "waiting";

          const badge =
            status === "completed"
              ? {
                  label: "Completed",
                  color: "#22C55E",
                  bg: "rgba(34,197,94,0.12)",
                }
              : status === "running"
              ? {
                  label: "Running",
                  color: "#3DD9EB",
                  bg: "rgba(61,217,235,0.12)",
                }
              : {
                  label: "Waiting",
                  color: "#94A3B8",
                  bg: "rgba(148,163,184,0.10)",
                };

          return (
            <div
              key={key}
              className="flex items-center justify-between"
            >
              <span
                className="text-[13px]"
                style={{ color: "#CBD5E1" }}
              >
                {AGENT_LABELS[key]}
              </span>

              <span
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                style={{
                  color: badge.color,
                  background: badge.bg,
                  border: `1px solid ${badge.color}33`,
                }}
              >
                {badge.label}
              </span>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}