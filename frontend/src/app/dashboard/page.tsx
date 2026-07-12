"use client";

import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">

      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#03110a] to-black" />
        <div className="ai-grid" />

        <div className="glow green top-[10%] left-[8%]" />
        <div className="glow blue top-[25%] right-[10%]" />
        <div className="glow purple bottom-[-120px] left-[25%]" />

        <div className="absolute left-[18%] top-0 h-full w-px bg-green-400/20 animate-pulse" />
        <div className="absolute right-[15%] top-0 h-full w-px bg-cyan-400/20 animate-pulse" />
      </div>

      {/* Content */}
      <div
        className="
          relative
          z-10
          flex
          min-h-screen
          flex-col
          items-center
          justify-center
          px-6
        "
      >
        {/* Badge */}
        <div className="inline-flex rounded-full border border-green-400/20 bg-green-400/5 px-5 py-2 text-sm text-green-300">
          Welcome Back
        </div>

        {/* Title */}
        <h1 className="mt-6 text-center text-6xl font-extrabold md:text-7xl">
          CareerOps{" "}
          <span className="text-green-400">
            Dashboard
          </span>
        </h1>

        <p className="mt-4 max-w-2xl text-center text-lg text-white/60">
          Manage resumes, track analyses, and improve your career profile.
        </p>

        {/* Cards */}
        <div
          className="
            mt-16
            grid
            w-full
            max-w-6xl
            gap-8
            md:grid-cols-2
          "
        >
          <Link
            href="/upload"
            className="
              group
              rounded-3xl
              border
              border-green-500/20
              bg-green-500/5
              p-8
              backdrop-blur-xl
              transition-all
              duration-300
              hover:scale-105
              hover:border-green-400/40
            "
          >
            <h2 className="text-2xl font-semibold text-center text-green-300">
              Upload Resume
            </h2>

            <p className="mt-4 text-center text-white/60">
              Analyze a new resume against a job description.
            </p>
          </Link>

          <Link
            href="/history"
            className="
              group
              rounded-3xl
              border
              border-cyan-500/20
              bg-cyan-500/5
              p-8
              backdrop-blur-xl
              transition-all
              duration-300
              hover:scale-105
              hover:border-cyan-400/40
            "
          >
            <h2 className="text-2xl font-semibold text-center text-cyan-300">
              Analysis History
            </h2>

            <p className="mt-4 text-center text-white/60">
              View previous resume analyses.
            </p>
          </Link>

          
        </div>
      </div>
    </main>
  );
}