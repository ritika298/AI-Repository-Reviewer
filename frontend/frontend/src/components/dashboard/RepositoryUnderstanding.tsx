import { Layers } from "lucide-react";

import GlassCard from "../common/GlassCard";
import CardTitle from "../common/CardTitle";

import SubsystemCard from "./SubsystemCard";
import WorkflowTimeline from "./WorkflowTimeline";

interface Subsystem {
  name: string;
  purpose: string;
  keyFiles: string[];
}

interface WorkflowStep {
  step: string;
  description: string;
}

interface RepositoryUnderstandingProps {
  report: {
    repositoryUnderstanding: {
      subsystems: Subsystem[];
      workflow: WorkflowStep[];
    };
  };
}

export default function RepositoryUnderstanding({
  report,
}: RepositoryUnderstandingProps) {
  return (
    <GlassCard delay={0.05}>
      <CardTitle icon={<Layers size={18} />}>
        Repository Understanding
      </CardTitle>

      <div className="mb-5">
        <h4
          className="text-xs uppercase mb-2"
          style={{ color: "#94A3B8" }}
        >
          Subsystems
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {report.repositoryUnderstanding.subsystems.map((s, i) => (
            <SubsystemCard
              key={i}
              subsystem={s}
              index={i}
            />
          ))}
        </div>
      </div>

      <div>
        <h4
          className="text-xs uppercase mb-3"
          style={{ color: "#94A3B8" }}
        >
          Workflow
        </h4>

        <WorkflowTimeline
          workflow={report.repositoryUnderstanding.workflow}
        />
      </div>
    </GlassCard>
  );
}