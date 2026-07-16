"use client";
import { API_BASE_URL } from "@/lib/api";
import { getResumeData } from "@/store/resumeStore";
import BackgroundEffects from "@/components/ui/BackgroundEffects";
import PageContainer from "@/components/ui/PageContainer";
import { useEffect, useRef, useState } from "react";

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
      className={`w-full rounded-3xl border ${borderClassName} ${bgClassName} p-8 backdrop-blur-xl ${className}`}
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

function useGeneratedContent(endpoint: string) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generate = async (
    body: Record<string, unknown>,
    resultKey: string,
    fallbackText: string
  ) => {
    setProgress(0);
    setLoading(true);

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      setProgress(100);
      setContent(result[resultKey] || fallbackText);
    } catch (error) {
      console.error(error);
      setContent(fallbackText);
    } finally {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setLoading(false);
    }
  };

  return { content, loading, progress, generate };
}

/* ------------------------------------------------------------------ */
/*  Download helpers                                                  */
/* ------------------------------------------------------------------ */

function downloadTextFile(text: string, filename: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function downloadDocxFromApi(
  endpoint: string,
  body: Record<string, unknown>,
  filename: string
) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
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
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    setData(getResumeData());
  }, []);

  const resume = useGeneratedContent("/api/rewrite-from-text");
  const coverLetter = useGeneratedContent("/api/cover-letter-from-text");

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading...
      </main>
    );
  }

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
  const semanticScore = data?.semantic_match?.semantic_match_score || 0;
  const careerInsights = data?.ai_recommendations || "";
  const atsAdvice = data?.ats_advice || {};
  const textPreview = data?.text_preview || "";
  const jobDescription = data?.job_description || "";

  const candidateInfo = { candidate_name: candidateName, email: candidateEmail, location: candidateLocation, skills };

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <BackgroundEffects />

      <PageContainer>
        <div className="flex w-full flex-col items-center">
          {/* HEADER */}
          <div className="text-center">
            <div className="mb-8 items-center justify-center rounded-full border border-green-400/30 bg-green-400/5 px-14 pt-3 pb-[14px] text-base text-green-300 backdrop-blur-sm">
              AI Analysis Complete
            </div>
            <h1 className="text-6xl font-bold tracking-tight">{candidateName}</h1>
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
              label="Semantic Match"
              value={`${semanticScore}%`}
              percent={semanticScore}
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

          {/* ACTIONS */}
          <div className="mt-10 flex justify-center gap-6">
            <button
              onClick={() =>
                resume.generate(
                  { resume_text: textPreview },
                  "rewrite",
                  "Failed to generate resume rewrite."
                )
              }
              disabled={resume.loading}
              className="rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-4 text-white font-semibold transition-all hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {resume.loading
                ? `Generating Resume... ${resume.progress}%`
                : "Generate Improved Resume"}
            </button>

            <button
              onClick={() =>
                coverLetter.generate(
                  { resume_text: textPreview, job_description: jobDescription },
                  "cover_letter",
                  "Failed to generate cover letter."
                )
              }
              disabled={coverLetter.loading}
              className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 text-white font-semibold transition-all hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {coverLetter.loading
                ? `Generating Cover Letter... ${coverLetter.progress}%`
                : "Generate Cover Letter"}
            </button>
          </div>

          {/* AI REWRITTEN RESUME */}
          {resume.loading ? (
            <GlassCard
              className="mt-14"
              title="AI Improving Resume"
              titleClassName="text-green-300"
              borderClassName="border-green-500/20"
              bgClassName="bg-green-500/5"
            >
              <GenerationProgress
                label="Optimizing ATS Score..."
                percent={resume.progress}
                colorFrom="from-green-400"
                colorTo="to-emerald-500"
                ringColor="border-green-500/20 border-t-green-400"
                textColor="text-green-300"
              />
            </GlassCard>
          ) : (
            resume.content && (
              <GlassCard
                className="mt-14"
                title="AI Improved Resume"
                titleClassName="text-green-300"
                borderClassName="border-green-500/20"
                bgClassName="bg-green-500/5"
              >
                <ScrollBox maxHeight="420px" className="bg-black/30">
                  {resume.content}
                </ScrollBox>
              </GlassCard>
            )
          )}

          {resume.content && !resume.loading && (
            <button
              onClick={() =>
                downloadDocxFromApi(
                  "/api/export-resume",
                  { ...candidateInfo, resume_text: resume.content },
                  "CareerOps_Resume.docx"
                )
              }
              className="mt-6 rounded-full bg-green-500 px-6 py-3 font-semibold text-white transition-all hover:scale-105"
            >
              Download DOCX Resume
            </button>
          )}

          {/* AI COVER LETTER */}
          {coverLetter.loading ? (
            <GlassCard
              className="mt-14"
              title="AI Generating Cover Letter"
              titleClassName="text-cyan-300"
              borderClassName="border-cyan-500/20"
              bgClassName="bg-cyan-500/5"
            >
              <GenerationProgress
                label="Writing Personalized Cover Letter..."
                percent={coverLetter.progress}
                colorFrom="from-cyan-400"
                colorTo="to-blue-500"
                ringColor="border-cyan-500/20 border-t-cyan-400"
                textColor="text-cyan-300"
              />
            </GlassCard>
          ) : (
            coverLetter.content && (
              <GlassCard
                className="mt-14"
                title="Generated Cover Letter"
                titleClassName="text-cyan-300"
                borderClassName="border-cyan-500/20"
                bgClassName="bg-cyan-500/5"
              >
                <ScrollBox maxHeight="420px" className="bg-black/30">
                  {coverLetter.content}
                </ScrollBox>
              </GlassCard>
            )
          )}

          {coverLetter.content && !coverLetter.loading && (
            <button
              onClick={() =>
                downloadDocxFromApi(
                  "/api/export-cover-letter",
                  { ...candidateInfo, cover_letter_text: coverLetter.content },
                  "CareerOps_Cover_Letter.docx"
                )
              }
              className="mt-6 rounded-full bg-cyan-500 px-6 py-3 font-semibold text-white transition-all hover:scale-105"
            >
              Download Cover Letter Docx
            </button>
          )}
        </div>

        <div className="mt-10 pb-10 text-center text-white/40">
          CareerOps v2 • AI Career Intelligence Platform
        </div>
      </PageContainer>
    </main>
  );
}