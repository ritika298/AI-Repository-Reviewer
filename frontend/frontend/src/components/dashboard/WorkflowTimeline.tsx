interface WorkflowTimelineProps {
  progress: number;
  workflowSteps: string[];
  completedSteps: string[];
}

export default function WorkflowTimeline({ progress, workflowSteps, completedSteps }: WorkflowTimelineProps) {
  return (
    <div style={{
      width: "100%", 
      background: "linear-gradient(145deg, rgba(22, 34, 57, 0.25) 0%, rgba(13, 20, 38, 0.4) 100%)", 
      border: "1px solid rgba(255, 255, 255, 0.06)", 
      borderRadius: "16px", 
      padding: "24px", 
      boxShadow: "0 10px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
      boxSizing: "border-box"
    }}>
      <h3 style={{ fontSize: "14px", fontWeight: 800, margin: "0 0 4px 0", background: "linear-gradient(90deg, #A855F7, #C084FC)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "1px", fontFamily: "monospace" }}>
        // AUTONOMOUS_AI_WORKFLOW
      </h3>
      <div style={{ fontSize: "11px", color: "#475569", marginBottom: "16px", fontFamily: "monospace", fontWeight: 600 }}>PROGRESS: <span style={{ color: "#A855F7" }}>{progress}%</span></div>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
        {workflowSteps.map((step, idx) => {
          const isDone = completedSteps.includes(step);
          return (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", opacity: isDone ? 1 : 0.35, transition: "all 0.3s ease", padding: "6px 10px", background: isDone ? "rgba(16, 185, 129, 0.03)" : "transparent", border: isDone ? "1px solid rgba(16, 185, 129, 0.1)" : "1px solid transparent", borderRadius: "8px" }}>
              <span style={{ color: isDone ? "#10B981" : "#475569", textShadow: isDone ? "0 0 8px #10B981" : "none", fontSize: "14px" }}>
                {isDone ? "✓" : "▪"}
              </span>
              <span style={{ color: isDone ? "#E2E8F0" : "#64748B", fontFamily: "monospace" }}>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}