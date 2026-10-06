type BackgroundVariant =
  | "home"
  | "auth"
  | "dashboard"
  | "upload"
  | "analysis"
  | "results"
  | "history";

const variantStyles: Record<
  BackgroundVariant,
  { wash: string; orbA: string; orbB: string; orbC: string; line: string }
> = {
  home: {
    wash: "from-[#020806] via-[#03150d] to-[#03090b]",
    orbA: "bg-emerald-500/35",
    orbB: "bg-cyan-400/30",
    orbC: "bg-violet-500/20",
    line: "border-emerald-300/20",
  },
  auth: {
    wash: "from-[#07050b] via-[#10101a] to-[#03100c]",
    orbA: "bg-violet-500/35",
    orbB: "bg-emerald-400/30",
    orbC: "bg-cyan-400/20",
    line: "border-violet-300/20",
  },
  dashboard: {
    wash: "from-[#020807] via-[#061711] to-[#06101a]",
    orbA: "bg-green-400/35",
    orbB: "bg-cyan-400/30",
    orbC: "bg-blue-500/20",
    line: "border-cyan-300/20",
  },
  upload: {
    wash: "from-[#030a09] via-[#071611] to-[#101009]",
    orbA: "bg-teal-400/35",
    orbB: "bg-green-400/30",
    orbC: "bg-amber-400/20",
    line: "border-teal-300/20",
  },
  analysis: {
    wash: "from-[#070611] via-[#07131a] to-[#03110b]",
    orbA: "bg-violet-500/35",
    orbB: "bg-cyan-400/30",
    orbC: "bg-green-400/20",
    line: "border-violet-300/20",
  },
  results: {
    wash: "from-[#030a08] via-[#071510] to-[#08101a]",
    orbA: "bg-emerald-400/35",
    orbB: "bg-blue-400/30",
    orbC: "bg-amber-400/20",
    line: "border-emerald-300/20",
  },
  history: {
    wash: "from-[#030810] via-[#07121a] to-[#0b0712]",
    orbA: "bg-cyan-400/35",
    orbB: "bg-violet-500/30",
    orbC: "bg-green-400/20",
    line: "border-cyan-300/20",
  },
};

export default function BackgroundEffects({
  variant = "dashboard",
}: {
  variant?: BackgroundVariant;
}) {
  const styles = variantStyles[variant];

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${styles.wash}`} />
      <div className="careerops-scene-grid absolute -inset-[50%] opacity-40 [background-image:linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_75%)]" />
      <div className={`careerops-scene-glow careerops-scene-glow-a absolute -left-[18vw] top-[4vh] h-[68vh] w-[68vh] min-h-[28rem] min-w-[28rem] rounded-full ${styles.orbA} blur-[110px]`} />
      <div className={`careerops-scene-glow careerops-scene-glow-b absolute -right-[20vw] top-[22vh] h-[64vh] w-[64vh] min-h-[26rem] min-w-[26rem] rounded-full ${styles.orbB} blur-[110px]`} />
      <div className={`careerops-scene-glow careerops-scene-glow-c absolute bottom-[-48vh] left-[24vw] h-[76vh] w-[76vh] min-h-[30rem] min-w-[30rem] rounded-full ${styles.orbC} blur-[120px]`} />
      <div className="careerops-scene-sweep absolute -inset-x-1/2 top-[-40%] h-[180%] w-[200%] bg-[linear-gradient(115deg,transparent_35%,rgba(110,231,183,0.035)_48%,rgba(103,232,249,0.07)_50%,rgba(196,181,253,0.035)_52%,transparent_65%)]" />

      <div className={`careerops-scene-orbit careerops-scene-orbit-a absolute left-[8%] top-[12%] h-[76%] w-[84%] rounded-[48%] border ${styles.line} opacity-40`} />
      <div className={`careerops-scene-orbit careerops-scene-orbit-b absolute left-[18%] top-[20%] h-[58%] w-[64%] rounded-[50%] border ${styles.line} opacity-30`} />
      <div className="absolute left-0 top-[42%] h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute left-[14%] top-0 h-full w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
      <div className="absolute right-[17%] top-0 h-full w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

      <div className="careerops-scene-node careerops-scene-node-a absolute left-[20%] top-[29%] h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.8)]" />
      <div className="careerops-scene-node careerops-scene-node-b absolute right-[22%] top-[55%] h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.8)]" />
      <div className="careerops-scene-node careerops-scene-node-c absolute left-[42%] bottom-[18%] h-1.5 w-1.5 rounded-full bg-violet-300 shadow-[0_0_16px_rgba(196,181,253,0.7)]" />
      <div className="careerops-scene-diamond absolute left-[16%] top-[28%] h-8 w-8 rounded-lg border border-emerald-300/20" />
      <div className="careerops-scene-node careerops-scene-node-b absolute right-[17%] bottom-[19%] h-12 w-12 rounded-full border border-cyan-300/20" />
    </div>
  );
}
