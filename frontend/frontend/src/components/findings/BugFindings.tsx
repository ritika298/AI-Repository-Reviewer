interface BugFindingsProps {
  progress: number;
}

export default function BugFindings({ progress }: BugFindingsProps) {
  return (
    <div style={{ flex: "1 1 280px" }}>
      <h4 style={{ fontSize: "13px", fontWeight: 800, color: "#F87171", margin: "0 0 6px 0", letterSpacing: "0.5px", fontFamily: "monospace" }}>
        // BUG_FINDINGS
      </h4>
      <p style={{ fontSize: "12px", color: "#94A3B8", margin: 0, fontFamily: "monospace", background: "rgba(7, 12, 23, 0.3)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.02)", minHeight: "60px" }}>
        {progress === 100 ? "[SECURE] 0 critical vulnerabilities found. 2 minor dependency warnings flagged for package upgrades." : "No bugs detected yet."}
      </p>
    </div>
  );
}