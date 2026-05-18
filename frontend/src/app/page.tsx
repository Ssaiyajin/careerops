import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-black text-white">

      {/* BACKGROUND */}
      <div className="absolute inset-0">

        {/* Main gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#03110a] to-black" />

        {/* Grid */}
        <div className="ai-grid" />

        {/* Glow effects */}
        <div className="glow green top-[10%] left-[8%]" />

        <div className="glow blue top-[25%] right-[10%]" />

        <div className="glow purple bottom-[-120px] left-[25%]" />

        {/* Vertical animated lines */}
        <div className="absolute left-[18%] top-0 h-full w-px bg-green-400/20 animate-pulse" />

        <div className="absolute right-[15%] top-0 h-full w-px bg-cyan-400/20 animate-pulse" />

      </div>

      {/* CONTENT */}
      <div className="relative z-10 px-6 text-center">

        {/* Badge */}
        <div className="mb-8 inline-flex rounded-full border border-green-400/30 bg-green-400/5 px-5 py-2 text-sm text-green-300 backdrop-blur-sm">
          AI-Powered Career Intelligence
        </div>

        {/* Heading */}
        <h1 className="text-6xl font-extrabold tracking-tight sm:text-7xl md:text-8xl">
          CareerOps{" "}
          <span className="text-green-400 drop-shadow-[0_0_18px_rgba(74,222,128,0.8)]">
            AI
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-white/70 sm:text-xl">
          Analyze resumes, discover skill gaps, and generate your
          personalized AI-driven career roadmap.
        </p>

        {/* BUTTON */}
        <div className="mt-14 flex justify-center">

          <Link
            href="/upload"
            className="group relative inline-flex items-center gap-4 overflow-hidden rounded-2xl border border-green-300/40 bg-gradient-to-b from-lime-400 to-green-500 px-12 py-5 text-xl font-bold text-black shadow-[0_0_40px_rgba(74,222,128,0.45)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_70px_rgba(74,222,128,0.7)]"
          >

            {/* Glow overlay */}
            <span className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            

            {/* Text */}
            <span className="relative z-10">
              Upload Resume
            </span>



          </Link>

        </div>

        {/* Footer */}
        <p className="mt-14 text-xs uppercase tracking-[0.35em] text-white/40">
          Cloud Native • AI Driven • DevOps Ready
        </p>

      </div>

    </main>
  );
}