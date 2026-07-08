import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Circle, Loader2, GitBranch, Upload, FileCode2,
  AlertTriangle, ShieldCheck, ShieldAlert, Sparkles, Bug, Layers,
  Activity, Database, Cpu, FolderTree, Clock, FileSearch, Bot,
  ChevronRight, XCircle, TrendingUp
} from "lucide-react";

const API_BASE = "http://localhost:8000";

interface Subsystem { name: string; purpose: string; keyFiles: string[]; }
interface WorkflowStep { step: string; description: string; }
interface BugFinding { file: string; line: number; severity: "HIGH" | "MEDIUM" | "LOW"; description: string; fix: string; }
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

function GlassCard({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
      whileHover={{ y: -3, boxShadow: "0 0 30px rgba(61,217,235,0.22)" }}
      className={`rounded-[20px] border p-5 ${className}`}
      style={{
        background: "rgba(18, 30, 48, 0.72)",
        backdropFilter: "blur(20px)",
        borderColor: "rgba(97,218,251,0.12)",
        boxShadow: "0 0 20px rgba(61,217,235,0.10)",
      }}
    >
      {children}
    </motion.div>
  );
}

function CardTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div style={{ color: "#3DD9EB" }}>{icon}</div>
      <h3 className="text-sm font-semibold tracking-wide" style={{ color: "#F8FAFC" }}>{children}</h3>
    </div>
  );
}

function StepIcon({ status }: { status: string }) {
  if (status === "completed") {
    return <CheckCircle2 size={18} style={{ color: "#22C55E" }} />;
  }
  if (status === "running") {
    return (
      <motion.div animate={{ scale: [1, 1.25, 1], opacity: [1, 0.6, 1] }} transition={{ duration: 1.4, repeat: Infinity }}>
        <Circle size={18} style={{ color: "#3DD9EB" }} fill="#3DD9EB" fillOpacity={0.25} />
      </motion.div>
    );
  }
  return <Circle size={18} style={{ color: "#475569" }} />;
}

function PipelineSidebar({ steps }: { steps: PipelineStep[] }) {
  const completedCount = steps.filter((s) => s.status === "completed").length;
  const progressPct = Math.round((completedCount / steps.length) * 100);

  return (
    <GlassCard>
      <CardTitle icon={<Bot size={18} />}>🤖 Autonomous AI Workflow</CardTitle>
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1.5" style={{ color: "#94A3B8" }}>
          <span>Analysis Progress</span>
          <span style={{ color: "#3DD9EB" }}>{progressPct}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(97,218,251,0.10)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #66FCF1, #3DD9EB, #38BDF8)" }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>
      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {steps.map((step, idx) => (
          <motion.div
            key={step.key}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.03 }}
            className="flex items-center gap-2.5"
          >
            <StepIcon status={step.status} />
            <span
              className="text-[13px]"
              style={{
                color: step.status === "waiting" ? "#64748B" : step.status === "running" ? "#3DD9EB" : "#CBD5E1",
                fontWeight: step.status === "running" ? 600 : 400,
              }}
            >
              {step.label}
            </span>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}

function AnalysisConfigCard({ goal }: { goal: string }) {
  const rows = [
    { label: "Review Goal", value: goal || "Review the complete repository" },
    { label: "Embedding Model", value: "BAAI/bge-small-en-v1.5" },
    { label: "LLM", value: "Gemini 2.5 Flash" },
    { label: "Vector Database", value: "ChromaDB" },
    { label: "Orchestrator", value: "LangGraph" },
  ];
  return (
    <GlassCard delay={0.05}>
      <CardTitle icon={<Cpu size={18} />}>Analysis Configuration</CardTitle>
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.label} className="flex flex-col gap-0.5">
            <span className="text-[11px] uppercase tracking-wide" style={{ color: "#94A3B8" }}>{r.label}</span>
            <span className="text-[13px] truncate" style={{ color: "#F8FAFC" }}>{r.value}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function RepoStatusCard({ repoLabel, loading, done }: { repoLabel: string; loading: boolean; done: boolean }) {
  return (
    <GlassCard delay={0.02}>
      <CardTitle icon={<FolderTree size={18} />}>Repository Status</CardTitle>
      <div className="flex items-center gap-3">
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: done ? "#22C55E" : loading ? "#3DD9EB" : "#475569" }}
        />
        <span className="text-sm" style={{ color: "#CBD5E1" }}>
          {done ? "Analysis Complete" : loading ? "Processing..." : "Awaiting Input"}
        </span>
      </div>
      <p className="text-[13px] mt-2 truncate" style={{ color: "#94A3B8" }}>{repoLabel || "No repository loaded"}</p>
    </GlassCard>
  );
}

function AnimatedHealthScore({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timeout);
  }, [score]);

  const offset = circumference - (animatedScore / 100) * circumference;
  const color = score >= 80 ? "#22C55E" : score >= 55 ? "#F59E0B" : "#EF4444";

  return (
    <div className="flex items-center justify-center relative" style={{ width: 140, height: 140 }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(97,218,251,0.10)" strokeWidth="10" />
        <motion.circle
          cx="70" cy="70" r={radius} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          transform="rotate(-90 70 70)"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold" style={{ color: "#F8FAFC" }}>{animatedScore}</span>
        <span className="text-[10px] uppercase tracking-wide" style={{ color: "#94A3B8" }}>Health</span>
      </div>
    </div>
  );
}

