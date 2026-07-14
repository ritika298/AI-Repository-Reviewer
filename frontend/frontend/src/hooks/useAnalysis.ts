import { useState } from "react";

export interface RepoDetails {
  name: string;
  language: string;
  framework: string;
  files: string;
  updated: string;
}

export function useAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [healthScore, setHealthScore] = useState("00%");
  const [healthText, setHealthText] = useState("Calculating...");

  const [repoDetails, setRepoDetails] = useState<RepoDetails>({
    name: "Loading...",
    language: "Loading...",
    framework: "Loading...",
    files: "Loading...",
    updated: "Loading...",
  });

  const analyzeRepository = (input: string | File) => {
    setIsAnalyzing(true);
    setProgress(0);
    setHealthScore("..");
    setHealthText("Calculating...");
    
    setRepoDetails({
      name: "Analyzing...",
      language: "Loading...",
      framework: "Loading...",
      files: "Loading...",
      updated: "Loading...",
    });

    // Simulate the agent execution timeline steps
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        
        // Determine name based on string URL or uploaded File object
        const targetName = typeof input === "string" 
          ? input.replace("https://github.com/", "").split("/")[1] || "custom-repo"
          : input.name.replace(".zip", "");

        // Inject the detailed analysis data payload into the states
        setRepoDetails({
          name: targetName.toUpperCase(),
          language: "TypeScript (84.2%)",
          framework: "React + Vite",
          files: "42 source files",
          updated: "Just now",
        });
        
        setHealthScore("88%");
        setHealthText("CODEBASE_STABLE");
      }
    }, 400); // Progress increments smoothly every 400ms
  };

  return {
    isAnalyzing,
    progress,
    healthScore,
    healthText,
    repoDetails,
    analyzeRepository,
  };
}