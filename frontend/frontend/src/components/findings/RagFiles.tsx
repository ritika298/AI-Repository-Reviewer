import { FileCode2, Sparkles } from "lucide-react";
import GlassCard from "../common/GlassCard";

interface RagFilesProps {
  report: {
    filesRetrievedByRag: string[];
  };
}

export default function RagFiles({
  report,
}: RagFilesProps) {
  const getFileType = (file: string) => {
    const ext = file.split(".").pop()?.toLowerCase();

    switch (ext) {
      case "cpp":
        return "Source File";
      case "h":
      case "hpp":
        return "Header File";
      case "md":
        return "Documentation";
      case "json":
        return "Configuration";
      case "yml":
      case "yaml":
        return "Configuration";
      default:
        return "Project File";
    }
  };

  return (
    <GlassCard>
      {/* Header */}

      <div
        style={{
          textAlign: "center",
          marginBottom: 30,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 12,
          }}
        >
          <Sparkles size={20} color="#3DD9EB" />

          <h2
            style={{
              margin: 0,
              color: "white",
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            Semantic Retrieval Results
          </h2>
        </div>

        <div
          style={{
            width: 300,
            height: 3,
            borderRadius: 999,
            margin: "0 auto 18px",
            background: "linear-gradient(90deg,#3DD9EB,#22C55E)",
          }}
        />

        <p
          style={{
            color: "#94A3B8",
            maxWidth: 700,
            margin: "0 auto 18px",
            lineHeight: 1.6,
            fontSize: 15,
          }}
        >
          The AI selected these files as the most relevant context before
          performing the repository analysis.
        </p>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "8px 16px",
            borderRadius: 999,
            background: "rgba(61,217,235,.08)",
            border: "1px solid rgba(61,217,235,.15)",
            color: "#3DD9EB",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Top {report.filesRetrievedByRag.length} Context Files
        </div>
      </div>

      {/* File Cards */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
          gap: 18,
        }}
      >
        {report.filesRetrievedByRag.map((file, index) => {
          const fileName = file.split("/").pop() || file;

          return (
            <div
              key={index}
              style={{
                background:
                  "linear-gradient(180deg,#1A2A3D 0%, #162436 100%)",
                border: "1px solid rgba(61,217,235,.08)",
                borderRadius: 16,
                padding: 20,
                transition: "all .25s ease",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.borderColor =
                  "rgba(61,217,235,.22)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor =
                  "rgba(61,217,235,.08)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: "rgba(61,217,235,.08)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <FileCode2 size={20} color="#3DD9EB" />
                </div>

                <div>
                  <div
                    style={{
                      color: "white",
                      fontSize: 19,
                      fontWeight: 700,
                    }}
                  >
                    {fileName}
                  </div>

                  <div
                    style={{
                      color: "#94A3B8",
                      fontSize: 14,
                      marginTop: 4,
                    }}
                  >
                    {getFileType(file)}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    color: "#22C55E",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  ✓ AI Selected
                </span>

                <span
                  style={{
                    color: "#64748B",
                    fontSize: 12,
                  }}
                >
                  Context #{index + 1}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}