interface RepositoryUnderstandingProps {
  progress: number;
}

export default function RepositoryUnderstanding({ progress }: RepositoryUnderstandingProps) {
  return (
    <div className="card" style={{ padding: "24px", marginBottom: "20px" }}>
      <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 14px 0", color: "#3B82F6" }}>
        Repository Understanding
      </h3>
      <div style={{ fontSize: "14px", color: "#94A3B8", lineHeight: "1.6" }}>
        {progress < 100 ? (
          "Loading repository understanding..."
        ) : (
          <div style={{ fontFamily: "monospace" }}>
            High-performance UI administration dashboard tailored for tracking autonomous agent telemetry loops with structural validation hooks.
          </div>
        )}
      </div>
    </div>
  );
}