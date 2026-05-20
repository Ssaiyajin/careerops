export default function BackgroundEffects() {
  return (
    <div className="absolute inset-0 overflow-hidden">

      {/* MAIN GRADIENT */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#03110a] to-black" />

      {/* GRID */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* LARGE GLOW ORB 1 */}
      <div
        className="
          absolute
          left-[-120px]
          top-[-100px]
          h-[420px]
          w-[420px]
          rounded-full
          bg-green-500/12
          blur-3xl
          animate-pulse
        "
      />

      {/* LARGE GLOW ORB 2 */}
      <div
        className="
          absolute
          right-[-100px]
          top-[20%]
          h-[350px]
          w-[350px]
          rounded-full
          bg-cyan-500/10
          blur-3xl
          animate-pulse
        "
      />

      {/* LARGE GLOW ORB 3 */}
      <div
        className="
          absolute
          bottom-[-180px]
          left-[25%]
          h-[420px]
          w-[420px]
          rounded-full
          bg-purple-500/10
          blur-3xl
          animate-pulse
        "
      />

      {/* SMALL FLOATING ORB */}
      <div
        className="
          absolute
          right-[20%]
          bottom-[15%]
          h-[180px]
          w-[180px]
          rounded-full
          bg-emerald-400/10
          blur-3xl
          animate-bounce
        "
      />

      {/* VERTICAL LINES */}
      <div className="absolute left-[18%] top-0 h-full w-px bg-green-400/20 animate-pulse" />

      <div className="absolute right-[15%] top-0 h-full w-px bg-cyan-400/20 animate-pulse" />

      {/* HORIZONTAL GLOW LINE */}
      <div
        className="
          absolute
          top-1/2
          left-0
          h-px
          w-full
          bg-gradient-to-r
          from-transparent
          via-green-400/20
          to-transparent
        "
      />

    </div>
  );
}