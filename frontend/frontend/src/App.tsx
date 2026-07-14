import { useState } from "react";
import RepositoryOverview from "./components/dashboard/RepositoryOverview";
import HealthScore from "./components/dashboard/HealthScore";
import WorkflowTimeline from "./components/dashboard/WorkflowTimeline";
import BugFindings from "./components/findings/BugFindings";
import BestPractices from "./components/findings/BestPractices";
import Recommendations from "./components/findings/Recommendations";

export default function App() {
  const [githubUrl, setGithubUrl] = useState("");
  const [goal, setGoal] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Interactivity and Agent Analysis States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  
  // States mapping exactly to content requirements
  const [repoStatusHeader, setRepoStatusHeader] = useState("Awaiting Input");
  const [repoStatusSub, setRepoStatusSub] = useState("No repository loaded");
  
  const [repoDetails, setRepoDetails] = useState({
    name: "AWAITING_INPUT",
    language: "N/A",
    framework: "N/A",
    files: "0 files",
    updated: "Never"
  });
  
  const [healthScore, setHealthScore] = useState("00%");
  const [healthText, setHealthText] = useState("SYSTEM_IDLE");

  const workflowSteps = [
    "Repository Cloned",
    "Repository Indexed",
    "AST Metadata Extracted",
    "Code Chunked",
    "Embeddings Generated",
    "ChromaDB Indexed",
    "RAG Retrieval",
    "Repository Understanding Agent",
    "Architecture Agent",
    "Bug Agent",
    "Best Practice Agent",
    "Response Formatter",
    "Report Generated"
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setGithubUrl(""); 
      setRepoStatusHeader("Archive Staged");
      setRepoStatusSub(`Ready to analyze: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    }
  };

  const handleAnalyze = () => {
    if (!githubUrl && !selectedFile) {
      alert("Please enter a GitHub URL or upload a ZIP archive file first!");
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setCompletedSteps([]);
    setHealthScore("...");
    setHealthText("COMPUTING_METRICS...");
    setRepoStatusHeader("Analyzing Content...");
    setRepoStatusSub(selectedFile ? `Reading package manifest from ${selectedFile.name}...` : "Querying multi-agent mesh...");
    
    setRepoDetails({
      name: "RUNNING_AGENTS...",
      language: "INDEXING...",
      framework: "INDEXING...",
      files: "COUNTING...",
      updated: "LIVE"
    });

    workflowSteps.forEach((step, index) => {
      setTimeout(() => {
        setCompletedSteps(prev => [...prev, step]);
        const nextProgress = Math.round(((index + 1) / workflowSteps.length) * 100);
        setProgress(nextProgress);

        if (index === workflowSteps.length - 1) {
          const displayName = githubUrl 
            ? githubUrl.replace("https://github.com/", "").split("/")[1] || "custom-repo"
            : selectedFile ? selectedFile.name.replace(".zip", "") : "uploaded-archive";

          setRepoStatusHeader("Analysis Complete");
          setRepoStatusSub(`Successfully parsed contents of ${displayName}`);
          
          setRepoDetails({
            name: displayName.toUpperCase(),
            language: "TypeScript (84.2%)",
            framework: "React + Vite",
            files: selectedFile ? "58 source files" : "42 source files",
            updated: "Just now"
          });
          setHealthScore("88%");
          setHealthText("CODEBASE_STABLE");
        }
      }, (index + 1) * 220);
    });
  };

  const glassCardStyle: React.CSSProperties = {
    width: "100%", 
    background: "linear-gradient(145deg, rgba(22, 34, 57, 0.25) 0%, rgba(13, 20, 38, 0.4) 100%)", 
    border: "1px solid rgba(255, 255, 255, 0.06)", 
    borderRadius: "16px", 
    padding: "24px", 
    boxShadow: "0 10px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
    boxSizing: "border-box"
  };

  return (
    <div 
      style={{ 
        minHeight: "100vh", 
        display: "flex", 
        flexDirection: "column", 
        background: "#070C17", 
        color: "#F8FAFC",
        fontFamily: "system-ui, -apple-system, sans-serif",
        position: "relative",
        overflowX: "hidden",
        overflowY: "auto"
      }}
    >
      
      {/* Cyber Ambient Accent Shadows */}
      <div style={{ position: "absolute", top: "-10%", left: "20%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(59, 130, 246, 0.08), transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "40%", right: "-10%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(168, 85, 247, 0.05), transparent 70%)", pointerEvents: "none" }} />

      {/* 1. Header Navigation System */}
      <div 
        style={{ 
          width: "100%", 
          background: "rgba(15, 23, 42, 0.6)", 
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          textAlign: "center", 
          padding: "24px 20px",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.4)",
          zIndex: 20,
          boxSizing: "border-box"
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "6px" }}>
          <span style={{ fontSize: "10px", fontWeight: 700, color: "#10B981", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", padding: "2px 8px", borderRadius: "4px", letterSpacing: "1px", fontFamily: "monospace" }}>
            SYSTEM: ONLINE
          </span>
          <span style={{ fontSize: "10px", fontWeight: 700, color: "#3B82F6", background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)", padding: "2px 8px", borderRadius: "4px", letterSpacing: "1px", fontFamily: "monospace" }}>
            AGENTS: 13/13 ACTIVE
          </span>
          <span style={{ fontSize: "10px", fontWeight: 700, color: "#A855F7", background: "rgba(168, 85, 247, 0.1)", border: "1px solid rgba(168, 85, 247, 0.2)", padding: "2px 8px", borderRadius: "4px", letterSpacing: "1px", fontFamily: "monospace" }}>
            DB: RAG_READY
          </span>
        </div>
        <h1 style={{ fontSize: "28px", fontWeight: 900, margin: 0, background: "linear-gradient(135deg, #FFFFFF 40%, #93C5FD 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-0.5px" }}>
          Autonomous Repository Code Reviewer
        </h1>
      </div>

      <div 
        style={{ 
          maxWidth: "1000px", 
          width: "100%", 
          boxSizing: "border-box",
          margin: "0 auto", 
          padding: "32px 20px", 
          display: "flex", 
          flexDirection: "column", 
          gap: "32px",
          zIndex: 10
        }}
      >
        
        {/* 2. Current Status Bar Panel */}
        <div 
          style={{
            width: "100%",
            background: "linear-gradient(145deg, rgba(22, 34, 57, 0.3) 0%, rgba(13, 20, 38, 0.45) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            borderRadius: "16px",
            padding: "20px",
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
          }}
        >
          <div style={{ color: "#64748B", fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px", fontFamily: "monospace", marginBottom: "4px" }}>
            // CURRENT_REPOSITORY_STATUS
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 4px 0", color: "#E2E8F0" }}>
            {repoStatusHeader}
          </h2>
          <div style={{ fontSize: "13px", color: "#60A5FA", fontFamily: "monospace" }}>
            {repoStatusSub}
          </div>
        </div>

        {/* 3. Input Terminal Deck Control Terminal */}
        <div 
          style={{ 
            width: "100%", 
            background: "linear-gradient(145deg, rgba(22, 34, 57, 0.45) 0%, rgba(13, 20, 38, 0.6) 100%)", 
            border: "1px solid rgba(255, 255, 255, 0.08)", 
            borderRadius: "20px", 
            padding: "28px", 
            boxShadow: "0 30px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(20px)",
            boxSizing: "border-box"
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            
            <input 
              type="text"
              placeholder="Enter GitHub Repository URL"
              value={githubUrl}
              onChange={(e) => {
                setGithubUrl(e.target.value);
                setSelectedFile(null);
              }}
              style={{
                width: "100%",
                background: "rgba(7, 12, 23, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                padding: "14px 18px",
                fontSize: "14px",
                color: "#F8FAFC",
                outline: "none",
                boxSizing: "border-box",
                boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.5)",
                fontFamily: "monospace"
              }}
            />

            <div style={{ textAlign: "center", fontSize: "11px", fontWeight: 800, color: "#475569", letterSpacing: "2px", fontFamily: "monospace" }}>// OR</div>

            <div style={{ width: "100%", background: "rgba(7, 12, 23, 0.4)", border: "1px dashed rgba(255, 255, 255, 0.15)", borderRadius: "12px", padding: "14px", display: "flex", alignItems: "center", gap: "12px", boxSizing: "border-box" }}>
              <label style={{ background: "linear-gradient(180deg, #334155 0%, #1E293B 100%)", color: "#F8FAFC", fontSize: "12px", fontWeight: 600, padding: "8px 16px", borderRadius: "8px", cursor: "pointer", whiteSpace: "nowrap", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
                Choose File
                <input type="file" accept=".zip" style={{ display: "none" }} onChange={handleFileChange} />
              </label>
              <span style={{ fontSize: "12px", color: "#64748B", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {selectedFile ? selectedFile.name : "no_file_selected"}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "1px", fontFamily: "monospace" }}>[01] Analysis Objective & Scope</label>
              <textarea 
                rows={2}
                placeholder="Specify execution rules (e.g., Focus on security vulnerabilities in authentication hooks...)"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                style={{ width: "100%", background: "rgba(7, 12, 23, 0.8)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "12px", padding: "12px 16px", fontSize: "14px", color: "#F8FAFC", outline: "none", boxSizing: "border-box", resize: "none", fontFamily: "inherit", boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.5)" }}
              />
              <div style={{ display: "flex", gap: "10px", marginTop: "2px" }}>
                <span style={{ fontSize: "11px", color: "#475569", fontFamily: "monospace" }}>PRESETS:</span>
                <button type="button" onClick={() => setGoal("Scan codebase for critical security bugs and vulnerabilities")} style={{ background: "none", border: "none", color: "#60A5FA", fontSize: "11px", padding: 0, cursor: "pointer", textDecoration: "underline", fontFamily: "monospace" }}>Security_Audit</button>
                <span style={{ fontSize: "11px", color: "#334155" }}>•</span>
                <button type="button" onClick={() => setGoal("Analyze architectural patterns and structural dependencies")} style={{ background: "none", border: "none", color: "#8B5CF6", fontSize: "11px", padding: 0, cursor: "pointer", textDecoration: "underline", fontFamily: "monospace" }}>Architecture_Check</button>
              </div>
            </div>

            <div style={{ marginTop: "6px" }}>
              <button 
                onClick={handleAnalyze}
                style={{ 
                  width: "100%", 
                  background: "linear-gradient(180deg, #3B82F6 0%, #2563EB 100%)", 
                  color: "#FFFFFF", 
                  fontWeight: 700, 
                  padding: "14px", 
                  borderRadius: "12px", 
                  border: "none", 
                  cursor: "pointer", 
                  fontSize: "14px", 
                  letterSpacing: "0.5px",
                  boxShadow: "0 0 20px rgba(37, 99, 235, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
                }}
              >
                {isAnalyzing && progress < 100 ? `RUNNING_PIPELINES (${progress}%)` : "INITIALIZE REVIEW ENGINE"}
              </button>
            </div>
          </div>
        </div>

                {/* 4. TIMELINE RUNNER TIMELINE */}
        <WorkflowTimeline progress={progress} workflowSteps={workflowSteps} completedSteps={completedSteps} />

        {/* 5. METRICS & TELEMETRY MODULES */}
        <RepositoryOverview repoDetails={repoDetails} />
        <HealthScore progress={progress} healthScore={healthScore} healthText={healthText} />

        {/* Unified Line-Based Stack Container */}
        <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
          
          {/* Analysis Configuration Line Card */}
          <div style={{ width: "100%", padding: "24px 0", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
            <div style={{ color: "#60A5FA", fontSize: "12px", fontWeight: 700, letterSpacing: "1.5px", fontFamily: "monospace", marginBottom: "16px" }}>
              // ANALYSIS_CONFIGURATION
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
              {[
                { label: "Review Goal", val: goal || "Review the complete repository" },
                { label: "Embedding Model", val: "BAAI/bge-small-en-v1.5" },
                { label: "LLM Engine", val: "Gemini 2.5 Flash" },
                { label: "Vector Database", val: "ChromaDB" },
                { label: "Orchestrator", val: "LangGraph" }
              ].map((conf, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontFamily: "monospace" }}>
                  <span style={{ color: "#475569", fontWeight: 700 }}>{conf.label}</span>
                  <span style={{ color: "#CBD5E1", textAlign: "right" }}>{conf.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Architecture Line Card */}
          <div style={{ width: "100%", padding: "24px 0", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
            <div style={{ color: "#60A5FA", fontSize: "12px", fontWeight: 700, letterSpacing: "1.5px", fontFamily: "monospace", marginBottom: "16px" }}>
              // ARCHITECTURE
            </div>
            <div style={{ fontSize: "14px", color: "#94A3B8", lineHeight: "1.6", fontFamily: "monospace" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div>Pattern: Layered MVC / Component-Driven Hybrid</div>
                <div>Flow: Unidirectional state pipeline linking sub-nodes dynamically.</div>
              </div>
            </div>
          </div>

          {/* Repository Understanding Line Card */}
          <div style={{ width: "100%", padding: "24px 0", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
            <div style={{ color: "#60A5FA", fontSize: "12px", fontWeight: 700, letterSpacing: "1.5px", fontFamily: "monospace", marginBottom: "16px" }}>
              // REPOSITORY_UNDERSTANDING
            </div>
            <div style={{ fontSize: "14px", color: "#94A3B8", lineHeight: "1.6", fontFamily: "monospace" }}>
              <div>High-performance UI administration dashboard tailored for tracking autonomous agent telemetry loops with structural validation hooks.</div>
            </div>
          </div>

          {/* Subsystems Line Card */}
          <div style={{ width: "100%", padding: "24px 0", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
            <div style={{ color: "#60A5FA", fontSize: "12px", fontWeight: 700, letterSpacing: "1.5px", fontFamily: "monospace", marginBottom: "16px" }}>
              // SUBSYSTEMS
            </div>
            <div style={{ fontSize: "14px", color: "#94A3B8", lineHeight: "1.6", fontFamily: "monospace" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div>REPOSITORY Repository Overview & Metric Extraction Hub</div>
                <div>PRIMARY_LANG Primary Programming Language Matrix</div>
                <div>ARCH_FRAME Framework Identification System</div>
              </div>
            </div>
          </div>

        </div>

        {/* 7. MODULARIZED FINDINGS DECK CARD CONTAINER */}
        <div style={{ ...glassCardStyle, display: "flex", flexDirection: "column", gap: "20px", marginTop: "12px" }}>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            <BugFindings progress={progress} />
            <BestPractices progress={progress} />
            <Recommendations progress={progress} />
          </div>
        </div>

      </div>
    </div>
  );
}