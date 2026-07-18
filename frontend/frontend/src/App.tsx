import ArchitectureCard from "./components/dashboard/ArchitectureCard";
import RepositoryUnderstanding from "./components/dashboard/RepositoryUnderstanding";
import RepositoryOverview from "./components/dashboard/RepositoryOverview";
import RepoStatisticsCard from "./components/sidebar/RepoStatisticsCard";
import AgentsCard from "./components/sidebar/AgentsCard";
import AIThinking from "./components/sidebar/AIThinking";
import AnalysisConfigCard from "./components/sidebar/AnalysisConfigCard";
import RepoStatusCard from "./components/sidebar/RepoStatusCard";
import PipelineSidebar from "./components/sidebar/PipelineSidebar";
import BugFindings from "./components/findings/BugFindings";
import CardTitle from "./components/common/CardTitle";
import GlassCard from "./components/common/GlassCard";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Loader2, GitBranch, Upload, FileCode2,
  AlertTriangle, ShieldCheck, ShieldAlert, Sparkles,
   FileSearch, Bot,
  ChevronRight, XCircle
} from "lucide-react";

const API_BASE = "http://localhost:8000";

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

interface BestPractice { category: string; status: "PASSED" | "FAILED"; details: string; }
interface Architecture { description: string; diagram: string; patterns: string[]; }
interface Repository { name: string; language: string; framework: string; totalFiles: number; }
interface AnalysisReport {
  repository: Repository;
  healthScore: number;
  repositoryUnderstanding: { subsystems: Subsystem[]; workflow: WorkflowStep[] };
  architecture: Architecture;
  bugs: BugFinding[];
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

function severityColor(severity: string) {
  switch (severity) {
    case "HIGH": return { text: "#FB7185", bg: "rgba(251,113,133,0.12)", border: "rgba(251,113,133,0.35)" };
    case "MEDIUM": return { text: "#F59E0B", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.35)" };
    default: return { text: "#22C55E", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.35)" };
  }
}

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

  const repoLabel = githubUrl || zipFile?.name || "";

  return (
    <div className="min-h-screen w-full" style={{ background: "#0B1220", color: "#F8FAFC" }}>
      <div
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{ background: "radial-gradient(circle at 20% 10%, rgba(61,217,235,0.08), transparent 45%), radial-gradient(circle at 80% 90%, rgba(56,189,248,0.06), transparent 45%)" }}
      />

      <header className="relative z-10 border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: "rgba(97,218,251,0.12)" }}>
        <div className="flex items-center gap-2">
          <Sparkles size={22} style={{ color: "#3DD9EB" }} />
          <h1 className="text-lg font-bold">Autonomous Repository Code Reviewer</h1>
        </div>
        <div className="flex items-center gap-3 text-xs" style={{ color: "#94A3B8" }}>
          <span>Multi-Agent RAG Analysis</span>
        </div>
      </header>

      <div className="relative z-10 px-6 py-5 flex flex-col lg:flex-row gap-4">
        <div className="flex-1 flex flex-col md:flex-row gap-3">
          <div className="flex items-center gap-2 flex-1 rounded-[14px] px-4 py-2.5" style={{ background: "rgba(18,30,48,0.72)", border: "1px solid rgba(97,218,251,0.12)" }}>
            <GitBranch size={16} style={{ color: "#3DD9EB" }} />
            <input
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/user/repository"
              className="bg-transparent flex-1 outline-none text-sm"
              style={{ color: "#F8FAFC" }}
            />
          </div>
          <label className="flex items-center gap-2 rounded-[14px] px-4 py-2.5 cursor-pointer" style={{ background: "rgba(18,30,48,0.72)", border: "1px solid rgba(97,218,251,0.12)" }}>
            <Upload size={16} style={{ color: "#3DD9EB" }} />
            <span className="text-sm truncate max-w-[160px]" style={{ color: zipFile ? "#F8FAFC" : "#94A3B8" }}>
              {zipFile ? zipFile.name : "Upload ZIP"}
            </span>
            <input type="file" accept=".zip" className="hidden" onChange={(e) => setZipFile(e.target.files?.[0] || null)} />
          </label>
          <input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Review goal (e.g. Review authentication)"
            className="rounded-[14px] px-4 py-2.5 text-sm outline-none flex-1"
            style={{ background: "rgba(18,30,48,0.72)", border: "1px solid rgba(97,218,251,0.12)", color: "#F8FAFC" }}
          />
          <motion.button
            whileHover={{ scale: loading ? 1 : 1.03 }}
            whileTap={{ scale: loading ? 1 : 0.97 }}
            onClick={handleAnalyze}
            disabled={loading}
            className="rounded-[16px] px-6 py-2.5 text-sm font-semibold flex items-center gap-2 justify-center"
            style={{
              background: "linear-gradient(90deg, #3DD9EB, #38BDF8)",
              color: "#0B1220",
              opacity: loading ? 0.7 : 1,
              boxShadow: "0 0 20px rgba(61,217,235,0.25)",
            }}
          >
            {loading ? (
              <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                <Loader2 size={16} />
              </motion.span>
            ) : (
              <ChevronRight size={16} />
            )}
            {loading ? "Analyzing..." : "Analyze Repository"}
          </motion.button>
        </div>
      </div>

