
import Dashboard from "./components/dashboard/Dashboard";


//import demoReport from "./demo/demoReport";
import AnalysisLoading from "./components/loading/AnalysisLoading";
import LandingPage from "./components/landing/LandingPage";


import AIThinking from "./components/sidebar/AIThinking";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { XCircle } from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

interface Subsystem { name: string; purpose: string; keyFiles: string[]; }
interface WorkflowStep { step: string; description: string; }
interface BugFinding {
  severity: "HIGH" | "MEDIUM" | "LOW";
  description: string;
  fix: string;

  files: {
    file: string;
    line: number;
  }[];
}
interface SecurityFinding {
  type: string;
  file: string;
  line: number;
  description: string;
  action: string;
}
interface SecurityReport {
  secure: boolean;
  findings: SecurityFinding[];
}

interface BestPractice {
  category: string;
  details: string;
}
interface Architecture { description: string; diagram: string; patterns: string[]; }
interface Repository { name: string; language: string; framework: string; totalFiles: number; }


interface AnalysisReport {
  repository: Repository;
  healthScore: number;

  repositoryUnderstanding: {
    subsystems: Subsystem[];
    workflow: WorkflowStep[];
  };

  architecture: Architecture;

  bugs: BugFinding[];

 security: SecurityReport;

  bestPractices: BestPractice[];

  recommendations: string[];

  filesRetrievedByRag: string[];
}

interface PipelineStep { key: string; label: string; status: "waiting" | "running" | "completed"; }

const AGENT_KEYS = ["repository_understanding_agent", "architecture_agent", "bug_agent", "best_practice_agent"];
const AGENT_LABELS: Record<string, string> = {
  repository_understanding_agent: "Repository Understanding Agent",
  architecture_agent: "Architecture Agent",
  bug_agent: "Bug Agent",
  best_practice_agent: "Best Practice Agent",
};

const DEFAULT_STEPS: PipelineStep[] = [
  { key: "repository_cloned", label: "Repository Cloned", status: "waiting" },
  { key: "repository_indexed", label: "Repository Indexed", status: "waiting" },
  { key: "ast_metadata_extracted", label: "AST Metadata Extracted", status: "waiting" },
  { key: "code_chunked", label: "Code Chunked", status: "waiting" },
  { key: "embeddings_generated", label: "Embeddings Generated", status: "waiting" },
  { key: "chromadb_indexed", label: "ChromaDB Indexed", status: "waiting" },
  { key: "rag_retrieval", label: "RAG Retrieval", status: "waiting" },
  { key: "repository_understanding_agent", label: "Repository Understanding Agent", status: "waiting" },
  { key: "architecture_agent", label: "Architecture Agent", status: "waiting" },
  { key: "bug_agent", label: "Bug Agent", status: "waiting" },
  { key: "best_practice_agent", label: "Best Practice Agent", status: "waiting" },
  { key: "response_formatter", label: "Response Formatter", status: "waiting" },
  { key: "report_generated", label: "Report Generated", status: "waiting" },
];


export default function App() {
  const [githubUrl, setGithubUrl] = useState("");
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [goal, setGoal] = useState("Review the complete repository");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [steps, setSteps] = useState<PipelineStep[]>(DEFAULT_STEPS);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const pollRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  const stopPolling = useCallback(() => {
    if (pollRef.current) window.clearInterval(pollRef.current);
    if (timerRef.current) window.clearInterval(timerRef.current);
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const handleAnalyze = async () => {
    if (!githubUrl && !zipFile) {
      setError("Provide a GitHub URL or upload a ZIP file.");
      return;
    }
    setError(null);
    setReport(null);
    setSteps(DEFAULT_STEPS.map((s) => ({ ...s })));
    setLoading(true);
    setElapsedMs(0);
    startRef.current = Date.now();

    const jobId = crypto.randomUUID();

    timerRef.current = window.setInterval(() => {
      setElapsedMs(Date.now() - startRef.current);
    }, 200);

    pollRef.current = window.setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/progress/${jobId}`);
        if (res.ok) {
          const data = await res.json();
          setSteps(data.steps);
        }
      } catch {
        // ignore transient polling errors
      }
    }, 1000);

    try {
      const formData = new FormData();
      formData.append("job_id", jobId);
      formData.append("goal", goal || "Review the complete repository");
      if (githubUrl) formData.append("github_url", githubUrl);
      if (zipFile) formData.append("zip_file", zipFile);

      const res = await fetch(`${API_BASE}/api/analyze`, { method: "POST", body: formData });
      if (!res.ok) {
        const detail = await res.json().catch(() => ({ detail: "Analysis failed" }));
        throw new Error(detail.detail || "Analysis failed");
      }
      const data: AnalysisReport = await res.json();
      setReport(data);
      setSteps(DEFAULT_STEPS.map((s) => ({ ...s, status: "completed" })));
    } catch (e: any) {
      setError(e.message || "Something went wrong during analysis.");
    } finally {
      setLoading(false);
      stopPolling();
    }
  };

 
const currentReport = report;

return (
  <div
    className="min-h-screen w-full relative overflow-hidden"
    style={{
      color: "#F8FAFC",
      background: `
        radial-gradient(circle at 15% 10%, rgba(61,217,235,.12), transparent 35%),
        radial-gradient(circle at 85% 20%, rgba(59,130,246,.10), transparent 30%),
        radial-gradient(circle at 50% 100%, rgba(14,165,233,.08), transparent 45%),
        linear-gradient(
          180deg,
          #07111F 0%,
          #081827 40%,
          #0A1D2E 100%
        )
      `,
    }}
  >

    {error && (
      <div
        className="relative z-10 mx-6 mb-4 rounded-[14px] px-4 py-3 flex items-center gap-2 text-sm"
        style={{
          background: "rgba(239,68,68,0.10)",
          border: "1px solid rgba(239,68,68,0.3)",
          color: "#EF4444",
        }}
      >
        <XCircle size={16} />
        {error}
      </div>
    )}

    {!loading && !currentReport && (
      <LandingPage
        githubUrl={githubUrl}
        setGithubUrl={setGithubUrl}
        zipFile={zipFile}
        setZipFile={setZipFile}
        goal={goal}
        setGoal={setGoal}
        loading={loading}
        handleAnalyze={handleAnalyze}
      />
    )}

    {loading && !currentReport && (
  <>
    <AnalysisLoading />
    <AnimatePresence>
      <AIThinking
        steps={steps}
        AGENT_KEYS={AGENT_KEYS}
        AGENT_LABELS={AGENT_LABELS}
      />
    </AnimatePresence>
  </>
)}
  

    {!loading && currentReport && (
      <Dashboard
        report={currentReport}
        goal={goal}
        elapsedMs={elapsedMs}
        onAnalyzeAgain={() => {
          setReport(null);
          setGithubUrl("");
          setZipFile(null);
        }}
      />
    )}
  </div>
);
}
