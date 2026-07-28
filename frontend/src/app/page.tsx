"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/auth/token"; // correct path

export default function HomePage() {
const router = useRouter();
  return (
    <main className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-black text-white">

      {/* BACKGROUND */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#03110a] to-black" />
        <div className="ai-grid" />
        <div className="glow green top-[10%] left-[8%]" />
        <div className="glow blue top-[25%] right-[10%]" />
        <div className="glow purple bottom-[-120px] left-[25%]" />
        <div className="absolute left-[18%] top-0 h-full w-px bg-green-400/20 animate-pulse" />
        <div className="absolute right-[15%] top-0 h-full w-px bg-cyan-400/20 animate-pulse" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center">

        {/* Badge */}
        <div className="mb-8 inline-flex  px-5 py-2 text-sm text-green-300/80 backdrop-blur-sm">
          AI-Powered Career Intelligence
        </div>

        {/* Heading */}
        <h1 className="text-6xl font-extrabold tracking-tight sm:text-7xl md:text-8xl">
          CareerOps{" "}
          <span className="text-green-400 drop-shadow-[0_0_24px_rgba(74,222,128,0.9)]">
            AI
          </span>
        </h1>
        
        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60 sm:text-xl">
          Analyze resumes, discover skill gaps, and generate your
          personalized AI-driven career roadmap.
        </p>

        <div className="mt-16 flex flex-col items-center gap-5">

          <Link
            href="/register"
            className="
              rounded-full
              bg-gradient-to-r
              from-green-500
              to-emerald-600
              px-10
              py-4
              text-lg
              font-semibold
              text-white
              transition-all
              hover:scale-105
            "
          >
            Get Started Free
          </Link>

          {!isLoggedIn() && (
            <p className="text-white/60">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-green-400 hover:text-green-300"
              >
                Login
              </Link>
            </p>
          )}

        </div>
        


        {/* Footer */}
        <p className="mt-14 text-xs uppercase tracking-[0.35em] text-white/30">
          Cloud Native • AI Driven • DevOps Ready
        </p>

      </div>

    </main>
  );
}