"use client";
import { API_BASE_URL } from "@/lib/api";
import { useEffect, useState } from "react";
import { getResumeData } from "@/store/resumeStore";
import BackgroundEffects from "@/components/ui/BackgroundEffects";
import PageContainer from "@/components/ui/PageContainer";

type DataShape = Record<string, any>;

type ProgressPanelProps = {
  title: string;
  description: string;
  progress: number;
  accent: "green" | "cyan";
  loadingText: string;
};

type MetricCardProps = {
  title: string;
  value: string | number;
  valueClassName: string;
  description?: string;
  progress?: number;
  progressClassName?: string;
};

type PillListProps = {
  items: string[];
  emptyMessage?: string;
  itemClassName?: string;
};

const cardClassName = "rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl";
const sectionTitleClassName = "text-2xl text-center font-semibold";

function MetricCard({
  title,
  value,
  valueClassName,
  description,
  progress,
  progressClassName,
}: MetricCardProps) {
  return (
    <div className={cardClassName}>
      <p className="text-base text-center text-white/50">{title}</p>
      <h2 className={`mt-4 text-6xl text-center font-bold ${valueClassName}`}>
        {value}
      </h2>
      {progress !== undefined ? (
        <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full ${progressClassName}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}
      {description ? <p className="mt-4 text-center text-white/60">{description}</p> : null}
    </div>
  );
}

function PillList({ items, emptyMessage, itemClassName }: PillListProps) {
  if (items.length === 0) {
    return <p className="mt-6 text-center text-green-300">{emptyMessage}</p>;
  }

  return (
    <div className="mt-8 flex flex-wrap justify-center gap-4">
      {items.map((item) => (
        <div key={item} className={`rounded-full border px-5 py-3 text-base ${itemClassName}`}>
          {item}
        </div>
      ))}
    </div>
  );
}

function ProgressPanel({ title, description, progress, accent, loadingText }: ProgressPanelProps) {
  const accentClasses = {
    green: "border-green-500/20 bg-green-500/5 text-green-300",
    cyan: "border-cyan-500/20 bg-cyan-500/5 text-cyan-300",
  };

  const spinnerClasses = {
    green: "border-green-500 border-t-transparent",
    cyan: "border-cyan-500 border-t-transparent",
  };

  const barClasses = {
    green: "from-green-400 to-emerald-500",
    cyan: "from-cyan-400 to-blue-500",
  };

  return (
    <div className={`mt-10 w-full rounded-3xl border p-8 ${accentClasses[accent]}`}>
      <div className="mt-6 flex justify-center">
        <div className={`h-12 w-12 animate-spin rounded-full border-4 ${spinnerClasses[accent]}`} />
      </div>

      <p className="mt-4 text-center text-white/70">{loadingText}</p>
      <div className="mt-6 h-3 rounded-full bg-white/10">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barClasses[accent]} transition-all duration-300`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-3 text-center">{description}</p>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  disabled,
  variant,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant: "green" | "cyan";
}) {
  const classes = {
    green: "from-green-500 to-emerald-600 bg-gradient-to-r",
    cyan: "from-cyan-500 to-blue-600 bg-gradient-to-r",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full px-8 py-4 font-semibold text-white transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 ${classes[variant]}`}
    >
      {label}
    </button>
  );
}

