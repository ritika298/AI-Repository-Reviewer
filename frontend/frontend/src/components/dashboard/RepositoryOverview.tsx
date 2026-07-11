import { GitBranch } from "lucide-react";

import GlassCard from "../common/GlassCard";
import CardTitle from "../common/CardTitle";
import HealthScore from "./HealthScore";

interface Repository {
  name: string;
  language: string;
  framework: string;
  totalFiles: number;
}

interface RepositoryOverviewProps {
  report: {
    repository: Repository;
    healthScore: number;
  };
}

export default function RepositoryOverview({
  report,
}: RepositoryOverviewProps) {
  return (
    <GlassCard>
      <CardTitle icon={<GitBranch size={18} />}>
        Repository Overview
      </CardTitle>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold mb-1">
            {report.repository.name}
          </h2>

          <p
            className="text-sm"
            style={{ color: "#94A3B8" }}
          >
            {report.repository.language} ·{" "}
            {report.repository.framework} ·{" "}
            {report.repository.totalFiles} files
          </p>
        </div>

        <HealthScore
  score={report.healthScore}
/>
      </div>
    </GlassCard>
  );
}