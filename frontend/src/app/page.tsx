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

        {/* BUTTON */}
       <div className="mt-12 flex justify-center">
        <Link
          href={isLoggedIn() ? "/upload" : "/login"}
          className="
            group
            inline-flex
            items-center
            justify-center
            gap-4
            rounded-full
            bg-gradient-to-r
            from-green-500
            to-emerald-600
            px-8
            py-4
            text-lg
            font-semibold
            text-white
            shadow-[0_0_45px_rgba(34,197,94,0.35)]
            transition-all
            duration-300
            hover:scale-105
            hover:shadow-[0_0_65px_rgba(34,197,94,0.55)]
          "
        >

          {/* Icon */}
          <span
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              bg-white/10
              transition-all
              duration-300
              group-hover:bg-white/20
            "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 16V4m0 0l-4 4m4-4l4 4M4 16.5v1.125C4 18.936 5.064 20 6.375 20h11.25C18.936 20 20 18.936 20 17.625V16.5"
              />
            </svg>
          </span>

          {/* Text */}
          <span>
            Upload Resume
          </span>

        </Link>
        </div>


        {/* Footer */}
        <p className="mt-14 text-xs uppercase tracking-[0.35em] text-white/30">
          Cloud Native • AI Driven • DevOps Ready
        </p>

      </div>

    </main>
  );
}