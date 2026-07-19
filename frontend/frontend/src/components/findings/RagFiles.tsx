import { FileCode2, Sparkles } from "lucide-react";
import GlassCard from "../common/GlassCard";
import CardTitle from "../common/CardTitle";

interface RagFilesProps {
  report: {
    filesRetrievedByRag: string[];
  };
}

export default function RagFiles({
  report,
}: RagFilesProps) {
  return (
    <GlassCard>

      <CardTitle
        icon={<Sparkles size={18} />}
      >
        Files Retrieved by RAG
      </CardTitle>

      <p
        style={{
          color: "#94A3B8",
          marginTop: 12,
          marginBottom: 24,
          lineHeight: 1.6,
          fontSize: 15,
        }}
      >
        These files were selected by semantic retrieval as the most relevant
        before the AI agents began reviewing the repository.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(260px, 320px))",
justifyContent: "center",
gap: "14px",
        }}
      >
        {report.filesRetrievedByRag.map((file, index) => (
          <div
            key={index}
            style={{
              background: "#172436",
              border: "1px solid rgba(61,217,235,.08)",
              borderRadius: "12px",
              padding: "14px 16px",
              transition: ".25s",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "8px",
              }}
            >
              <FileCode2
                size={18}
                color="#38BDF8"
              />

              <span
                style={{
                  color: "white",
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {file.split("/").pop()}
              </span>
            </div>

            <div
              style={{
                color: "#94A3B8",
                fontSize: 13,
                wordBreak: "break-word",
              }}
            >
              {file}
            </div>

          </div>
        ))}
      </div>

    </GlassCard>
  );
}