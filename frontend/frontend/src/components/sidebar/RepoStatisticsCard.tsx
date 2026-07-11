import {
  Activity,
  Clock,
  Database,
  FileCode2,
  FileSearch,
  GitBranch,
  TrendingUp,
} from "lucide-react";

import GlassCard from "../common/GlassCard";
import CardTitle from "../common/CardTitle";

interface AnalysisReport {
  repository: {
    totalFiles: number;
    framework: string;
    language: string;
  };
  filesRetrievedByRag: any[];
  healthScore: number;
}

interface RepoStatisticsCardProps {
  report: AnalysisReport | null;
  elapsedMs: number;
}

export default function RepoStatisticsCard({
  report,
  elapsedMs,
}: RepoStatisticsCardProps) {
  const stats = [
    {
      icon: <FileCode2 size={16} />,
      label: "Files Indexed",
      value: report?.repository.totalFiles ?? 0,
    },
    {
      icon: <FileSearch size={16} />,
      label: "Files Retrieved",
      value: report?.filesRetrievedByRag.length ?? 0,
    },
    {
      icon: <Database size={16} />,
      label: "Framework",
      value: report?.repository.framework ?? "—",
    },
    {
      icon: <GitBranch size={16} />,
      label: "Language",
      value: report?.repository.language ?? "—",
    },
    {
      icon: <Clock size={16} />,
      label: "Processing Time",
      value: `${(elapsedMs / 1000).toFixed(1)}s`,
    },
    {
      icon: <TrendingUp size={16} />,
      label: "Health Score",
      value: report?.healthScore ?? 0,
    },
  ];

  return (
    <GlassCard delay={0.08}>
      <CardTitle icon={<Activity size={18} />}>
        Repository Statistics
      </CardTitle>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-[14px] p-3 flex flex-col gap-1"
            style={{
              background: "rgba(97,218,251,0.05)",
              border: "1px solid rgba(97,218,251,0.10)",
            }}
          >
            <div
              className="flex items-center gap-1.5"
              style={{ color: "#3DD9EB" }}
            >
              {s.icon}

              <span
                className="text-[10px] uppercase"
                style={{ color: "#94A3B8" }}
              >
                {s.label}
              </span>
            </div>

            <span
              className="text-sm font-semibold truncate"
              style={{ color: "#F8FAFC" }}
            >
              {s.value}
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}