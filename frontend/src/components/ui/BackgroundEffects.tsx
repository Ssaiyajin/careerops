export default function BackgroundEffects() {
  return (
    <div className="absolute inset-0 overflow-hidden">

      {/* MAIN GRADIENT */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#04110b] to-black" />

      {/* GRID */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* GREEN ORB */}
      <div className="animate-float absolute left-[-120px] top-[-100px] h-[420px] w-[420px] rounded-full bg-green-500/20 blur-[120px]" />

      {/* CYAN ORB */}
      <div className="animate-float absolute right-[-120px] top-[20%] h-[360px] w-[360px] rounded-full bg-cyan-500/20 blur-[120px]" />

      {/* PURPLE ORB */}
      <div className="animate-float absolute bottom-[-180px] left-[25%] h-[420px] w-[420px] rounded-full bg-purple-500/20 blur-[140px]" />

      {/* SMALL ORB */}
      <div className="animate-float absolute bottom-[15%] right-[20%] h-[180px] w-[180px] rounded-full bg-emerald-400/20 blur-[100px]" />

      {/* VERTICAL LINE 1 */}
      <div className="absolute left-[18%] top-0 h-full w-px bg-green-400/10" />

      {/* VERTICAL LINE 2 */}
      <div className="absolute right-[15%] top-0 h-full w-px bg-cyan-400/10" />

      {/* HORIZONTAL LIGHT */}
      <div className="absolute left-0 top-1/2 h-px w-full bg-gradient-to-r from-transparent via-green-400/20 to-transparent" />

    </div>
  );
}