

const demoReport = {
  repository: {
    name: "AI Repository Reviewer",
    language: "TypeScript",
    framework: "React + FastAPI",
    totalFiles: 126,
  },

  healthScore: 89,

  repositoryUnderstanding: {
    subsystems: [],
    workflow: [],
  },

  architecture: {
    description:
      "This repository follows a React frontend with FastAPI backend connected through a Retrieval-Augmented Generation pipeline.",
    diagram: "",
    patterns: [
      "Component Based Architecture",
      "REST API",
      "RAG Pipeline",
      "Multi-Agent Workflow",
    ],
  },

  bugs: [
  {
    severity: "HIGH",
    description: "Unsanitized SQL query",
    fix: "Use parameterized queries instead of string concatenation.",
    files: [
      {
        file: "backend/login.py",
        line: 42,
      },
    ],
  },
  {
    severity: "MEDIUM",
    description: "Unused API endpoint",
    fix: "Remove unused endpoint or document its purpose.",
    files: [
      {
        file: "routes/user.py",
        line: 87,
      },
    ],
  },
],

  bestPractices: [
    {
      category: "Code Structure",
      status: "PASSED",
      details: "Project follows modular architecture.",
    },
    {
      category: "Security",
      status: "FAILED",
      details: "Some environment variables should be secured.",
    },
  ],

  recommendations: [
    "Improve authentication.",
    "Reduce duplicate components.",
    "Increase test coverage.",
  ],

  filesRetrievedByRag: [
    "src/App.tsx",
    "services/gemini.py",
    "graph/workflow.py",
    "agents/bug_agent.py",
  ],
  
};

export default demoReport;
