import BackgroundEffects from "@/components/ui/BackgroundEffects";
import PageContainer from "@/components/ui/PageContainer";

const skills = [
  "Python",
  "Docker",
  "Kubernetes",
  "Terraform",
  "AWS",
  "CI/CD",
  "FastAPI",
  "Machine Learning",
];

export default function ResultsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">

      <BackgroundEffects />

      <PageContainer>

        {/* HEADER */}
        <div className="text-center">

          <div className="mb-8 inline-flex rounded-full border border-green-400/30 bg-green-400/5 px-5 py-2 text-sm text-green-300 backdrop-blur-sm">
            AI Analysis Complete
          </div>

          <h1 className="text-6xl font-bold tracking-tight">
            Resume Results
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
            Your resume was successfully analyzed using AI-powered
            skill extraction and job matching systems.
          </p>

        </div>

        {/* DASHBOARD */}
        <div className="mt-16 grid w-full gap-6 lg:grid-cols-3">

          {/* ATS SCORE */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

            <p className="text-sm text-white/50">
              ATS Compatibility
            </p>

            <h2 className="mt-4 text-6xl font-bold text-green-400">
              86%
            </h2>

            <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">

              <div className="h-full w-[86%] rounded-full bg-gradient-to-r from-green-400 to-emerald-500" />

            </div>

          </div>

          {/* MATCH SCORE */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

            <p className="text-sm text-white/50">
              Job Match Score
            </p>

            <h2 className="mt-4 text-6xl font-bold text-cyan-400">
              78%
            </h2>

            <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">

              <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />

            </div>

          </div>

          {/* EXPERIENCE */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

            <p className="text-sm text-white/50">
              Experience Level
            </p>

            <h2 className="mt-4 text-6xl font-bold text-purple-400">
              Mid
            </h2>

            <p className="mt-4 text-white/60">
              Strong cloud and DevOps engineering background detected.
            </p>

          </div>

        </div>

        {/* SKILLS */}
        <div className="mt-10 w-full rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

          <h2 className="text-2xl font-semibold">
            Extracted Skills
          </h2>

          <div className="mt-8 flex flex-wrap gap-4">

            {skills.map((skill) => (
              <div
                key={skill}
                className="
                  rounded-full
                  border
                  border-green-400/20
                  bg-green-400/5
                  px-5
                  py-3
                  text-sm
                  text-green-300
                  transition-all
                  duration-300
                  hover:scale-105
                  hover:border-green-400/50
                "
              >
                {skill}
              </div>
            ))}

          </div>

        </div>

        {/* AI RECOMMENDATIONS */}
        <div className="mt-10 w-full rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

          <h2 className="text-2xl font-semibold">
            AI Recommendations
          </h2>

          <div className="mt-8 space-y-5">

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              Improve ATS keywords for cloud-native engineering roles.
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              Add measurable DevOps deployment metrics to experience section.
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              Highlight Kubernetes and Terraform projects more prominently.
            </div>

          </div>

        </div>

      </PageContainer>

    </main>
  );
}