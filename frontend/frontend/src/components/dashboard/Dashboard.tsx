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
import CardTitle from "../common/CardTitle";
import { GitBranch } from "lucide-react";
 //import BugFindings from "../findings/BugFindings";
//import BestPractices from "../findings/BestPractices";
//import Recommendations from "../findings/Recommendations";

import AnalysisConfigCard from "../sidebar/AnalysisConfigCard";

interface DashboardProps {
  report: any;
  goal: string;
  elapsedMs: number;
  onAnalyzeAgain: () => void;
}

export default function Dashboard({
  report,
  goal,
  elapsedMs,
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

      <DashboardHeader
        onAnalyzeAgain={onAnalyzeAgain}
      />

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
        <HealthScore
          score={report.healthScore}
        />

        <RepositoryOverview
          report={report}
          
        />
      </div>

         {/* RAG */}

      <RagFiles report={report} />

      {/* Repository Understanding */}

      
      <RepositoryUnderstanding report={report} />
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

      {/* Analysis Configuration 

      <AnalysisConfigCard
        goal={goal}
      />*/}

    </div>
  );
}