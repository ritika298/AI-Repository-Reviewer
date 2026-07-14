interface RepoDetails {
  name: string;
  language: string;
  framework: string;
  files: string;
  updated: string;
}

interface RepositoryOverviewProps {
  repoDetails: RepoDetails;
}

export default function RepositoryOverview({ repoDetails }: RepositoryOverviewProps) {
  return (
    <div className="card">
      <h3 style={{ fontSize: "14px", fontWeight: 800, margin: "0 0 16px 0", color: "#60A5FA", letterSpacing: "1px", fontFamily: "monospace" }}>
        // CORE_METRICS
      </h3>
      <div className="card-content">
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#64748B" }}>REPOSITORY</span>
          <span style={{ color: "#93C5FD", fontFamily: "monospace" }}>{repoDetails.name}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#64748B" }}>PRIMARY_LANG</span>
          <span style={{ color: "#93C5FD", fontFamily: "monospace" }}>{repoDetails.language}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#64748B" }}>ARCH_FRAME</span>
          <span style={{ color: "#93C5FD", fontFamily: "monospace" }}>{repoDetails.framework}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#64748B" }}>TOTAL_FILES</span>
          <span style={{ color: "#93C5FD", fontFamily: "monospace" }}>{repoDetails.files}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
          <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#64748B" }}>LAST_ENGAGE</span>
          <span style={{ color: "#93C5FD", fontFamily: "monospace" }}>{repoDetails.updated}</span>
        </div>
      </div>
    </div>
  );
}