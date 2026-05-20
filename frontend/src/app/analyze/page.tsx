"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import BackgroundEffects from "@/components/ui/BackgroundEffects";
import PageContainer from "@/components/ui/PageContainer";

const steps = [
  "Initializing AI Engine...",
  "Uploading Resume Data...",
  "Parsing Resume Structure...",
  "Extracting Skills...",
  "Analyzing Experience...",
  "Matching Job Requirements...",
  "Generating Career Insights...",
  "Building AI Recommendations...",
  "Finalizing Analysis...",
];

export default function AnalyzePage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (currentStep >= steps.length) {
      setTimeout(() => {
        router.push("/results");
      }, 1500);

      return;
    }

    const timeout = setTimeout(() => {
      setLogs((prev) => [...prev, steps[currentStep]]);
      setCurrentStep((prev) => prev + 1);
    }, 900);

    return () => clearTimeout(timeout);
  }, [currentStep, router]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">

      <BackgroundEffects />

      <PageContainer>

        {/* HEADER */}
        <div className="text-center">

          <div className="mb-8 inline-flex rounded-full border border-green-400/30 bg-green-400/5 px-5 py-2 text-sm text-green-300 backdrop-blur-sm">
            AI Processing Engine
          </div>

          <h1 className="text-6xl font-bold tracking-tight">
            Analyzing Resume
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
            Our AI system is extracting insights, matching skills,
            and generating your career analysis.
          </p>

        </div>

        {/* PROCESS CARD */}
        <div className="mt-14 w-full max-w-4xl rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur-xl">

          {/* TERMINAL HEADER */}
          <div className="mb-6 flex items-center gap-2 border-b border-white/10 pb-4">

            <div className="h-3 w-3 rounded-full bg-red-400" />

            <div className="h-3 w-3 rounded-full bg-yellow-400" />

            <div className="h-3 w-3 rounded-full bg-green-400" />

            <span className="ml-4 text-sm text-white/40">
              AI Inference Terminal
            </span>

          </div>

          {/* TERMINAL LOGS */}
          <div className="h-[350px] overflow-hidden rounded-2xl bg-black/60 p-6 font-mono text-sm">

            {logs.map((log, index) => (
              <div
                key={index}
                className="mb-4 flex items-center text-green-400 animate-pulse"
              >
                <span className="mr-3 text-green-500">
                  $
                </span>

                <span>{log}</span>
              </div>
            ))}

            {/* Blinking cursor */}
            <div className="flex items-center text-green-400">

              <span className="mr-3 text-green-500">
                $
              </span>

              <span className="h-5 w-3 animate-pulse bg-green-400" />

            </div>

          </div>

          {/* PROGRESS */}
          <div className="mt-8">

            <div className="mb-3 flex justify-between text-sm text-white/60">

              <span>AI Processing</span>

              <span>
                {Math.min(
                  Math.round((currentStep / steps.length) * 100),
                  100
                )}
                %
              </span>

            </div>

            <div className="h-3 overflow-hidden rounded-full bg-white/10">

              <div
                className="
                  h-full
                  rounded-full
                  bg-gradient-to-r
                  from-green-400
                  via-emerald-500
                  to-cyan-400
                  transition-all
                  duration-700
                "
                style={{
                  width: `${Math.min(
                    (currentStep / steps.length) * 100,
                    100
                  )}%`,
                }}
              />

            </div>

          </div>

          {/* AI STATUS */}
          <div className="mt-8 flex items-center justify-center gap-3 text-green-300">

            <div className="h-3 w-3 animate-pulse rounded-full bg-green-400" />

            <span className="text-sm tracking-wide">
              Neural Analysis Active
            </span>

          </div>

        </div>

      </PageContainer>

    </main>
  );
}