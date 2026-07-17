import { FolderTree } from "lucide-react";

import GlassCard from "../common/GlassCard";
import CardTitle from "../common/CardTitle";

interface Architecture {
  description: string;
  diagram: string;
  patterns: string[];
}

interface ArchitectureCardProps {
  report: {
    architecture: Architecture;
  };
}

export default function ArchitectureCard({
  report,
}: ArchitectureCardProps) {
  return (
    <GlassCard delay={0.08}>
      <CardTitle icon={<FolderTree size={18} />}>
        Architecture
      </CardTitle>

      <p
        className="text-sm mb-3"
        style={{ color: "#CBD5E1" }}
      >
        {report.architecture.description}
      </p>

      <pre
        className="text-[12px] rounded-[14px] p-4 overflow-x-auto mb-3"
        style={{
          background: "rgba(0,0,0,0.3)",
          color: "#66FCF1",
          border: "1px solid rgba(97,218,251,0.10)",
        }}
      >
        {report.architecture.diagram}
      </pre>

      <div className="flex flex-wrap gap-2">
        {report.architecture.patterns.map((p, i) => (
          <span
            key={i}
            className="text-[11px] px-2.5 py-1 rounded-full"
            style={{
              background: "rgba(79,209,197,0.10)",
              color: "#4FD1C5",
              border: "1px solid rgba(79,209,197,0.25)",
            }}
          >
            {p}
          </span>
        ))}
      </div>
    </GlassCard>
  );
}