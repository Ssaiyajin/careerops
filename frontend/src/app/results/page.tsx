"use client";

import { getResumeData } from "@/store/resumeStore";
import BackgroundEffects from "@/components/ui/BackgroundEffects";
import PageContainer from "@/components/ui/PageContainer";
import { useEffect, useState } from "react";



export default function ResultsPage() {
  const [data, setData] = useState<any>(null);

    useEffect(() => {
      const storedData = getResumeData();
      setData(storedData);
    }, []);

  const skills = data?.skills || [];

  const entities = data?.entities;
  
  const candidateName =
    data?.candidate_name || "Unknown Candidate";

  const candidateEmail =
    entities?.emails?.[0] || "No Email Found";

  const candidateLocation =
    entities?.locations?.[0] || "Unknown Location";

  const atsScore =
    data?.ats?.ats_score || 0;

  const experienceLevel =
    data?.experience_level || "Unknown";

  const matchedSkills =
  data?.job_match?.matched_skills || [];

  const missingSkills =
    data?.job_match?.missing_skills || [];

  const semanticScore =
    data?.semantic_match?.semantic_match_score || 0;

  const aiRecommendations =
    data?.ai_recommendations || "";

  const textPreview =
    data?.text_preview || "";
    
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
        {/* HEADER */}
        <div className="text-center">

          <div className="mb-8  items-center justify-center rounded-full border border-green-400/30 bg-green-400/5 px-14 pt-3 pb-[14px] text-base text-green-300 backdrop-blur-sm">
            AI Analysis Complete
          </div>

          <h1 className="text-6xl font-bold tracking-tight">
            {candidateName}
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
            AI successfully analyzed your resume and extracted
            skills, entities, and career insights dynamically.
          </p>

        </div>

        {/* DASHBOARD */}
        <div className="mt-16 grid w-full grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">

          {/* ATS SCORE */}
          <div className="overflow-hidden break-words rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

            <p className="text-base text-center text-white/50">
              ATS Compatibility
            </p>

            <h2 className="mt-4 text-6xl text-center font-bold text-green-400">
              {atsScore}%
            </h2>

            <div
              className="
                h-3
                rounded-full
                bg-gradient-to-r
                from-green-400
                to-emerald-500
                transition-all
                duration-500
              "
              style={{
                width: `${atsScore}%`,
              }}
            />
          </div>

          {/* MATCH SCORE */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

            <p className="text-base text-center text-white/50">
              Job Match Score
            </p>

            <h2 className="mt-4 text-6xl text-center font-bold text-cyan-400">
              {data?.job_match?.match_score || 0}%
            </h2>

            <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">

              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                style={{
                  width: `${data?.job_match?.match_score || 0}%`,
                }}
              />
            </div>

          </div>

          {/* SEMANTIC MATCH */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

            <p className="text-base text-center text-white/50">
              Semantic Match
            </p>

            <h2 className="mt-4 text-6xl text-center font-bold text-yellow-400">
              {semanticScore}%
            </h2>

            <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"
                style={{
                  width: `${semanticScore}%`,
                }}
              />
            </div>

          </div>

          {/* EXPERIENCE */}
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

        {/* USER INFO */}
        <div className="mt-10 w-full rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

          <h2 className="text-2xl text-center font-semibold">
            Candidate Information
          </h2>

          <div className="mt-8 grid gap-6 md:grid-cols-3">

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-center">
              <p className="text-base text-white/50">
                Name
              </p>

              <p className="mt-2 text-lg text-white">
                {candidateName}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-center">
              <p className="text-base text-white/50">
                Email
              </p>

              <p className="mt-2 text-lg text-white break-all">
                {candidateEmail}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-center">
              <p className="text-base text-white/50">
                Location
              </p>

              <p className="mt-2 text-lg text-white">
                {candidateLocation}
              </p>
            </div>

          </div>

        </div>
        {/* SKILLS */}
        {/* EXTRACTED SKILLS */}
          <div className="mt-14 w-full rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

            <h2 className="text-2xl text-center font-semibold">
              Extracted Skills
            </h2>

            <div className="mt-8 flex flex-wrap justify-center gap-4">

              {skills.map((skill: string) => (
                <div
                  key={skill}
                  className="
                    rounded-full
                    border
                    border-green-400/20
                    bg-green-400/5
                    px-5
                    py-3
                    text-base
                    text-green-300
                  "
                >
                  {skill}
                </div>
              ))}

            </div>

          </div>

          {/* MATCHED SKILLS */}
          <div className="mt-14 w-full rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-8 backdrop-blur-xl">

            <h2 className="text-2xl text-center font-semibold text-cyan-300">
              Matched Skills
            </h2>

            <div className="mt-8 flex flex-wrap justify-center gap-4">

              {matchedSkills.map((skill: string) => (
                <div
                  key={skill}
                  className="
                    rounded-full
                    border
                    border-cyan-400/20
                    bg-cyan-400/5
                    px-5
                    py-3
                    text-base
                    text-cyan-300
                  "
                >
                  {skill}
                </div>
              ))}

            </div>

          </div>

          {/* MISSING SKILLS */}
          <div className="mt-14 w-full rounded-3xl border border-red-500/20 bg-red-500/5 p-8 backdrop-blur-xl">

            <h2 className="text-2xl text-center font-semibold text-red-300">
              Missing Skills
            </h2>

            {missingSkills.length > 0 ? (

              <div className="mt-8 flex flex-wrap justify-center gap-4">

                {missingSkills.map((skill: string) => (
                  <div
                    key={skill}
                    className="
                      rounded-full
                      border
                      border-red-400/20
                      bg-red-400/5
                      px-5
                      py-3
                      text-base
                      text-red-300
                    "
                  >
                    {skill}
                  </div>
                ))}

              </div>

            ) : (

              <p className="mt-6 text-center text-green-300">
                No missing skills detected.
              </p>

            )}

          </div>

        {/* AI CAREER ANALYSIS */}
          <div className="mt-14 w-full rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

            <h2 className="text-2xl text-center font-semibold">
              AI Career Analysis
            </h2>

            <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-6">

              <pre className="whitespace-pre-wrap text-white/80">
                {aiRecommendations}
              </pre>

            </div>

          </div>

         {/* RESUME PREVIEW */}
          <div className="mt-14 w-full rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

            <h2 className="text-2xl text-center font-semibold">
              Resume Preview
            </h2>

            <p className="mt-2 text-center text-white/50">
              First extracted text from uploaded PDF
            </p>

            <div className="mt-6 max-h-[300px] overflow-y-auto rounded-2xl border border-white/10 bg-black/30 p-6">

              <pre className="whitespace-pre-wrap break-words text-base text-white/70">
                {data?.text_preview || "No preview available"}
              </pre>

            </div>

          </div>
          {/* RESUME SECTIONS */}
          <div className="mt-14 w-full rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

            <h2 className="text-2xl text-center font-semibold">
              Resume Overview
            </h2>

            <div className="mt-6 grid gap-6 md:grid-cols-2">

              <div className="rounded-2xl border text-center border-white/10 p-5">
                <p className="text-white/50 text-base">
                  Total Skills
                </p>

                <p className="mt-2 text-3xl font-bold text-green-400">
                  {skills.length}
                </p>
              </div>

              <div className="rounded-2xl text-center border border-white/10 p-5">
                <p className="text-white/50 text-base">
                  Experience Level
                </p>

                <p className="mt-2 text-3xl font-bold text-purple-400">
                  {experienceLevel}
                </p>
              </div>

            </div>

          </div>
          <div className="mt-10 pb-10 text-center text-white/40">
            CareerOps v1 • AI Career Intelligence Platform
          </div>
        
        </div>
      </PageContainer>

    </main>
  );
}