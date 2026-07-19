import { useEffect, useState } from "react";
import "./AnalysisLoading.css";
import { Bot } from "lucide-react";
const steps = [
  "Repository Cloned",
  "Parsing Source Files",
  "Building Dependency Graph",
  "Generating Embeddings",
  "Building Vector Database",
  "Retrieving Relevant Files (RAG)",
  "Architecture Analysis",
  "Security Analysis",
  "Bug Detection",
  "Generating Executive Report",
];

export default function AnalysisLoading() {
     const [progress, setProgress] = useState(0);
     const activeStep = Math.floor(progress / 10);
     useEffect(() => {
  const interval = setInterval(() => {
    setProgress((prev) => {
      if (prev >= 97) return 97;
      return prev + 1;
    });
  }, 400);

  return () => clearInterval(interval);
}, []);
  return (
    <div className="analysis-loading">
      <div className="loading-card">

        <div className="robot">
  <Bot size={58} color="#3DD9EB" />
</div>

        <h1>Initializing AI Analysis</h1>

        <p>
          Our autonomous AI agents are reviewing your repository.
          <br />
          This usually takes 30–60 seconds.
        </p>

        <div className="progress-wrapper">

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="progress-number">
  {progress}%
</div>

        </div>

        <div className="steps">

          {steps.map((step, index) => (

            <div
  className={`step ${
    index === activeStep ? "active" : ""
  }`}
  key={index}
>
              <span className="step-icon">

                 {index < activeStep
    ? "✔"
    : index === activeStep
    ? "⟳"
    : "○"}

              </span>

              <span>{step}</span>

            </div>

          ))}

        </div>

      </div>
    </div>
  );
}