"use client";
import { API_BASE_URL } from "@/lib/api";
import { useResumeData } from "@/store/resumeStore";
import BackgroundEffects from "@/components/ui/BackgroundEffects";
import PageContainer from "@/components/ui/PageContainer";
import { useRef, useState } from "react";

const API_BASE = API_BASE_URL;

/* ------------------------------------------------------------------ */
/*  Small reusable UI pieces                                          */
/* ------------------------------------------------------------------ */

function GlassCard({
  title,
  titleClassName = "",
  borderClassName = "border-white/10",
  bgClassName = "bg-white/5",
  className = "",
  children,
}: {
  title?: string;
  titleClassName?: string;
  borderClassName?: string;
  bgClassName?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`w-full min-w-0 rounded-3xl border ${borderClassName} ${bgClassName} p-5 backdrop-blur-xl sm:p-8 ${className}`}
    >
      {title && (
        <h2 className={`text-2xl text-center font-semibold ${titleClassName}`}>
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

function StatCard({
  label,
  value,
  valueClassName,
  barFrom,
  barTo,
  percent,
  footer,
}: {
  label: string;
  value: string | number;
  valueClassName: string;
  barFrom: string;
  barTo: string;
  percent: number;
  footer?: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden break-words rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
      <p className="text-base text-center text-white/50">{label}</p>
      <h2 className={`mt-4 text-6xl text-center font-bold ${valueClassName}`}>
        {value}
      </h2>
      <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barFrom} ${barTo} transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {footer}
    </div>
  );
}

const PILL_STYLES = {
  green:
    "border-green-400/20 bg-green-400/5 text-green-300",
  cyan:
    "border-cyan-400/20 bg-cyan-400/5 text-cyan-300",
  red:
    "border-red-400/20 bg-red-400/5 text-red-300",
} as const;

function SkillPillList({
  skills,
  color,
  emptyMessage,
}: {
  skills: string[];
  color: keyof typeof PILL_STYLES;
  emptyMessage?: string;
}) {
  if (skills.length === 0 && emptyMessage) {
    return (
      <p className="mt-6 text-center text-green-300">{emptyMessage}</p>
    );
  }

  return (
    <div className="mt-8 flex flex-wrap justify-center gap-4">
      {skills.map((skill) => (
        <div
          key={skill}
          className={`rounded-full border px-5 py-3 text-base ${PILL_STYLES[color]}`}
        >
          {skill}
        </div>
      ))}
    </div>
  );
}

function ScrollBox({
  children,
  maxHeight = "350px",
  className = "",
}: {
  children: React.ReactNode;
  maxHeight?: string;
  className?: string;
}) {
  return (
    <div
      className={`mt-6 overflow-y-auto rounded-2xl border border-white/10 bg-black/20 p-6 ${className}`}
      style={{ maxHeight }}
    >
      <pre className="whitespace-pre-wrap break-words text-white/80">
        {children}
      </pre>
    </div>
  );
}

const resumeSectionHeadings = new Set([
  "SUMMARY",
  "PROFESSIONAL SUMMARY",
  "PROFILE",
  "PROFESSIONAL PROFILE",
  "OBJECTIVE",
  "CAREER OBJECTIVE",
  "TECHNICAL SKILLS",
  "SKILLS",
  "CORE SKILLS",
  "CORE COMPETENCIES",
  "PROFESSIONAL EXPERIENCE",
  "WORK EXPERIENCE",
  "EXPERIENCE",
  "PROJECTS",
  "EDUCATION",
  "CERTIFICATIONS",
  "CERTIFICATES",
  "LANGUAGES",
  "AWARDS",
  "ACHIEVEMENTS",
  "PUBLICATIONS",
  "VOLUNTEER EXPERIENCE",
  "VOLUNTEERING",
  "ADDITIONAL INFORMATION",
]);

const resumeEntrySections = new Set([
  "PROFESSIONAL EXPERIENCE",
  "WORK EXPERIENCE",
  "EXPERIENCE",
  "PROJECTS",
  "EDUCATION",
]);

function ResumePreview({ text }: { text: string }) {
  const lines = text.split(/\r?\n/).map((line) => line.trim());
  const visibleLines = lines.filter(Boolean);
  const firstSectionIndex = visibleLines.findIndex((line) =>
    resumeSectionHeadings.has(line.replace(/:$/, "").toUpperCase())
  );
  const headerLines = visibleLines.slice(
    0,
    firstSectionIndex === -1 ? 1 : firstSectionIndex
  );
  const contentLines =
    firstSectionIndex === -1 ? visibleLines.slice(1) : visibleLines.slice(firstSectionIndex);
  let currentSection = "";

  return (
    <div
      className="mt-6 max-h-[520px] overflow-y-auto rounded-2xl border border-white/10 bg-black/25 p-3 sm:p-5"
      data-testid="resume-preview"
    >
      <article className="mx-auto min-h-[480px] max-w-[760px] bg-white px-6 py-8 text-slate-700 shadow-2xl sm:px-12 sm:py-10">
        {headerLines[0] && (
          <h4 className="break-words text-center font-sans text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {headerLines[0]}
          </h4>
        )}
        {headerLines.slice(1).map((line, index) => (
          <p
            key={`${index}-${line}`}
            className="mt-1 break-words text-center text-xs text-slate-500 sm:text-sm"
          >
            {line}
          </p>
        ))}
        <div className="mt-5 h-1 rounded-full bg-teal-700" />

        <div className="mt-5 space-y-1">
          {contentLines.map((line, index) => {
            const heading = line.replace(/:$/, "").toUpperCase();
            if (resumeSectionHeadings.has(heading)) {
              currentSection = heading;
              return (
                <h5
                  key={`${index}-${line}`}
                  className="mb-2 mt-5 border-b border-teal-700/30 pb-1 text-sm font-bold uppercase tracking-[0.12em] text-teal-800 first:mt-0"
                >
                  {heading}
                </h5>
              );
            }

            const bullet = line.match(/^\s*(?:[•●▪◦*-])\s+(.+)$/);
            if (bullet) {
              return (
                <div
                  key={`${index}-${line}`}
                  className="relative pl-5 text-sm leading-relaxed text-slate-700"
                >
                  <span className="absolute left-1 text-teal-700">•</span>
                  {bullet[1]}
                </div>
              );
            }

            const isEntryLine =
              resumeEntrySections.has(currentSection) && line.includes(" | ");

            return (
              <p
                key={`${index}-${line}`}
                className={`whitespace-pre-wrap break-words text-sm leading-relaxed ${
                  isEntryLine ? "font-semibold text-slate-900" : "text-slate-700"
                }`}
              >
                {line}
              </p>
            );
          })}
        </div>
      </article>
    </div>
  );
}

function GenerationProgress({
  label,
  percent,
  colorFrom,
  colorTo,
  ringColor,
  textColor,
}: {
  label: string;
  percent: number;
  colorFrom: string;
  colorTo: string;
  ringColor: string;
  textColor: string;
}) {
  return (
    <div className="mt-8 flex flex-col items-center">
      <div
        className={`h-16 w-16 animate-spin rounded-full border-4 ${ringColor} border-t-transparent`}
      />
      <p className={`mt-6 ${textColor}`}>{label}</p>
      <div className="mt-6 h-4 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full bg-gradient-to-r ${colorFrom} ${colorTo} transition-all duration-300`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className={`mt-3 ${textColor}`}>{percent}%</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Generation hook: fake progress + fetch, shared by resume & letter */
/* ------------------------------------------------------------------ */

function extractGeneratedText(value: unknown): string | null {
  if (typeof value === "string") {
    return value.trim() ? value : null;
  }
  if (!value || typeof value !== "object") return null;

  const candidate = value as Record<string, unknown>;
  for (const key of ["text", "content", "cover_letter", "rewrite", "response"]) {
    const text = extractGeneratedText(candidate[key]);
    if (text) return text;
  }
  return null;
}

function responseErrorMessage(value: unknown, fallback: string): string {
  if (typeof value === "string" && value.trim()) return value;
  if (!value || typeof value !== "object") return fallback;

  const record = value as Record<string, unknown>;
  if (typeof record.detail === "string") return record.detail;
  if (Array.isArray(record.detail)) {
    const messages = record.detail
      .map((item) =>
        item && typeof item === "object" && "msg" in item
          ? String(item.msg)
          : ""
      )
      .filter(Boolean);
    if (messages.length) return messages.join("; ");
  }
  return fallback;
}

function useGeneratedContent(endpoint: string) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generate = async (
    body: Record<string, unknown>,
    resultKey: string,
    fallbackText: string
  ) => {
    setProgress(0);
    setLoading(true);
    setError("");

    intervalRef.current = setInterval(() => {
      setProgress((current: number) => {
        if (current >= 90) {
          return current;
        }

        return current + 5;
      });
    }, 200);

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        throw new Error(responseErrorMessage(result, fallbackText));
      }
      if (!result || typeof result !== "object") {
        throw new Error(fallbackText);
      }
      const generatedText = extractGeneratedText(
        (result as Record<string, unknown>)[resultKey]
      );
      if (!generatedText) throw new Error(fallbackText);

      setProgress(100);
      setContent(generatedText);
    } catch (error) {
      setError(error instanceof Error ? error.message : fallbackText);
    } finally {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setLoading(false);
    }
  };

  return { content, loading, error, progress, generate };
}

/* ------------------------------------------------------------------ */
/*  Download helpers                                                  */
/* ------------------------------------------------------------------ */

async function downloadDocxFromApi(
  endpoint: string,
  body: Record<string, unknown>,
  filename: string
) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    window.alert(result.detail || "Document export failed.");
    return;
  }
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ResultsPage() {
  const data = useResumeData();

  const initialResume = data?.rewritten_resume || "";
  const resume = useGeneratedContent("/api/rewrite-from-text");
  const coverLetter = useGeneratedContent("/api/cover-letter-from-text");
  const [activeGeneration, setActiveGeneration] = useState<"resume" | "cover-letter">("resume");
  const [improvementInstructions, setImprovementInstructions] = useState("");

  if (!data) {
    return (
      <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-black text-white">
        <BackgroundEffects variant="results" />
        <p className="relative z-10">Loading...</p>
      </main>
    );
  }

  const resumeContent = resume.content || initialResume;
  const jobDescription = data.job_description ?? "";
  const skills: string[] = data?.skills || [];
  const entities = data?.entities;
  const candidateName = data?.candidate_name || "Unknown Candidate";
  const candidateEmail = entities?.emails?.[0] || "No Email Found";
  const candidateLocation = entities?.locations?.[0] || "Unknown Location";
  const atsScore = data?.ats?.ats_score || 0;
  const experienceLevel = data?.experience_level || "Unknown";
  const matchedSkills: string[] = data?.job_match?.matched_skills || [];
  const missingSkills: string[] = data?.job_match?.missing_skills || [];
  const matchScore = data?.job_match?.match_score || 0;
  const semanticScore = data?.semantic_match?.semantic_match_score;
  const semanticMethod = data?.semantic_match?.semantic_match_method;
  const careerInsights = data?.ai_recommendations || "";
  const atsAdvice = data?.ats_advice || {};
  const textPreview = data?.text_preview || "";

  const candidateInfo = { candidate_name: candidateName, email: candidateEmail, location: candidateLocation, skills };

  return (
    <main className="relative min-h-screen overflow-x-clip overflow-y-visible bg-black text-white">
      <BackgroundEffects variant="results" />

      <PageContainer>
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center">
          {/* HEADER */}
          <div className="text-center">
            <div className="mb-8 items-center justify-center rounded-full border border-green-400/30 bg-green-400/5 px-14 pt-3 pb-[14px] text-base text-green-300 backdrop-blur-sm">
              AI Analysis Complete
            </div>
            <h1 className="break-words text-4xl font-bold tracking-tight sm:text-6xl">{candidateName}</h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
              AI successfully analyzed your resume and extracted skills,
              entities, and career insights dynamically.
            </p>
          </div>

          {/* DASHBOARD */}
          <div className="mt-16 grid w-full grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="ATS Compatibility"
              value={`${atsScore}%`}
              percent={atsScore}
              valueClassName={
                atsScore >= 90
                  ? "text-green-400"
                  : atsScore >= 70
                  ? "text-cyan-400"
                  : "text-orange-400"
              }
              barFrom="from-green-400"
              barTo="to-emerald-500"
            />
            <StatCard
              label="Job Match Score"
              value={`${matchScore}%`}
              percent={matchScore}
              valueClassName="text-cyan-400"
              barFrom="from-cyan-400"
              barTo="to-blue-500"
            />
            <StatCard
              label={semanticMethod === "text_similarity" ? "Text Similarity" : "Semantic Match"}
              value={typeof semanticScore === "number" ? `${semanticScore}%` : "N/A"}
              percent={semanticScore ?? 0}
              valueClassName="text-yellow-400"
              barFrom="from-yellow-400"
              barTo="to-orange-500"
            />
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <p className="text-base text-center text-white/50">
                Experience Level
              </p>
              <h2 className="mt-4 text-6xl text-center font-bold text-purple-400">
                {experienceLevel}
              </h2>
              <p className="mt-4 text-center text-white/60">
                Strong cloud and DevOps engineering background detected.
              </p>
            </div>
          </div>

          {/* ATS ADVISOR */}
          <GlassCard
            className="mt-14"
            title="ATS Advisor"
            titleClassName="text-orange-300"
            borderClassName="border-orange-500/20"
            bgClassName="bg-orange-500/5"
          >
            <div className="mt-8 grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="mb-4 text-lg font-semibold text-red-300">
                  Missing Keywords
                </h3>
                <div className="flex flex-wrap gap-3">
                  {(atsAdvice.missing_keywords || []).map((keyword: string) => (
                    <span
                      key={keyword}
                      className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-red-300"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-4 text-lg font-semibold text-yellow-300">
                  Recommendations
                </h3>
                <ul className="space-y-3">
                  {(atsAdvice.recommendations || []).map(
                    (rec: string, index: number) => (
                      <li key={index} className="text-white/80">
                        • {rec}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </GlassCard>

          {/* CANDIDATE INFO */}
          <GlassCard className="mt-10" title="Candidate Information">
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {[
                { label: "Name", value: candidateName },
                { label: "Email", value: candidateEmail, breakAll: true },
                { label: "Location", value: candidateLocation },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-black/20 p-5 text-center"
                >
                  <p className="text-base text-white/50">{item.label}</p>
                  <p
                    className={`mt-2 text-lg text-white ${
                      item.breakAll ? "break-all" : ""
                    }`}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* PIPELINE */}
          <GlassCard className="mt-10" title="Analysis Pipeline">
            <div className="mt-8 grid md:grid-cols-5 gap-4">
              {[
                "Resume Parsed",
                "Skills Extracted",
                "ATS Scored",
                "Job Match",
                "AI Analysis",
              ].map((step) => (
                <div
                  key={step}
                  className="rounded-xl bg-green-500/10 p-4 text-center"
                >
                  ✓ {step}
                </div>
              ))}
            </div>
          </GlassCard>

          {/* SKILLS */}
          <GlassCard className="mt-14" title="Extracted Skills">
            <SkillPillList skills={skills} color="green" />
          </GlassCard>

          <GlassCard
            className="mt-14"
            title="Matched Skills"
            titleClassName="text-cyan-300"
            borderClassName="border-cyan-500/20"
            bgClassName="bg-cyan-500/5"
          >
            <SkillPillList skills={matchedSkills} color="cyan" />
          </GlassCard>

          <GlassCard
            className="mt-14"
            title="Missing Skills"
            titleClassName="text-red-300"
            borderClassName="border-red-500/20"
            bgClassName="bg-red-500/5"
          >
            <SkillPillList
              skills={missingSkills}
              color="red"
              emptyMessage="No missing skills detected."
            />
          </GlassCard>

          {/* AI CAREER ANALYSIS — scrollable */}
          <GlassCard className="mt-14" title="Career Insights">
            <ScrollBox maxHeight="420px">{careerInsights}</ScrollBox>
          </GlassCard>

          {/* RESUME OVERVIEW */}
          <GlassCard className="mt-14" title="Resume Overview">
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border text-center border-white/10 p-5">
                <p className="text-white/50 text-base">Total Skills</p>
                <p className="mt-2 text-3xl font-bold text-green-400">
                  {skills.length}
                </p>
              </div>
              <div className="rounded-2xl text-center border border-white/10 p-5">
                <p className="text-white/50 text-base">Experience Level</p>
                <p className="mt-2 text-3xl font-bold text-purple-400">
                  {experienceLevel}
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="mt-14" title="Your Career Documents">
            <p className="mt-2 text-center text-sm text-white/55">
              Both documents use the job description you added during upload. Add optional guidance to refine either document.
            </p>

            <div className="mx-auto mt-6 grid w-full min-w-0 justify-items-center text-center">
              <div className="mt-6 w-full max-w-3xl rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.04] p-4 text-center">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <p className="text-sm font-medium text-cyan-100">
                    Job description from upload
                  </p>
                  <span className="rounded-full border border-cyan-200/15 bg-cyan-100/5 px-3 py-1 text-xs text-cyan-100/70">
                    {jobDescription ? "Applied to both documents" : "Not provided"}
                  </span>
                </div>
                {jobDescription ? (
                  <details className="mt-2">
                    <summary className="mx-auto w-fit cursor-pointer text-xs text-white/50 transition hover:text-white/80">
                      View uploaded job description
                    </summary>
                    <p className="mt-3 max-h-40 overflow-y-auto whitespace-pre-wrap text-left text-sm text-white/65">
                      {jobDescription}
                    </p>
                  </details>
                ) : (
                  <p className="mt-2 text-sm text-white/50">
                    Start a new resume upload with a job description to tailor both documents.
                  </p>
                )}
              </div>

              <div className="mt-5 w-full max-w-3xl text-center">
                <label
                  className="mb-2 block text-center text-sm font-medium text-white/75"
                  htmlFor="document-improvement-instructions"
                >
                  Additional improvement guidance <span className="font-normal text-white/45">(optional)</span>
                </label>
                <textarea
                  id="document-improvement-instructions"
                  value={improvementInstructions}
                  onChange={(event) => setImprovementInstructions(event.target.value)}
                  placeholder="For example: emphasize cloud infrastructure experience and keep the tone concise."
                  maxLength={2000}
                  className="mx-auto block min-h-24 w-full resize-y rounded-2xl border border-white/10 bg-black/30 p-4 text-center text-sm text-white outline-none placeholder:text-white/35 focus:border-green-300/50"
                />
              </div>

              <div
                role="tablist"
                aria-label="Career documents"
                className="mt-7 grid w-full min-w-0 grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-black/30 p-2"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeGeneration === "resume"}
                  onClick={() => setActiveGeneration("resume")}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold transition sm:text-base ${
                    activeGeneration === "resume"
                      ? "bg-green-400/15 text-green-200 ring-1 ring-green-300/30"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  Improved Resume {resumeContent ? "✓" : ""}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeGeneration === "cover-letter"}
                  onClick={() => setActiveGeneration("cover-letter")}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold transition sm:text-base ${
                    activeGeneration === "cover-letter"
                      ? "bg-cyan-400/15 text-cyan-200 ring-1 ring-cyan-300/30"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  Cover Letter {coverLetter.content ? "✓" : ""}
                </button>
              </div>

              {activeGeneration === "resume" ? (
              <section role="tabpanel" className="mt-6 w-full min-w-0">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-green-200">
                    AI-improved resume
                  </h3>
                  <p className="mt-1 text-sm text-white/50">
                    {resumeContent ? "Generated from your uploaded resume" : "Generate an ATS-focused version"}
                  </p>
                  <div className="mx-auto mt-5 flex w-full flex-wrap items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        resume.generate(
                          {
                            resume_text: resumeContent || textPreview,
                            job_description: jobDescription,
                            improvement_instructions: improvementInstructions,
                          },
                          "rewrite",
                          "Could not generate an improved resume."
                        )
                      }
                      disabled={resume.loading || !(resumeContent || textPreview)}
                      className="inline-flex min-h-[52px] min-w-[220px] max-w-full items-center justify-center whitespace-normal rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 text-center text-base font-semibold leading-tight text-white shadow-lg shadow-green-950/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {resume.loading
                        ? `Improving... ${resume.progress}%`
                        : resumeContent
                          ? "Regenerate resume"
                          : "Generate resume"}
                    </button>
                    {resumeContent && !resume.loading && (
                      <button
                        type="button"
                        aria-label="Download improved resume"
                        title="Download improved resume"
                        onClick={() =>
                          downloadDocxFromApi(
                            "/api/export-resume",
                            { ...candidateInfo, resume_text: resumeContent },
                            "CareerOps_Resume.docx"
                          )
                        }
                        className="inline-flex min-h-[52px] min-w-[144px] items-center justify-center gap-2 whitespace-nowrap rounded-full border border-green-200/25 bg-white/[0.06] px-5 py-3 text-base font-semibold text-green-100 transition hover:border-green-200/50 hover:bg-green-300/10"
                      >
                        <DownloadIcon />
                        Download
                      </button>
                    )}
                  </div>
                </div>

                {resume.error && (
                  <p role="alert" className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
                    {resume.error}
                  </p>
                )}
                {resume.loading ? (
                  <GenerationProgress
                    label="Optimizing your resume..."
                    percent={resume.progress}
                    colorFrom="from-green-400"
                    colorTo="to-emerald-500"
                    ringColor="border-green-500/20 border-t-green-400"
                    textColor="text-green-300"
                  />
                ) : resumeContent ? (
                  <ResumePreview text={resumeContent} />
                  ) : (
                  <p className="mt-6 rounded-xl border border-white/10 bg-black/20 p-6 text-center text-white/55">
                    Generate an improved resume to preview and download it here.
                  </p>
                )}

              </section>
            ) : (
              <section role="tabpanel" className="mt-6 w-full min-w-0">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-cyan-200">
                    Job-tailored cover letter
                  </h3>
                  <p className="mt-1 text-sm text-white/50">
                    {jobDescription
                      ? "Personalized to the job description you provided"
                      : "A job description is required to tailor this letter"}
                  </p>
                  <div className="mx-auto mt-5 flex w-full flex-wrap items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        coverLetter.generate(
                          {
                            resume_text: resumeContent || textPreview,
                            job_description: jobDescription,
                            improvement_instructions: improvementInstructions,
                          },
                          "cover_letter",
                          "Could not generate a cover letter."
                        )
                      }
                      disabled={coverLetter.loading || !jobDescription.trim() || !(resumeContent || textPreview)}
                      className="inline-flex min-h-[52px] min-w-[220px] max-w-full items-center justify-center whitespace-normal rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-center text-base font-semibold leading-tight text-white shadow-lg shadow-cyan-950/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {coverLetter.loading
                        ? `Writing... ${coverLetter.progress}%`
                        : coverLetter.content
                          ? "Regenerate cover letter"
                          : "Generate cover letter"}
                    </button>
                    {coverLetter.content && !coverLetter.loading && (
                      <button
                        type="button"
                        aria-label="Download cover letter"
                        title="Download cover letter"
                        onClick={() =>
                          downloadDocxFromApi(
                            "/api/export-cover-letter",
                            { ...candidateInfo, cover_letter_text: coverLetter.content },
                            "CareerOps_Cover_Letter.docx"
                          )
                        }
                        className="inline-flex min-h-[52px] min-w-[144px] items-center justify-center gap-2 whitespace-nowrap rounded-full border border-cyan-200/25 bg-white/[0.06] px-5 py-3 text-base font-semibold text-cyan-100 transition hover:border-cyan-200/50 hover:bg-cyan-300/10"
                      >
                        <DownloadIcon />
                        Download
                      </button>
                    )}
                  </div>
                </div>

                {coverLetter.error && (
                  <p role="alert" className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
                    {coverLetter.error}
                  </p>
                )}
                {coverLetter.loading ? (
                  <GenerationProgress
                    label="Writing your tailored cover letter..."
                    percent={coverLetter.progress}
                    colorFrom="from-cyan-400"
                    colorTo="to-blue-500"
                    ringColor="border-cyan-500/20 border-t-cyan-400"
                    textColor="text-cyan-300"
                  />
                ) : coverLetter.content ? (
                  <ScrollBox maxHeight="520px" className="bg-black/30">
                    {coverLetter.content}
                  </ScrollBox>
                ) : (
                  <p className="mt-6 rounded-xl border border-white/10 bg-black/20 p-6 text-center text-white/55">
                    Generate a tailored cover letter for your target role.
                  </p>
                )}

              </section>
              )}
            </div>
          </GlassCard>
        </div>

        <div className="mt-10 pb-10 text-center text-white/40">
          CareerOps v2 • AI Career Intelligence Platform
        </div>
      </PageContainer>
    </main>
  );
}

function DownloadIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className="h-4 w-4"
    >
      <path
        d="M10 2.75v9.5m0 0 3.5-3.5M10 12.25l-3.5-3.5M3.75 13.5v2A1.75 1.75 0 0 0 5.5 17.25h9a1.75 1.75 0 0 0 1.75-1.75v-2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}