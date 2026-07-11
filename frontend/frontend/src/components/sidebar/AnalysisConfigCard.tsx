import { Cpu } from "lucide-react";

import GlassCard from "../common/GlassCard";
import CardTitle from "../common/CardTitle";

interface AnalysisConfigCardProps {
  goal: string;
}

export default function AnalysisConfigCard({
  goal,
}: AnalysisConfigCardProps) {
  const rows = [
    {
      label: "Review Goal",
      value: goal || "Review the complete repository",
    },
    {
      label: "Embedding Model",
      value: "BAAI/bge-small-en-v1.5",
    },
    {
      label: "LLM",
      value: "Gemini 2.5 Flash",
    },
    {
      label: "Vector Database",
      value: "ChromaDB",
    },
    {
      label: "Orchestrator",
      value: "LangGraph",
    },
  ];

  return (
    <GlassCard delay={0.05}>
      <CardTitle icon={<Cpu size={18} />}>
        Analysis Configuration
      </CardTitle>

      <div className="space-y-3">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex flex-col gap-0.5"
          >
            <span
              className="text-[11px] uppercase tracking-wide"
              style={{ color: "#94A3B8" }}
            >
              {r.label}
            </span>

            <span
              className="text-[13px] truncate"
              style={{ color: "#F8FAFC" }}
            >
              {r.value}
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}