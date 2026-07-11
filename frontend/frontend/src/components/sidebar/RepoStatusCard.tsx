import { FolderTree } from "lucide-react";

import GlassCard from "../common/GlassCard";
import CardTitle from "../common/CardTitle";

interface RepoStatusCardProps {
  repoLabel: string;
  loading: boolean;
  done: boolean;
}

export default function RepoStatusCard({
  repoLabel,
  loading,
  done,
}: RepoStatusCardProps) {
  return (
    <GlassCard delay={0.02}>
      <CardTitle icon={<FolderTree size={18} />}>
        Repository Status
      </CardTitle>

      <div className="flex items-center gap-3">
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{
            background: done
              ? "#22C55E"
              : loading
              ? "#3DD9EB"
              : "#475569",
          }}
        />

        <span
          className="text-sm"
          style={{ color: "#CBD5E1" }}
        >
          {done
            ? "Analysis Complete"
            : loading
            ? "Processing..."
            : "Awaiting Input"}
        </span>
      </div>

      <p
        className="text-[13px] mt-2 truncate"
        style={{ color: "#94A3B8" }}
      >
        {repoLabel || "No repository loaded"}
      </p>
    </GlassCard>
  );
}