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

  const recommendations =
    data?.ats?.recommendations || [];

    
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

            <p className="text-sm text-center text-white/50">
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

            <p className="text-sm text-center text-white/50">
              Job Match Score
            </p>

            <h2 className="mt-4 text-6xl font-bold text-cyan-400">
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

          {/* EXPERIENCE */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

            <p className="text-sm text-center text-white/50">
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
              <p className="text-sm text-white/50">
                Name
              </p>

              <p className="mt-2 text-lg text-white">
                {candidateName}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-center">
              <p className="text-sm text-white/50">
                Email
              </p>

              <p className="mt-2 text-lg text-white break-all">
                {candidateEmail}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-center">
              <p className="text-sm text-white/50">
                Location
              </p>

              <p className="mt-2 text-lg text-white">
                {candidateLocation}
              </p>
            </div>

          </div>

        </div>
        {/* SKILLS */}
        <div className="mt-14 w-full rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

          <h2 className="text-2xl text-center font-semibold">
            Extracted Skills
          </h2>

          <div className="mt-8 flex flex-wrap justify-center gap-4">

            {skills.map((skill) => (
              <div
                key={skill}
                className="
                  rounded-full
                  border
                  border-green-400/20
                  bg-green-400/5
                  px-5
                  py-3
                  text-sm
                  text-green-300
                  transition-all
                  duration-300
                  hover:scale-105
                  hover:border-green-400/50
                "
              >
                {skill}
              </div>
            ))}

          </div>

        </div>

        {/* AI RECOMMENDATIONS */}
        <div className="mt-14 w-full rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

          <h2 className="text-2xl text-center font-semibold">
            AI Recommendations
          </h2>

           <div className="mt-8 space-y-5">

            {recommendations.length > 0 ? (
              recommendations.map((recommendation: string) => (
                <div
                  key={recommendation}
                  className="
                    break-words
                    text-center
                    rounded-2xl
                    border
                    border-white/10
                    bg-black/20
                    p-5
                    text-white/80
                  "
                >
                  {recommendation}
                </div>
              ))
            ) : (
              <div
                className="
                  text-center
                  rounded-2xl
                  border
                  border-green-400/20
                  bg-green-400/5
                  p-5
                  text-green-300
                "
              >
                Resume looks well optimized for ATS systems.
              </div>
            )}

          </div> 
        </div>
      </div>
      </PageContainer>

    </main>
  );
}