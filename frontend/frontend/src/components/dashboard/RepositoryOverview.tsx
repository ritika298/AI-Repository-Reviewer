import {
  GitBranch,
  Code2,
  Layers3,
  FolderGit2,
  Clock3,
  CheckCircle2,
} from "lucide-react";

import GlassCard from "../common/GlassCard";
import CardTitle from "../common/CardTitle";

interface Repository {
  name: string;
  language: string;
  framework: string;
  totalFiles: number;
}

interface RepositoryOverviewProps {
  report: {
    repository: Repository;
  };
}

export default function RepositoryOverview({
  report,
}: RepositoryOverviewProps) {
  return (
    <GlassCard>
     <div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    paddingTop: 8,
    marginBottom: 26,
  }}
>
  <CardTitle icon={<GitBranch size={25} />}>
   <div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  }}
>
  <h3
    style={{
      margin: 0,
      color: "#F8FAFC",
      fontSize: 18,
      fontWeight: 700,
      letterSpacing: ".3px",
    }}
  >
    Repository Overview
  </h3>

  <div
    style={{
      width: 230,
      height:2,
      borderRadius: 999,
      marginTop: 8,
      background: "linear-gradient(90deg,#3DD9EB,#22C55E)",
    }}
  />
</div>

  </CardTitle>

  <h1
    style={{
      fontSize: 42,
      fontWeight: 800,
      color: "white",
      marginTop: 6,
      marginBottom: 8,
      lineHeight: 1.1,
      letterSpacing: "-0.9px",
    }}
  >
    {report.repository.name}
  </h1>

  <p
    style={{
      color: "#94A3B8",
      fontSize: 16,
      maxWidth: 620,
      lineHeight: 1.6,
      margin: 0,
    }}
  >
    AI-powered repository architecture and quality analysis.
  </p>
</div>

<div>
        <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 380px))",
    justifyContent: "center",
    gap: 16,
    margin: "0 auto",
    width: "95%",
  }}
>
          <InfoCard
            icon={<Code2 size={18} />}
            title="Language"
            value={report.repository.language}
          />

          <InfoCard
            icon={<Layers3 size={18} />}
            title="Framework"
            value={report.repository.framework}
          />

          <InfoCard
            icon={<FolderGit2 size={18} />}
            title="Files Indexed"
            value={`${report.repository.totalFiles}`}
          />

          <InfoCard
            icon={<Clock3 size={18} />}
            title="Processing Time"
            value="32 sec"
          />
        </div>

        <div
          style={{
             margin: "28px auto 0",
    width: "95%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(34,197,94,.08)",
            border: "1px solid rgba(34,197,94,.18)",
            borderRadius: 12,
            padding: "14px 18px",
          }}
        >
          <div>
            <div
              style={{
                color: "#94A3B8",
                fontSize: 12,
                marginBottom: 2,
              }}
            >
              Repository Status
            </div>

            <div
              style={{
                color: "white",
                fontSize: 17,
                fontWeight: 600,
              }}
            >
              Successfully Analyzed
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#22C55E",
              fontWeight: 600,
              fontSize: 16,
            }}
          >
            <CheckCircle2 size={18} />
            Healthy
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
}

function InfoCard({
  icon,
  title,
  value,
}: InfoCardProps) {
  return (
    <div
      style={{
        background: "#172436",
        borderRadius: 12,
        padding: "12px 16px",
        border: "1px solid rgba(61,217,235,.08)",
        minHeight: 60,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <div
          style={{
            color: "#38BDF8",
            display: "flex",
            alignItems: "center",
          }}
        >
          {icon}
        </div>

        <span
          style={{
            color: "#94A3B8",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {title}
        </span>
      </div>

      <div
        style={{
          color: "white",
          fontSize: 16,
          fontWeight: 600,
          marginTop: 6,
        }}
      >
        {value}
      </div>
    </div>
  );
}