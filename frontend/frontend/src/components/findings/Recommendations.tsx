interface RecommendationsProps {
  progress: number;
}

export default function Recommendations({ progress }: RecommendationsProps) {
  return (
    <div style={{ flex: "1 1 280px" }}>
      <h4 style={{ fontSize: "13px", fontWeight: 800, color: "#F59E0B", margin: "0 0 6px 0", letterSpacing: "0.5px", fontFamily: "monospace" }}>
        // RECOMMENDATIONS
      </h4>
      <p style={{ fontSize: "12px", color: "#94A3B8", margin: 0, fontFamily: "monospace", background: "rgba(7, 12, 23, 0.3)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.02)", whiteSpace: "pre-line", minHeight: "60px" }}>
        {progress === 100 ? "• Optimize runtime memory footings by indexing dynamic vector modules.\n• Introduce strict data parsing rules on external entry hooks." : "No data yet."}
      </p>
    </div>
  );
}