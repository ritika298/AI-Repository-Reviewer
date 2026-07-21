const demoReport = {
  repository: {
    name: "Simple-Multithreader",
    language: "C++",
    framework: "Unknown",
    totalFiles: 4,
  },

  healthScore: 78,

  repositoryUnderstanding: {
    subsystems: [
      {
        name: "Core Threading Library",
        purpose:
          "Provides generic parallel loop constructs (`parallel_for`) for 1D and 2D ranges, abstracting POSIX thread management (`pthread_create`, `pthread_join`) using a static block scheduling model.",
        keyFiles: ["simple-multithreader.h"],
      },
      {
        name: "Vector Operations Demo",
        purpose:
          "Illustrates how to use the `parallel_for` construct for vector addition including initialization, parallel execution, verification and cleanup.",
        keyFiles: ["vector.cpp"],
      },
      {
        name: "Matrix Operations Demo",
        purpose:
          "Illustrates how to use the `parallel_for` construct for matrix multiplication including allocation, initialization, computation and cleanup.",
        keyFiles: ["matrix.cpp"],
      },
      {
        name: "Build System",
        purpose:
          "Defines compilation rules and links against the pthread library.",
        keyFiles: ["Makefile"],
      },
      {
        name: "Documentation & Usage",
        purpose:
          "Provides project overview, build instructions, usage examples and limitations.",
        keyFiles: ["README.md"],
      },
    ],

    workflow: [
      {
        step: "User compiles the project",
        description:
          "The user executes `make` or `g++` commands defined in the Makefile.",
      },
      {
        step: "User runs a demo executable",
        description:
          "The executable parses command-line arguments for thread count and problem size.",
      },
      {
        step: "Problem initialization",
        description:
          "Vectors or matrices are allocated and initialized.",
      },
      {
        step: "Parallel computation begins",
        description:
          "The application invokes `parallel_for` from the threading library.",
      },
      {
        step: "Threads perform work",
        description:
          "POSIX threads execute different portions of the workload concurrently.",
      },
      {
        step: "Results are verified",
        description:
          "Assertions validate the correctness of the computed output.",
      },
      {
        step: "Memory cleanup",
        description:
          "Allocated memory is released before program termination.",
      },
    ],
  },

  architecture: {
    description:
      "This repository presents a C++ library for parallelizing 1D and 2D loops using POSIX threads and static block scheduling. Two demonstration applications (vector addition and matrix multiplication) directly utilize the library.",

    diagram: `
                 User
                  |
                  v
      +----------------------+
      |     Build System     |
      +----------------------+
                  |
                  v
      +----------------------+
      | Demo Applications    |
      | (vector, matrix)     |
      +----------------------+
                  |
                  | Uses
                  v
      +----------------------+
      | Core Threading Lib   |
      | (parallel_for)       |
      +----------------------+
                  |
                  | Spawns
                  v
      +----------------------+
      | POSIX Threads        |
      +----------------------+
`,

    patterns: ["Strategy", "Facade"],
  },

  bugs: [
    {
      severity: "HIGH",
      description:
        "`atoi` converts non-numeric arguments to 0, potentially causing `numThread` to become 0, which is invalid for `parallel_for` and may lead to runtime errors or undefined behaviour.",
      fix:
        "Validate `atoi` results or replace it with `std::stoi` and proper exception handling.",
      files: [
        {
          file: "vector.cpp",
          line: 6,
        },
      ],
    },

  

    {
      severity: "LOW",
      description:
        "Matrix rows are initialized redundantly inside a loop; each row is filled multiple times instead of once, causing significant inefficiency.",
      fix:
        "Remove the `for(int j=0; j<size; j++)` loop surrounding the `std::fill` calls.",
      files: [
        {
          file: "matrix.cpp",
          line: 18,
        },
      ],
    },
  ],

security: {
  secure: false,

  findings: [
    {
      type: "Environment File",
      file: ".env",
      line: 1,
      description:
        "An environment (.env) file is committed to the repository. Sensitive configuration files should not be tracked in version control.",
      action: "Immediate Action Required",
    },

    {
      type: "OpenAI API Key",
      file: ".env",
      line: 4,
      description:
        "A hardcoded OpenAI API key was detected. API keys should never be committed to the repository.",
      action: "Immediate Action Required",
    },

    {
      type: "GitHub Personal Access Token",
      file: "config/github.cpp",
      line: 17,
      description:
        "A GitHub Personal Access Token appears to be hardcoded. Store credentials in environment variables or a secure secrets manager.",
      action: "Immediate Action Required",
    },

    {
      type: "JWT Secret",
      file: "auth/auth.cpp",
      line: 28,
      description:
        "A hardcoded JWT secret was detected. Secrets should be stored outside the source code.",
      action: "Immediate Action Required",
    },

    {
      type: "Database Password",
      file: "database/db_config.cpp",
      line: 13,
      description:
        "A hardcoded database password was detected. Credentials should never be committed to version control.",
      action: "Immediate Action Required",
    },
  ],
},

  bestPractices: [
    {
      category: "Code Modularity",
      status: "FAILED",
      details:
        "Core threading logic is well-abstracted into `parallel_for`, but the project would benefit from additional separation of responsibilities.",
    },

    {
      category: "Naming Conventions",
      status: "FAILED",
      details:
        "Naming is generally descriptive and consistent across the project.",
    },

    {
      category: "Error Handling",
      status: "FAILED",
      details:
        "Input validation, memory allocation checks and graceful error recovery are insufficient.",
    },

    {
      category: "Documentation",
      status: "FAILED",
      details:
        "README is comprehensive, but API-level documentation could be expanded.",
    },

    {
      category: "Testing",
      status: "FAILED",
      details:
        "Testing relies mainly on assertions instead of an automated testing framework.",
    },

    {
      category: "Security Practices",
      status: "FAILED",
      details:
        "Unvalidated user input through `atoi` may result in undefined behaviour and runtime issues.",
    },
  ],

  recommendations: [
    "Address 2 high-severity issue(s) before deploying to production.",
    "Replace `atoi` with `std::stoi` and validate command-line input.",
    "Remove redundant matrix initialization loops to improve performance.",
    "Introduce automated unit testing for both demo applications.",
    "Improve exception handling and input validation throughout the codebase.",
  ],

  filesRetrievedByRag: [
    "README.md",
    "vector.cpp",
    "matrix.cpp",
    "simple-multithreader.h",
  ],
};

export default demoReport;