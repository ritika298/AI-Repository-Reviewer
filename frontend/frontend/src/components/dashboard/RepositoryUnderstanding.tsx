import { Layers } from "lucide-react";

import GlassCard from "../common/GlassCard";
import SubsystemCard from "./SubsystemCard";
//import WorkflowTimeline from "./WorkflowTimeline";

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
      {/* ---------- Header ---------- */}

      <div
        style={{
          textAlign: "center",
          marginBottom: 34,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <Layers
            size={22}
            color="#3DD9EB"
          />

          <h2
            style={{
              margin: 0,
              color: "white",
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            Repository Understanding
          </h2>
        </div>

        <div
          style={{
            width: 300,
            height: 3,
            borderRadius: 999,
            margin: "0 auto 18px",
            background:
              "linear-gradient(90deg,#3DD9EB,#22C55E)",
          }}
        />

        <p
          style={{
            color: "#94A3B8",
            maxWidth: 760,
            margin: "0 auto",
            lineHeight: 1.7,
            fontSize: 15,
          }}
        >
          AI-generated understanding of the repository structure,
          major components and execution workflow.
        </p>
      </div>

      {/* ---------- Subsystems ---------- */}

      <div style={{ marginBottom: 42 }}>
        <h4
          style={{
            color: "#CBD5E1",
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 18,
          }}
        >
          Core Components
        </h4>

        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {report.repositoryUnderstanding.subsystems.map(
            (s, i) => (
              <SubsystemCard
                key={i}
                subsystem={s}
                index={i}
              />
            )
          )}
        </div>
      </div>

      {/* Divider */}

      <div
        style={{
          height: 1,
          background: "rgba(61,217,235,.08)",
          margin: "0 0 38px",
        }}
      />
       {/* ---------- Workflow ---------- 

      <div>
        <h4
          style={{
            color: "#CBD5E1",
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 22,
          }}
        >
          Execution Workflow
        </h4>

        <WorkflowTimeline
          workflow={
            report.repositoryUnderstanding.workflow
          }
        />
      </div> */}
      
    </GlassCard>
  );
}