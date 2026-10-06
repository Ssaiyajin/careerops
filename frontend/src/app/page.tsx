"use client";

import Link from "next/link";
import BackgroundEffects from "@/components/ui/BackgroundEffects";

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-black text-white">
      <BackgroundEffects variant="home" />

      <header className="relative z-20 flex w-full items-center justify-between px-6 py-5 sm:px-10 lg:px-16">
        <Link href="/" className="text-lg font-bold tracking-tight sm:text-xl">
          CareerOps <span className="text-green-400">AI</span>
        </Link>
        <nav aria-label="Main navigation" className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-white/75 transition hover:text-green-300"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-full border border-green-400/40 bg-green-400/10 px-4 py-2 text-sm font-semibold text-green-200 transition hover:border-green-300/70 hover:bg-green-400/20"
          >
            Get started
          </Link>
        </nav>
      </header>

      <section className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-44 pt-12 text-center sm:pb-52 sm:pt-16">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-400/20 bg-green-400/[0.06] px-4 py-2 text-xs font-medium tracking-wide text-green-200/90 sm:text-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.9)]" />
          AI-powered career intelligence
        </div>

        <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl md:text-8xl">
          CareerOps{" "}
          <span className="text-green-400 drop-shadow-[0_0_24px_rgba(74,222,128,0.55)]">
            AI
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/65 sm:text-xl">
          Where artificial intelligence meets IT to turn your experience into
          your next opportunity.
        </p>

        <div className="mt-9 flex flex-col items-center gap-4">
          <Link
            href="/register"
            className="rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-3.5 text-base font-semibold text-white shadow-[0_0_32px_rgba(34,197,94,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_0_42px_rgba(34,197,94,0.35)] sm:px-10 sm:py-4 sm:text-lg"
          >
            Build your career roadmap
          </Link>
          <p className="text-sm text-white/55">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-green-300 hover:text-green-200">
              Log in
            </Link>
          </p>
        </div>

        <p className="mt-10 text-[10px] uppercase tracking-[0.28em] text-white/35 sm:text-xs sm:tracking-[0.35em]">
          Cloud native <span className="px-2 text-green-500/70">•</span> AI driven
          <span className="px-2 text-green-500/70">•</span> DevOps ready
        </p>
      </section>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-52 overflow-hidden sm:h-60"
      >
        <svg
          viewBox="0 0 1200 260"
          preserveAspectRatio="xMidYMax meet"
          className="absolute bottom-0 left-1/2 h-full w-[min(1200px,125vw)] -translate-x-1/2 opacity-75"
          fill="none"
        >
          <defs>
            <linearGradient id="connection-line" x1="160" y1="130" x2="1040" y2="130" gradientUnits="userSpaceOnUse">
              <stop stopColor="#22c55e" stopOpacity=".05" />
              <stop offset=".5" stopColor="#4ade80" stopOpacity=".65" />
              <stop offset="1" stopColor="#34d399" stopOpacity=".08" />
            </linearGradient>
            <radialGradient id="connection-glow">
              <stop stopColor="#4ade80" stopOpacity=".2" />
              <stop offset="1" stopColor="#4ade80" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="600" cy="220" rx="430" ry="115" fill="url(#connection-glow)" />
          <path d="M160 190H330L410 125H790L870 190H1040" stroke="url(#connection-line)" strokeWidth="1.5" />
          <path d="M330 190V220M410 125V80M790 125V80M870 190V220" stroke="#4ade80" strokeOpacity=".2" />
          <path d="M160 190V220M1040 190V220" stroke="#34d399" strokeOpacity=".18" />
          <path d="M490 125V165H710V125" stroke="#4ade80" strokeOpacity=".22" />
          <circle cx="330" cy="190" r="4" fill="#4ade80" />
          <circle cx="410" cy="125" r="4" fill="#4ade80" />
          <circle cx="790" cy="125" r="4" fill="#4ade80" />
          <circle cx="870" cy="190" r="4" fill="#34d399" />

          <rect x="86" y="162" width="148" height="56" rx="14" fill="#04140b" stroke="#22c55e" strokeOpacity=".38" />
          <circle cx="111" cy="190" r="12" fill="#22c55e" fillOpacity=".12" stroke="#4ade80" strokeOpacity=".7" />
          <path d="M106 190h10M111 185v10" stroke="#86efac" strokeWidth="1.5" strokeLinecap="round" />
          <text x="132" y="194" fill="#bbf7d0" fontSize="13" fontFamily="Arial, sans-serif" letterSpacing="2">AI</text>

          <rect x="966" y="162" width="148" height="56" rx="14" fill="#04140b" stroke="#34d399" strokeOpacity=".38" />
          <path d="m990 185-6 5 6 5m9 0 6-10" stroke="#6ee7b7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <text x="1018" y="194" fill="#d1fae5" fontSize="13" fontFamily="Arial, sans-serif" letterSpacing="2">IT</text>

          <rect x="530" y="92" width="140" height="66" rx="18" fill="#04140b" stroke="#4ade80" strokeOpacity=".52" />
          <path d="M563 119h18m-9-9v18m29-9h18" stroke="#86efac" strokeOpacity=".85" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="600" cy="125" r="44" stroke="#4ade80" strokeOpacity=".14" />
          <text x="625" y="130" fill="#dcfce7" fontSize="11" fontFamily="Arial, sans-serif" letterSpacing="1.5">CAREER</text>

          <circle cx="256" cy="190" r="2" fill="#86efac">
            <animate attributeName="cx" values="256;330;410;600;790;870;944" dur="8s" repeatCount="indefinite" />
            <animate attributeName="cy" values="190;190;125;125;125;190;190" dur="8s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>
    </main>
  );
}