      {error && (
        <div className="relative z-10 mx-6 mb-4 rounded-[14px] px-4 py-3 flex items-center gap-2 text-sm" style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444" }}>
          <XCircle size={16} /> {error}
        </div>
      )}

      <div className="relative z-10 max-w-[1700px] mx-auto px-8 pb-8">
        <div className="grid grid-cols-12 gap-6">

          <div className="col-span-12 xl:col-span-3 flex flex-col gap-5">
            <PipelineSidebar steps={steps} />
            <RepoStatusCard
              repoLabel={repoLabel}
              loading={loading}
              done={!!report}
            />
            <AnalysisConfigCard goal={goal} />
          </div>

          <div className="col-span-12 xl:col-span-6 flex flex-col gap-5">
            <AnimatePresence>
              {loading && !report && <AIThinking
                steps={steps}
                AGENT_KEYS={AGENT_KEYS}
                AGENT_LABELS={AGENT_LABELS}
              />}
            </AnimatePresence>

            {report ? (
              <>

                <RepositoryOverview report={report} />
                <RepositoryUnderstanding report={report} />

                <ArchitectureCard report={report} />
              </>
            ) : (
              !loading && (
                <GlassCard>
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Bot size={40} style={{ color: "#3DD9EB" }} className="mb-4" />
                    <p className="text-sm" style={{ color: "#94A3B8" }}>
                      Enter a GitHub URL or upload a ZIP file to begin an autonomous multi-agent code review.
                    </p>
                  </div>
                </GlassCard>
              )
            )}
          </div>

          <div className="col-span-12 xl:col-span-3 flex flex-col gap-5">
             <BugFindings
    bugs={report?.bugs ?? []}
    severityColor={severityColor}
  /> 

            <GlassCard delay={0.03}>
              <CardTitle icon={<ShieldCheck size={18} />}>Best Practices</CardTitle>
              <div className="space-y-3">
                {report && report.bestPractices.length > 0 ? (
                  report.bestPractices.map((p, i) => (
                    <div key={i} className="flex items-start gap-2">
                      {p.status === "PASSED" ? (
                        <ShieldCheck size={16} style={{ color: "#22C55E" }} className="mt-0.5 shrink-0" />
                      ) : (
                        <ShieldAlert size={16} style={{ color: "#F59E0B" }} className="mt-0.5 shrink-0" />
                      )}
                      <div>
                        <p className="text-[13px] font-medium" style={{ color: "#F8FAFC" }}>{p.category}</p>
                        <p className="text-[12px]" style={{ color: "#94A3B8" }}>{p.details}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[13px]" style={{ color: "#64748B" }}>No data yet.</p>
                )}
              </div>
            </GlassCard>

            <GlassCard delay={0.06}>
              <CardTitle icon={<AlertTriangle size={18} />}>Recommendations</CardTitle>
              <ul className="space-y-2">
                {report && report.recommendations.length > 0 ? (
                  report.recommendations.map((r, i) => (
                    <li key={i} className="text-[13px] flex gap-2" style={{ color: "#CBD5E1" }}>
                      <span style={{ color: "#3DD9EB" }}>›</span> {r}
                    </li>
                  ))
                ) : (
                  <p className="text-[13px]" style={{ color: "#64748B" }}>No data yet.</p>
                )}
              </ul>
            </GlassCard>

            <GlassCard delay={0.09}>
              <CardTitle icon={<FileSearch size={18} />}>Files Retrieved by RAG</CardTitle>
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {report && report.filesRetrievedByRag.length > 0 ? (
                  report.filesRetrievedByRag.map((f, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ x: 3, background: "rgba(61,217,235,0.08)" }}
                      className="flex items-center gap-2 rounded-[10px] px-2 py-1.5 text-[13px]"
                      style={{ color: "#CBD5E1" }}
                    >
                      <FileCode2 size={14} style={{ color: "#3DD9EB" }} />
                      <span className="truncate">{f}</span>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-[13px]" style={{ color: "#64748B" }}>No files retrieved yet.</p>
                )}
              </div>
              <p className="text-[11px] mt-3" style={{ color: "#64748B" }}>
                Only the most relevant files are retrieved using semantic search.
              </p>
            </GlassCard>

            <AgentsCard
              steps={steps}
              AGENT_KEYS={AGENT_KEYS}
              AGENT_LABELS={AGENT_LABELS}
            />
                      <RepoStatisticsCard report={report} elapsedMs={elapsedMs} />
        </div>
      </div>
    </div>

  </div>
  );
}
