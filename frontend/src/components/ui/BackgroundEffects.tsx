type BackgroundVariant =
  | "home"
  | "login"
  | "register"
  | "forgot"
  | "reset"
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
  login: {
    wash: "from-[#07050b] via-[#10101a] to-[#03100c]",
    orbA: "bg-violet-500/35",
    orbB: "bg-emerald-400/30",
    orbC: "bg-cyan-400/20",
    line: "border-violet-300/20",
  },
  register: {
    wash: "from-[#080611] via-[#101018] to-[#03120e]",
    orbA: "bg-fuchsia-500/30",
    orbB: "bg-emerald-400/30",
    orbC: "bg-cyan-400/20",
    line: "border-fuchsia-300/20",
  },
  forgot: {
    wash: "from-[#080610] via-[#10101b] to-[#061011]",
    orbA: "bg-indigo-500/35",
    orbB: "bg-cyan-400/30",
    orbC: "bg-emerald-400/20",
    line: "border-indigo-300/20",
  },
  reset: {
    wash: "from-[#07050b] via-[#10101a] to-[#03100c]",
    orbA: "bg-cyan-500/30",
    orbB: "bg-emerald-400/30",
    orbC: "bg-violet-500/20",
    line: "border-cyan-300/20",
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
    <div
      aria-hidden="true"
      data-scene={variant}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${styles.wash}`} />
      <div className="careerops-scene-grid absolute -inset-[50%] opacity-40 [background-image:linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_75%)]" />
      <div className={`careerops-scene-glow careerops-scene-glow-a absolute -left-[18vw] top-[4vh] h-[68vh] w-[68vh] min-h-[28rem] min-w-[28rem] rounded-full ${styles.orbA} blur-[110px]`} />
      <div className={`careerops-scene-glow careerops-scene-glow-b absolute -right-[20vw] top-[22vh] h-[64vh] w-[64vh] min-h-[26rem] min-w-[26rem] rounded-full ${styles.orbB} blur-[110px]`} />
      <div className={`careerops-scene-glow careerops-scene-glow-c absolute bottom-[-48vh] left-[24vw] h-[76vh] w-[76vh] min-h-[30rem] min-w-[30rem] rounded-full ${styles.orbC} blur-[120px]`} />
      <div className="careerops-scene-sweep absolute -inset-x-1/2 top-[-40%] h-[180%] w-[200%] bg-[linear-gradient(115deg,transparent_35%,rgba(110,231,183,0.035)_48%,rgba(103,232,249,0.07)_50%,rgba(196,181,253,0.035)_52%,transparent_65%)]" />

      <div className={`careerops-scene-orbit careerops-scene-orbit-a absolute left-[8%] top-[12%] h-[76%] w-[84%] rounded-[48%] border ${styles.line} opacity-40`} />
      <div className={`careerops-scene-orbit careerops-scene-orbit-b absolute left-[18%] top-[20%] h-[58%] w-[64%] rounded-[50%] border ${styles.line} opacity-30`} />
      <svg
        viewBox="0 0 800 500"
        className="careerops-scene-art absolute left-1/2 top-1/2 h-[min(72vh,42rem)] w-[min(88vw,70rem)] -translate-x-1/2 -translate-y-1/2 opacity-30"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        {variant === "home" && (
          <g className="text-emerald-200">
            <path d="M120 310 270 210 400 270 540 160 680 250M270 210 300 360 480 350 540 160" />
            <circle cx="120" cy="310" r="28" /><circle cx="270" cy="210" r="38" />
            <circle cx="400" cy="270" r="58" /><circle cx="540" cy="160" r="36" />
            <circle cx="680" cy="250" r="28" /><circle cx="300" cy="360" r="20" />
            <circle cx="480" cy="350" r="24" />
            <text x="370" y="278" fill="currentColor" stroke="none" fontSize="20" textAnchor="middle">AI × IT</text>
          </g>
        )}
        {variant === "login" && (
          <g className="text-violet-200">
            <rect x="285" y="105" width="230" height="290" rx="28" />
            <circle cx="400" cy="188" r="36" />
            <path d="M333 282c12-39 42-58 67-58s55 19 67 58M340 323h120M350 355h100" />
            <circle cx="492" cy="342" r="52" className="careerops-scene-art-ring" />
            <path d="m480 342 9 9 17-20" />
          </g>
        )}
        {variant === "register" && (
          <g className="text-fuchsia-200">
            <path d="M180 340 400 160 620 340M180 340h440" />
            <circle cx="180" cy="340" r="62" /><circle cx="400" cy="160" r="78" />
            <circle cx="620" cy="340" r="62" />
            <circle cx="180" cy="322" r="17" /><path d="M148 366c7-23 21-34 32-34s25 11 32 34" />
            <circle cx="400" cy="138" r="21" /><path d="M360 192c8-27 24-40 40-40s32 13 40 40" />
            <circle cx="620" cy="322" r="17" /><path d="M588 366c7-23 21-34 32-34s25 11 32 34" />
          </g>
        )}
        {variant === "forgot" && (
          <g className="text-indigo-200">
            <rect x="300" y="220" width="200" height="155" rx="28" />
            <path d="M340 220v-52a60 60 0 0 1 120 0v52M400 276v42" />
            <circle cx="400" cy="272" r="13" />
            <circle cx="400" cy="270" r="160" className="careerops-scene-art-ring" />
          </g>
        )}
        {variant === "reset" && (
          <g className="text-cyan-200">
            <circle cx="350" cy="250" r="105" />
            <circle cx="350" cy="250" r="45" />
            <path d="M455 250h170v42h-48v44h-44v-44h-78" />
            <circle cx="350" cy="250" r="165" className="careerops-scene-art-ring" />
          </g>
        )}
        {variant === "dashboard" && (
          <g className="text-cyan-200 careerops-scene-chart">
            <rect x="165" y="120" width="470" height="270" rx="25" />
            <path d="M205 335h390M230 315V275h62v40M330 315V230h62v85M430 315V185h62v130M530 315V250h42v65" />
            <circle cx="550" cy="175" r="8" />
          </g>
        )}
        {variant === "upload" && (
          <g className="text-teal-200">
            <path d="M300 100h150l80 80v230H300zM450 100v85h80" />
            <path d="M400 320V220m0 0-42 42m42-42 42 42M350 350h100" />
            <path d="M260 345h-45v-65M540 345h45v-65" />
            <rect className="careerops-scene-scan" x="315" y="205" width="200" height="3" rx="1.5" fill="currentColor" stroke="none" />
          </g>
        )}
        {variant === "analysis" && (
          <g className="text-violet-200">
            <circle cx="400" cy="250" r="55" />
            <circle cx="400" cy="250" r="115" className="careerops-scene-art-ring careerops-scene-spin-a" />
            <circle cx="400" cy="250" r="185" className="careerops-scene-art-ring careerops-scene-spin-b" />
            <path d="m400 215 10 25 26 2-20 16 7 26-23-14-23 14 7-26-20-16 26-2z" />
            <circle cx="400" cy="65" r="9" /><circle cx="585" cy="250" r="9" />
          </g>
        )}
        {variant === "results" && (
          <g className="text-emerald-200 careerops-scene-results-chart">
            <path d="M145 365h510M190 340V250h70v90M300 340V190h70v150M410 340V120h70v220M520 340V220h70v120" />
            <path d="m195 220 120-78 105 34 145-95" />
            <circle cx="195" cy="220" r="8" /><circle cx="315" cy="142" r="8" />
            <circle cx="420" cy="176" r="8" /><circle cx="565" cy="81" r="8" />
          </g>
        )}
        {variant === "history" && (
          <g className="text-cyan-200">
            <path d="M400 85v330M400 130h145M400 250h-145M400 370h145" />
            <circle cx="400" cy="130" r="25" className="careerops-scene-timeline-node" />
            <circle cx="400" cy="250" r="25" className="careerops-scene-timeline-node" />
            <circle cx="400" cy="370" r="25" className="careerops-scene-timeline-node" />
            <rect x="545" y="102" width="135" height="56" rx="15" />
            <rect x="120" y="222" width="135" height="56" rx="15" />
            <rect x="545" y="342" width="135" height="56" rx="15" />
          </g>
        )}
      </svg>
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
