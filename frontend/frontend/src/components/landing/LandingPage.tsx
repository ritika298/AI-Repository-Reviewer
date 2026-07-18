import "./LandingPage.css";
import { motion } from "framer-motion";
import {
  Sparkles,
  Upload,
  Loader2,
  ChevronRight,
} from "lucide-react";

interface LandingPageProps {
  githubUrl: string;
  setGithubUrl: (value: string) => void;

  zipFile: File | null;
  setZipFile: (file: File | null) => void;

  goal: string;
  setGoal: (value: string) => void;

  loading: boolean;
  handleAnalyze: () => void;
}

export default function LandingPage({
  githubUrl,
  setGithubUrl,
  zipFile,
  setZipFile,
  goal,
  setGoal,
  loading,
  handleAnalyze,
}: LandingPageProps) {
  return (
   
  <div className="landing-page">

    <motion.div
      className="hero"
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >

      <div className="badge">
        <Sparkles size={16} />
        <span>Autonomous Multi-Agent AI</span>
      </div>

      <h1 className="hero-title">
        Autonomous Repository
        <br />
        <span>Code Reviewer</span>
      </h1>

      <p className="hero-text">
        Analyze GitHub repositories using specialized AI agents that understand
        architecture, detect bugs, review best practices, retrieve relevant
        code using RAG, and generate detailed reports.
      </p>

      <motion.div
        className="card"
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: .2 }}
      >

        <input
          className="input"
          placeholder="GitHub Repository URL"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
        />

        <div className="divider">
          <span>OR</span>
        </div>

        <label className="upload">

          <Upload size={48} />

          <h3>
            {zipFile ? zipFile.name : "Upload ZIP Repository"}
          </h3>

          <p>
            Drag & Drop or Click to Browse
          </p>

          <input
            hidden
            type="file"
            accept=".zip"
            onChange={(e) =>
              setZipFile(e.target.files?.[0] || null)
            }
          />

        </label>

        <textarea
          rows={4}
          className="input textarea"
          placeholder="Review Goal (Optional)"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: .98 }}
          className="analyze-btn"
          onClick={handleAnalyze}
          disabled={loading}
        >

          {loading ? (
            <>
              <Loader2
                size={18}
                className="animate-spin"
              />
              &nbsp;Analyzing...
            </>
          ) : (
            <>
              <ChevronRight size={18} />
              &nbsp;Analyze Repository
            </>
          )}

        </motion.button>

      </motion.div>

    </motion.div>

  </div>
)}