function AIThinking({ steps }: { steps: PipelineStep[] }) {
  const runningAgents = AGENT_KEYS.filter((k) => steps.find((s) => s.key === k)?.status === "running");
  const displayAgent = runningAgents[0] || AGENT_KEYS.find((k) => steps.find((s) => s.key === k)?.status !== "completed");

  return (
    <GlassCard>
      <div className="flex items-center gap-3">
        <Sparkles size={20} style={{ color: "#3DD9EB" }} className="animate-pulse" />
        <span className="text-sm" style={{ color: "#CBD5E1" }}>
          {displayAgent ? AGENT_LABELS[displayAgent] : "Preparing agents"} thinking
        </span>
        <span className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#3DD9EB" }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </span>
      </div>
    </GlassCard>
  );
}

function AgentsCard({ steps }: { steps: PipelineStep[] }) {
  return (
    <GlassCard delay={0.1}>
      <CardTitle icon={<Layers size={18} />}>AI Agents</CardTitle>
      <div className="space-y-3">
        {AGENT_KEYS.map((key) => {
          const status = steps.find((s) => s.key === key)?.status || "waiting";
          const badge =
            status === "completed"
              ? { label: "Completed", color: "#22C55E", bg: "rgba(34,197,94,0.12)" }
              : status === "running"
              ? { label: "Running", color: "#3DD9EB", bg: "rgba(61,217,235,0.12)" }
              : { label: "Waiting", color: "#94A3B8", bg: "rgba(148,163,184,0.10)" };
          return (
            <div key={key} className="flex items-center justify-between">
              <span className="text-[13px]" style={{ color: "#CBD5E1" }}>{AGENT_LABELS[key]}</span>
              <span
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                style={{ color: badge.color, background: badge.bg, border: `1px solid ${badge.color}33` }}
              >
                {badge.label}
              </span>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

function RepoStatisticsCard({ report, elapsedMs }: { report: AnalysisReport | null; elapsedMs: number }) {
  const stats = [
    { icon: <FileCode2 size={16} />, label: "Files Indexed", value: report?.repository.totalFiles ?? 0 },
    { icon: <FileSearch size={16} />, label: "Files Retrieved", value: report?.filesRetrievedByRag.length ?? 0 },
    { icon: <Database size={16} />, label: "Framework", value: report?.repository.framework ?? "—" },
    { icon: <GitBranch size={16} />, label: "Language", value: report?.repository.language ?? "—" },
    { icon: <Clock size={16} />, label: "Processing Time", value: `${(elapsedMs / 1000).toFixed(1)}s` },
    { icon: <TrendingUp size={16} />, label: "Health Score", value: report?.healthScore ?? 0 },
  ];
  return (
    <GlassCard delay={0.08}>
      <CardTitle icon={<Activity size={18} />}>Repository Statistics</CardTitle>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-[14px] p-3 flex flex-col gap-1"
            style={{ background: "rgba(97,218,251,0.05)", border: "1px solid rgba(97,218,251,0.10)" }}
          >
            <div className="flex items-center gap-1.5" style={{ color: "#3DD9EB" }}>
              {s.icon}
              <span className="text-[10px] uppercase" style={{ color: "#94A3B8" }}>{s.label}</span>
            </div>
            <span className="text-sm font-semibold truncate" style={{ color: "#F8FAFC" }}>{s.value}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
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

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-4 px-6 pb-8">
        <div className="lg:col-span-1 flex flex-col gap-4">
          <PipelineSidebar steps={steps} />
          <RepoStatusCard repoLabel={repoLabel} loading={loading} done={!!report} />
          <AnalysisConfigCard goal={goal} />
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          <AnimatePresence>
            {loading && !report && <AIThinking steps={steps} />}
          </AnimatePresence>

          {report ? (
            <>
              <GlassCard>
                <CardTitle icon={<GitBranch size={18} />}>Repository Overview</CardTitle>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-xl font-bold mb-1">{report.repository.name}</h2>
                    <p className="text-sm" style={{ color: "#94A3B8" }}>
                      {report.repository.language} · {report.repository.framework} · {report.repository.totalFiles} files
                    </p>
                  </div>
                  <AnimatedHealthScore score={report.healthScore} />
                </div>
              </GlassCard>

              <GlassCard delay={0.05}>
                <CardTitle icon={<Layers size={18} />}>Repository Understanding</CardTitle>
                <div className="mb-5">
                  <h4 className="text-xs uppercase mb-2" style={{ color: "#94A3B8" }}>Subsystems</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {report.repositoryUnderstanding.subsystems.map((s, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="rounded-[14px] p-3"
                        style={{ background: "rgba(97,218,235,0.05)", border: "1px solid rgba(97,218,251,0.10)" }}
                      >
                        <p className="font-semibold text-sm mb-1" style={{ color: "#3DD9EB" }}>{s.name}</p>
                        <p className="text-[13px] mb-2" style={{ color: "#CBD5E1" }}>{s.purpose}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {s.keyFiles.map((f, fi) => (
                            <span key={fi} className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: "rgba(61,217,235,0.10)", color: "#66FCF1" }}>
                              {f}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs uppercase mb-3" style={{ color: "#94A3B8" }}>Workflow</h4>
                  <div className="flex flex-col">
                    {report.repositoryUnderstanding.workflow.map((w, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.12 }}
                        className="flex gap-3 pb-4 relative"
                      >
                        <div className="flex flex-col items-center">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#3DD9EB", boxShadow: "0 0 8px #3DD9EB" }} />
                          {i < report.repositoryUnderstanding.workflow.length - 1 && (
                            <div className="w-px flex-1" style={{ background: "rgba(97,218,251,0.25)" }} />
                          )}
                        </div>
                        <div className="pb-1">
                          <p className="text-sm font-medium" style={{ color: "#F8FAFC" }}>{w.step}</p>
                          <p className="text-[13px]" style={{ color: "#94A3B8" }}>{w.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </GlassCard>

              <GlassCard delay={0.08}>
                <CardTitle icon={<FolderTree size={18} />}>Architecture</CardTitle>
                <p className="text-sm mb-3" style={{ color: "#CBD5E1" }}>{report.architecture.description}</p>
                <pre
                  className="text-[12px] rounded-[14px] p-4 overflow-x-auto mb-3"
                  style={{ background: "rgba(0,0,0,0.3)", color: "#66FCF1", border: "1px solid rgba(97,218,251,0.10)" }}
                >
{report.architecture.diagram}
                </pre>
                <div className="flex flex-wrap gap-2">
                  {report.architecture.patterns.map((p, i) => (
                    <span key={i} className="text-[11px] px-2.5 py-1 rounded-full" style={{ background: "rgba(79,209,197,0.10)", color: "#4FD1C5", border: "1px solid rgba(79,209,197,0.25)" }}>
                      {p}
                    </span>
                  ))}
                </div>
              </GlassCard>
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

        <div className="lg:col-span-1 flex flex-col gap-4">
          <GlassCard>
            <CardTitle icon={<Bug size={18} />}>Bug Findings</CardTitle>
            <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
              {report && report.bugs.length > 0 ? (
                report.bugs.map((bug, i) => {
                  const colors = severityColor(bug.severity);
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-[14px] p-3"
                      style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ color: colors.text, background: "rgba(0,0,0,0.2)" }}>
                          {bug.severity}
                        </span>
                        <span className="text-[11px]" style={{ color: "#94A3B8" }}>{bug.file}:{bug.line}</span>
                      </div>
                      <p className="text-[13px] mb-1" style={{ color: "#F8FAFC" }}>{bug.description}</p>
                      <p className="text-[12px]" style={{ color: "#94A3B8" }}>Fix: {bug.fix}</p>
                    </motion.div>
                  );
                })
              ) : (
                <p className="text-[13px]" style={{ color: "#64748B" }}>No bugs detected yet.</p>
              )}
            </div>
          </GlassCard>

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

          <AgentsCard steps={steps} />
          <RepoStatisticsCard report={report} elapsedMs={elapsedMs} />
        </div>
      </div>
    </div>
  );
}