export default function ResultsPageContent() {
  const [data, setData] = useState<DataShape | null>(null);
  const [rewriting, setRewriting] = useState(false);
  const [rewrite, setRewrite] = useState("");
  const [loadingCoverLetter, setLoadingCoverLetter] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [rewriteProgress, setRewriteProgress] = useState(0);
  const [coverLetterProgress, setCoverLetterProgress] = useState(0);

  useEffect(() => {
    setData(getResumeData());
  }, []);

  const skills = data?.skills || [];
  const entities = data?.entities || {};
  const candidateName = data?.candidate_name || "Unknown Candidate";
  const candidateEmail = entities?.emails?.[0] || "No Email Found";
  const candidateLocation = entities?.locations?.[0] || "Unknown Location";
  const atsScore = data?.ats?.ats_score || 0;
  const experienceLevel = data?.experience_level || "Unknown";
  const matchedSkills = data?.job_match?.matched_skills || [];
  const missingSkills = data?.job_match?.missing_skills || [];
  const semanticScore = data?.semantic_match?.semantic_match_score || 0;
  const aiRecommendations = data?.ai_recommendations || "";
  const atsAdvice = data?.ats_advice || {};
  const textPreview = data?.text_preview || "";
  const jobDescription = data?.job_description || "";

  const runGeneration = async ({
    endpoint,
    payload,
    setLoading,
    setProgress,
    setOutput,
    fallbackMessage,
    outputKey,
  }: {
    endpoint: string;
    payload: DataShape;
    setLoading: (value: boolean) => void;
    setProgress: (value: number) => void;
    setOutput: (value: string) => void;
    fallbackMessage: string;
    outputKey: string;
  }) => {
    setProgress(0);
    const interval = window.setInterval(() => {
      setProgress((prev) => (prev >= 90 ? prev : prev + 5));
    }, 200);

    try {
      setLoading(true);
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      setProgress(100);
      setOutput(result[outputKey] || fallbackMessage);
    } catch (error) {
      console.error(error);
      setOutput(fallbackMessage);
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const handleRewrite = async () => {
    await runGeneration({
      endpoint: "${API_BASE_URL}/api/rewrite-from-text",
      payload: { resume_text: textPreview },
      setLoading: setRewriting,
      setProgress: setRewriteProgress,
      setOutput: setRewrite,
      fallbackMessage: "Failed to generate resume rewrite.",
      outputKey: "rewrite",
    });
  };

  const handleCoverLetter = async () => {
    await runGeneration({
      endpoint: "${API_BASE_URL}/api/cover-letter-from-text",
      payload: { resume_text: textPreview, job_description: jobDescription },
      setLoading: setLoadingCoverLetter,
      setProgress: setCoverLetterProgress,
      setOutput: setCoverLetter,
      fallbackMessage: "Failed to generate cover letter.",
      outputKey: "cover_letter",
    });
  };

  const downloadTextFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadDocx = async ({ endpoint, payload, filename }: { endpoint: string; payload: DataShape; filename: string }) => {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const downloadResume = () => downloadTextFile(rewrite, "CareerOps_Improved_Resume.txt");
  const downloadCoverLetterFile = () => downloadTextFile(coverLetter, "CareerOps_Cover_Letter.txt");

  const downloadResumeDocx = () =>
    downloadDocx({
      endpoint: "${API_BASE_URL}/api/export-resume",
      payload: {
        candidate_name: candidateName,
        email: candidateEmail,
        location: candidateLocation,
        skills,
        resume_text: rewrite,
      },
      filename: "CareerOps_Resume.docx",
    });

  const downloadCoverLetterDocx = () =>
    downloadDocx({
      endpoint: "${API_BASE_URL}/api/export-cover-letter",
      payload: {
        candidate_name: candidateName,
        email: candidateEmail,
        location: candidateLocation,
        skills,
        cover_letter_text: coverLetter,
      },
      filename: "CareerOps_Cover_Letter.docx",
    });

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading...
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <BackgroundEffects />
      <PageContainer>
        <div className="flex w-full flex-col items-center">
          <div className="text-center">
            <div className="mb-8 items-center justify-center rounded-full border border-green-400/30 bg-green-400/5 px-14 pb-[14px] pt-3 text-base text-green-300 backdrop-blur-sm">
              AI Analysis Complete
            </div>
            <h1 className="text-6xl font-bold tracking-tight">{candidateName}</h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
              AI successfully analyzed your resume and extracted skills, entities, and career insights dynamically.
            </p>
          </div>

          <div className="mt-16 grid w-full grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            <MetricCard
              title="ATS Compatibility"
              value={`${atsScore}%`}
              valueClassName={atsScore >= 90 ? "text-green-400" : atsScore >= 70 ? "text-cyan-400" : "text-orange-400"}
              progress={atsScore}
              progressClassName="bg-gradient-to-r from-green-400 to-emerald-500"
            />
            <MetricCard
              title="Job Match Score"
              value={`${data?.job_match?.match_score || 0}%`}
              valueClassName="text-cyan-400"
              progress={data?.job_match?.match_score || 0}
              progressClassName="bg-gradient-to-r from-cyan-400 to-blue-500"
            />
            <MetricCard
              title="Semantic Match"
              value={`${semanticScore}%`}
              valueClassName="text-yellow-400"
              progress={semanticScore}
              progressClassName="bg-gradient-to-r from-yellow-400 to-orange-500"
            />
            <MetricCard
              title="Experience Level"
              value={experienceLevel}
              valueClassName="text-purple-400"
              description="Strong cloud and DevOps engineering background detected."
            />
          </div>

          <div className="mt-14 w-full rounded-3xl border border-orange-500/20 bg-orange-500/5 p-8 backdrop-blur-xl">
            <h2 className="text-2xl text-center font-semibold text-orange-300">ATS Advisor</h2>
            <div className="mt-8 grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="mb-4 text-lg font-semibold text-red-300">Missing Keywords</h3>
                <div className="flex flex-wrap gap-3">
                  {(atsAdvice.missing_keywords || []).map((keyword: string) => (
                    <span key={keyword} className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-red-300">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-4 text-lg font-semibold text-yellow-300">Recommendations</h3>
                <ul className="space-y-3">
                  {(atsAdvice.recommendations || []).map((rec: string, index: number) => (
                    <li key={index} className="text-white/80">
                      • {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-10 w-full rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <h2 className={sectionTitleClassName}>Candidate Information</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {[
                { label: "Name", value: candidateName },
                { label: "Email", value: candidateEmail },
                { label: "Location", value: candidateLocation },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-black/20 p-5 text-center">
                  <p className="text-base text-white/50">{item.label}</p>
                  <p className="mt-2 text-lg break-all text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 w-full rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <h2 className={sectionTitleClassName}>Analysis Pipeline</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-5">
              {[
                "✓ Resume Parsed",
                "✓ Skills Extracted",
                "✓ ATS Scored",
                "✓ Job Match",
                "✓ AI Analysis",
              ].map((step) => (
                <div key={step} className="rounded-xl bg-green-500/10 p-4 text-center">
                  {step}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-14 w-full rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <h2 className={sectionTitleClassName}>Extracted Skills</h2>
            <PillList items={skills} emptyMessage="No skills detected." itemClassName="border-green-400/20 bg-green-400/5 text-green-300" />
          </div>

          <div className="mt-14 w-full rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-8 backdrop-blur-xl">
            <h2 className="text-2xl text-center font-semibold text-cyan-300">Matched Skills</h2>
            <PillList items={matchedSkills} emptyMessage="No matched skills detected." itemClassName="border-cyan-400/20 bg-cyan-400/5 text-cyan-300" />
          </div>

          <div className="mt-14 w-full rounded-3xl border border-red-500/20 bg-red-500/5 p-8 backdrop-blur-xl">
            <h2 className="text-2xl text-center font-semibold text-red-300">Missing Skills</h2>
            <PillList items={missingSkills} emptyMessage="No missing skills detected." itemClassName="border-red-400/20 bg-red-400/5 text-red-300" />
          </div>

          <div className="mt-14 w-full rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <h2 className={sectionTitleClassName}>AI Career Analysis</h2>
            <div className="mt-8 max-h-[350px] overflow-y-auto rounded-2xl border border-white/10 bg-black/20 p-6">
              <pre className="whitespace-pre-wrap text-white/80">{aiRecommendations}</pre>
            </div>
          </div>

          <div className="mt-14 w-full rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <h2 className={sectionTitleClassName}>Resume Preview</h2>
            <p className="mt-2 text-center text-white/50">First extracted text from uploaded PDF</p>
            <div className="mt-6 max-h-[300px] overflow-y-auto rounded-2xl border border-white/10 bg-black/30 p-6">
              <pre className="whitespace-pre-wrap break-words text-base text-white/70">
                {data?.text_preview || "No preview available"}
              </pre>
            </div>
          </div>

          <div className="mt-14 w-full rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <h2 className={sectionTitleClassName}>Resume Overview</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 p-5 text-center">
                <p className="text-base text-white/50">Total Skills</p>
                <p className="mt-2 text-3xl font-bold text-green-400">{skills.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 p-5 text-center">
                <p className="text-base text-white/50">Experience Level</p>
                <p className="mt-2 text-3xl font-bold text-purple-400">{experienceLevel}</p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-6">
            <ActionButton
              label={rewriting ? `Generating Resume... ${rewriteProgress}%` : "Generate Improved Resume"}
              onClick={handleRewrite}
              disabled={rewriting}
              variant="green"
            />
            <ActionButton
              label={loadingCoverLetter ? `Generating Cover Letter... ${coverLetterProgress}%` : "Generate Cover Letter"}
              onClick={handleCoverLetter}
              disabled={loadingCoverLetter}
              variant="cyan"
            />
          </div>

          {rewriting ? (
            <ProgressPanel
              title="AI Improving Resume"
              description={`${rewriteProgress}%`}
              progress={rewriteProgress}
              accent="green"
              loadingText="Optimizing Resume..."
            />
          ) : rewrite ? (
            <div className="mt-14 w-full rounded-3xl border border-green-500/20 bg-green-500/5 p-8 backdrop-blur-xl">
              <h2 className="text-2xl text-center font-semibold text-green-300">AI Improved Resume</h2>
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-6">
                <pre className="whitespace-pre-wrap text-white/80">{rewrite}</pre>
              </div>
            </div>
          ) : null}

          {rewrite ? (
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <button onClick={downloadResume} className="rounded-full bg-green-500 px-6 py-3 font-semibold text-white transition-all hover:scale-105">
                Download TXT Resume
              </button>
              <button onClick={downloadResumeDocx} className="rounded-full bg-green-500 px-6 py-3 font-semibold text-white transition-all hover:scale-105">
                Download DOCX Resume
              </button>
            </div>
          ) : null}

          {loadingCoverLetter ? (
            <ProgressPanel
              title="AI Generating Cover Letter"
              description={`${coverLetterProgress}%`}
              progress={coverLetterProgress}
              accent="cyan"
              loadingText="Writing Cover Letter..."
            />
          ) : coverLetter ? (
            <div className="mt-14 w-full rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-8 backdrop-blur-xl">
              <h2 className="text-2xl text-center font-semibold text-cyan-300">Generated Cover Letter</h2>
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-6">
                <pre className="whitespace-pre-wrap text-white/80">{coverLetter}</pre>
              </div>
            </div>
          ) : null}

          {coverLetter ? (
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <button onClick={downloadCoverLetterFile} className="rounded-full bg-cyan-500 px-6 py-3 font-semibold text-white transition-all hover:scale-105">
                Download TXT Cover Letter
              </button>
              <button onClick={downloadCoverLetterDocx} className="rounded-full bg-cyan-500 px-6 py-3 font-semibold text-white transition-all hover:scale-105">
                Download DOCX Cover Letter
              </button>
            </div>
          ) : null}

          <div className="mt-10 pb-10 text-center text-white/40">CareerOps v2 • AI Career Intelligence Platform</div>
        </div>
      </PageContainer>
    </main>
  );
}
