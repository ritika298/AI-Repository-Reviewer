# RepoMinds – Autonomous Repository Code Reviewer

An AI-powered repository analysis platform that automatically reviews GitHub repositories or uploaded ZIP archives and generates a comprehensive engineering report using **Retrieval-Augmented Generation (RAG)** and a **LangGraph-based Multi-Agent System**.

---

## Overview

Understanding large software repositories is often time-consuming and requires manual inspection of architecture, workflows, bugs, and code quality. RepoMinds automates this process by combining semantic code retrieval with specialized AI agents to generate repository insights within minutes.

The system accepts a **GitHub repository URL** or **ZIP archive**, analyzes the repository, and produces an interactive engineering report containing:

- Repository Overview
- Subsystem Identification
- Architecture Reconstruction
- Execution Workflow
- Bug Detection
- Security Assessment
- Best Practices Evaluation
- Actionable Recommendations
- Repository Health Score

---

## Features

- Analyze GitHub repositories or ZIP uploads
- Semantic code indexing using Retrieval-Augmented Generation (RAG)
- LangGraph-based Multi-Agent workflow
- AI-powered architecture reconstruction
- Automated bug detection
- Security assessment for exposed API keys, authentication tokens, secrets, and sensitive configuration files
- Best practice evaluation
- Repository Health Score
- Interactive React dashboard
## System Architecture

```
Repository Input
        │
        ▼
Repository Manager
(Clone / Extract ZIP)
        │
        ▼
Repository Scanner
        │
        ▼
Semantic Chunking
        │
        ▼
Embedding Generation
        │
        ▼
ChromaDB Vector Store
        │
        ▼
Retrieval-Augmented Generation (RAG)
        │
        ▼
LangGraph Multi-Agent Pipeline
 ├── Repository Understanding Agent
 ├── Architecture Agent
 ├── Bug Detection Agent
 ├── Best Practices Agent
 └── Response Formatter Agent
        │
        ▼
Engineering Report
        │
        ▼
React Dashboard
```

---

## Technology Stack

### Backend

- FastAPI
- LangGraph
- ChromaDB
- Sentence Transformers
- GitPython
- Python

### Frontend

- React
- Vite
- TypeScript
- CSS

### AI

- Google Gemini 2.5 Flash
- Retrieval-Augmented Generation (RAG)
- Semantic Embeddings

---

## Project Structure

```
AI-Code-Reviewer/
│
├── backend/
│   ├── agents/
│   ├── api/
│   ├── core/
│   ├── graph/
│   ├── models/
│   ├── services/
│   ├── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
│
├── README.md
└── .gitignore
```

---

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd AI-Code-Reviewer
```

### Backend

```bash
cd backend

python -m venv .venv

source .venv/bin/activate      # macOS/Linux
# .venv\Scripts\activate       # Windows

pip install -r requirements.txt
```

### Frontend

```bash
cd frontend

npm install
```

---

## Environment Variables

Create a `.env` file inside the backend directory.

```env
GEMINI_API_KEY=YOUR_API_KEY
```

---

## Running the Project

### Backend

```bash
uvicorn main:app --reload
```

Runs on:

```
http://localhost:8000
```

### Frontend

```bash
npm run dev
```

Runs on:

```
http://localhost:5173
```

---

## Usage

1. Open the frontend.
2. Enter a GitHub repository URL or upload a ZIP archive.
3. Click **Analyze Repository**.
4. Wait for the AI pipeline to complete.
5. Explore the generated repository report.

---

## Output

The generated report includes:

- Repository Summary
- Repository Understanding
- Architecture Diagram
- Execution Workflow
- Bug Findings
- Security Assessment
- Best Practices
- Recommendations
- Repository Health Score

---

## Future Improvements

- Support for private repositories
- Incremental repository indexing
- Parallel AI agent execution
- Dependency vulnerability scanning
- Repository history analysis
- CI/CD integration

---

## Team

**RepoMinds**

SIP 2026 – Generative & Agentic AI Systems Development

---

## License

This project is developed for academic purposes as part of the SIP 2026 Capstone Project.
