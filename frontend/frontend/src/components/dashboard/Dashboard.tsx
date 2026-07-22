import Recommendations from "../findings/Recommendations";
import BestPractices from "../findings/BestPractices";
import DashboardHeader from "./DashboardHeader";
import HealthScore from "./HealthScore";
import RepositoryOverview from "./RepositoryOverview";
import RepositoryUnderstanding from "./RepositoryUnderstanding";
import ArchitectureCard from "./ArchitectureCard";
import BugFindings from "../findings/BugFindings";
import RagFiles from "../findings/RagFiles";
import WorkflowTimeline from "./WorkflowTimeline";
import GlassCard from "../common/GlassCard";
import SecurityFindings from "../findings/SecurityFindings";

import { RotateCcw } from "lucide-react";

interface DashboardProps {
  report: any;
  goal: string;
  elapsedMs: number;
  onAnalyzeAgain: () => void;
}

export default function Dashboard({
  report,
  onAnalyzeAgain,
}: DashboardProps) {
  return (
    <div
      style={{
        maxWidth: "1500px",
        margin: "0 auto",
        padding: "56px 48px",
      }}
    >
      {/* Header */}

      <DashboardHeader />

      {/* Top Section */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "340px 1fr",
          gap: "28px",
          marginTop: "40px",
          marginBottom: "42px",
        }}
      >
        <HealthScore score={report.healthScore} />

        <RepositoryOverview report={report} />
      </div>

      {/* RAG */}

      <RagFiles report={report} />

      {/* Repository Understanding */}

      <RepositoryUnderstanding report={report} />

      {/* Workflow + Architecture */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "28px",
          marginTop: "30px",
          alignItems: "stretch",
        }}
      >
        <GlassCard>
          <div style={{ padding: "4px 4px 0" }}>
            <div style={{ marginTop: "20px" }}>
              <WorkflowTimeline
                workflow={report.repositoryUnderstanding.workflow}
              />
            </div>
          </div>
        </GlassCard>

        <ArchitectureCard report={report} />
      </div>
      
           {/* Security Findings */}

<div
  style={{
    marginTop: "30px",
  }}
>
 <SecurityFindings security={report.security} />
</div>

      {/* Bug Findings */}

      <div
        style={{
          marginTop: "30px",
        }}
      >
        <BugFindings bugs={report.bugs} />
      </div>


      {/* Recommendations */}

      <div
        style={{
          marginTop: "30px",
        }}
      >
        <Recommendations
          recommendations={report.recommendations}
        />
      </div>

      {/* Best Practices */}

      <div
        style={{
          marginTop: "30px",
        }}
      >
        <BestPractices
          bestPractices={report.bestPractices}
        />
      </div>

      {/* Footer */}

      <div
        style={{
          textAlign: "center",
          marginTop: "80px",
          marginBottom: "28px",
        }}
      >
        <h3
          style={{
            color: "#F8FAFC",
            fontSize: "28px",
            fontWeight: 700,
            marginBottom: "12px",
          }}
        >
          Ready to analyze another repository?
        </h3>

        <p
          style={{
            color: "#94A3B8",
            fontSize: "16px",
            lineHeight: 1.7,
            maxWidth: "620px",
            margin: "0 auto 32px",
          }}
        >
          Start a new AI-powered repository review by analyzing another
          GitHub repository or uploading a ZIP archive.
        </p>

        <button
          onClick={onAnalyzeAgain}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#1E2F44";
            e.currentTarget.style.borderColor =
              "rgba(61,217,235,.35)";
            e.currentTarget.style.transform =
              "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 12px 30px rgba(61,217,235,.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#172436";
            e.currentTarget.style.borderColor =
              "rgba(61,217,235,.18)";
            e.currentTarget.style.transform =
              "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            padding: "16px 34px",
            borderRadius: "999px",
            border: "1px solid rgba(61,217,235,.18)",
            background: "#172436",
            color: "#F8FAFC",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: 700,
            transition: "all .25s ease",
          }}
        >
          <RotateCcw size={18} />
          Analyze Another Repository
        </button>
      </div>
    </div>
  );
}