interface BestPracticesProps {
  progress: number;
}

export default function BestPractices({ progress }: BestPracticesProps) {
  return (
    <div style={{ flex: "1 1 280px" }}>
      <h4 style={{ fontSize: "13px", fontWeight: 800, color: "#34D399", margin: "0 0 6px 0", letterSpacing: "0.5px", fontFamily: "monospace" }}>
        // BEST_PRACTICES
      </h4>
      <p style={{ fontSize: "12px", color: "#94A3B8", margin: 0, fontFamily: "monospace", background: "rgba(7, 12, 23, 0.3)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.02)", minHeight: "60px" }}>
        {progress === 100 ? "[PASSED] Modular components align cleanly with strict architecture scope constraints. Readability is strong." : "No data yet."}
      </p>
    </div>
  );
}