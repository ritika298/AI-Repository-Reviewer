interface SubsystemCardProps {
  progress: number;
}

export default function SubsystemCard({ progress }: SubsystemCardProps) {
  return (
    <div className="card" style={{ padding: "24px", marginBottom: "20px" }}>
      <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 14px 0", color: "#3B82F6" }}>
        Subsystems
      </h3>
      <div style={{ fontSize: "14px", color: "#94A3B8", lineHeight: "1.6" }}>
        {progress < 100 ? (
          "Loading subsystems..."
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontFamily: "monospace" }}>
            <div><span style={{ color: "#10B981" }}>●</span> Upload & File Processing Controller Matrix</div>
            <div><span style={{ color: "#10B981" }}>●</span> Multi-Agent RAG Processing Pipeline</div>
            <div><span style={{ color: "#10B981" }}>●</span> Real-time Telemetry Assessment Deck</div>
          </div>
        )}
      </div>
    </div>
  );
}