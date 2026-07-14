interface HealthScoreProps {
  progress: number;
  healthScore: string;
  healthText: string;
}

export default function HealthScore({ progress, healthScore, healthText }: HealthScoreProps) {
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <h3 style={{ fontSize: "14px", fontWeight: 800, margin: "0 0 16px 0", color: "#F87171", letterSpacing: "1px", fontFamily: "monospace" }}>
        // STABILITY_INDEX
      </h3>
      <div 
        style={{ 
          width: "120px", 
          height: "120px", 
          borderRadius: "50%", 
          border: `4px solid ${progress === 100 ? "#10B981" : "rgba(59, 130, 246, 0.2)"}`, 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          margin: "20px 0",
          background: "rgba(7, 12, 23, 0.5)"
        }}
      >
        <span style={{ fontSize: "26px", fontWeight: 900, color: progress === 100 ? "#10B981" : "#60A5FA", fontFamily: "monospace" }}>
          {progress === 100 ? healthScore : "..."}
        </span>
      </div>
      <div style={{ fontSize: "11px", color: progress === 100 ? "#10B981" : "#475569", fontWeight: 700, letterSpacing: "1px", fontFamily: "monospace" }}>
        {progress === 100 ? healthText : "COMPUTING_METRICS..."}
      </div>
    </div>
  );
}