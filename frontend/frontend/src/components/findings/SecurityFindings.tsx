import {
  ShieldCheck,
  AlertTriangle,
  FileCode2,
} from "lucide-react";

import GlassCard from "../common/GlassCard";

interface SecurityFinding {
  type: string;
  file: string;
  line: number;
  description: string;
  action: string;
}

interface SecurityReport {
  secure: boolean;
  findings: SecurityFinding[];
}

interface SecurityFindingsProps {
  security: SecurityReport;
}

export default function SecurityFindings({
  security,
}: SecurityFindingsProps) {
  return (
    <GlassCard>
      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 18,
          marginBottom: 22,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            
            
             <AlertTriangle
    size={26}
    color="#EF4444"
  />


            <h2
              style={{
                color: "white",
                margin: 0,
                fontSize: 23,
                fontWeight: 800,
              }}
            >
              Security Assessment
            </h2>
          </div>
          <div
        style={{
          width: "115%",
          height: 2,
          margin: "14px 0 15px",
          borderRadius: 999,
          background:
            "linear-gradient(90deg,#EF4444,#F59E0B,transparent)",
        }}
      />

          <p
            style={{
              marginTop: 4,
              color: "#94A3B8",
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            Repository scanned for exposed credentials,
            API keys, secrets and sensitive configuration
            files.
          </p>
        </div>

        <div
          style={{
            padding: "10px 20px",
            borderRadius: 999,
            fontWeight: 700,
            fontSize: 13,

            color: security.secure
              ? "#22C55E"
              : "#EF4444",

            background: security.secure
              ? "rgba(34,197,94,.12)"
              : "rgba(239,68,68,.12)",

            border: security.secure
              ? "1px solid rgba(34,197,94,.35)"
              : "1px solid rgba(239,68,68,.35)",
          }}
        >
          {security.secure
  ? "✓ SECURITY CHECKS PASSED"
  : "SECURITY ISSUES FOUND"}
        </div>
      </div>

      {/* ===================================================== */}
      {/* SECURITY FINDINGS */}
      {/* ===================================================== */}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        {security.secure ? (
          <div
            style={{
              textAlign: "center",
              padding: "30px 20px",
              background: "#172436",
              borderRadius: 20,
              border:
                "1px dashed rgba(34,197,94,.35)",
            }}
          >
           <div
  style={{
    display: "flex",
    justifyContent: "center",
    marginBottom: 14,
  }}
>
  <ShieldCheck
    size={52}
    color="#22C55E"
  />
</div>

<h3
  style={{
    margin: 0,
    color: "white",
    fontSize: 24,
    fontWeight: 800,
  }}
>
  No Security Issues Detected
</h3>

<p
  style={{
    marginTop: 8,
    color: "#22C55E",
    fontSize: 15,
    fontWeight: 600,
  }}
>
  The repository passed all automated security checks.
</p>

<p
  style={{
    color: "#94A3B8",
    maxWidth: 650,
    margin: "8px auto 0",
    lineHeight: 1.6,
    fontSize: 15,
  }}
>
  No credentials, tokens, secrets, or sensitive configuration
  files were detected during analysis.
</p>



          </div>
        ) : (
          security.findings.map((item, index) => (
            <div
              key={index}
              style={{
                background:
                  "linear-gradient(135deg,#2A1515,#172436)",

                borderLeft:
                  "6px solid #EF4444",

                borderRadius: 20,

                padding: 20,

                border:
                  "1px solid rgba(239,68,68,.28)",

                boxShadow:
                  "0 0 30px rgba(239,68,68,.18)",
              }}
            >
              {/* TOP */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: 16,
                }}
              >
                <div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 14px",
                      borderRadius: 999,
                      background: "rgba(239,68,68,.15)",
                      color: "#EF4444",
                      border: "1px solid rgba(239,68,68,.40)",
                      fontWeight: 700,
                      fontSize: 11,
                      marginBottom: 12,
                    }}
                  >
                    🚨 CRITICAL
                  </div>

                  <h3
                    style={{
                      margin: 0,
                      color: "white",
                      fontSize: 21,
                      fontWeight: 700,
                    }}
                  >
                    {item.type}
                  </h3>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "rgba(61,217,235,.08)",
                    border:
                      "1px solid rgba(61,217,235,.18)",
                    borderRadius: 999,
                    padding: "7px 14px",
                    color: "#CBD5E1",
                    fontSize: 12,
                  }}
                >
                  <FileCode2
                    size={14}
                    color="#38BDF8"
                  />

                  {item.file}:{item.line}
                </div>
              </div>

              <div
                style={{
                  height: 1,
                  margin: "16px 0",
                  background:
                    "rgba(255,255,255,.08)",
                }}
              />

              {/* Description */}
                            <div
                style={{
                  color: "#CBD5E1",
                  fontSize: 14,
                  lineHeight: 1.65,
                }}
              >
                {item.description}
              </div>

              {/* Action */}

              <div
                style={{
                  marginTop: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 16px",
                  borderRadius: 12,
                  background: "rgba(239,68,68,.10)",
                  border: "1px solid rgba(239,68,68,.30)",
                  color: "#EF4444",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                <AlertTriangle size={16} />

                {item.action}
              </div>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
}