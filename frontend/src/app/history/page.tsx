"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getHistory } from "@/lib/api";
import type { ResumeHistoryItem } from "@/lib/api/history";
import { deleteAccount } from "@/lib/auth/auth";
import { logout } from "@/lib/auth/token";
import BackgroundEffects from "@/components/ui/BackgroundEffects";

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<ResumeHistoryItem[]>([]);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const handleDeleteAccount = async () => {
    if (!window.confirm("Delete your account and all saved resume data? This cannot be undone.")) {
      return;
    }

    setDeletingAccount(true);
    try {
      await deleteAccount();
      await logout();
      router.replace("/");
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Account deletion failed.");
      setDeletingAccount(false);
    }
  };

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await getHistory();
        setHistory(data);
      } catch (error) {
        console.error(error);
      }
    };

    loadHistory();
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">

      <BackgroundEffects variant="history" />

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

        <div className="text-center">

          <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/5 px-5 py-2 text-sm text-cyan-300">
            Previous Analyses
          </div>

          <h1 className="mt-6 text-6xl font-extrabold">
            Analysis
            <span className="text-cyan-400">
              {" "}History
            </span>
          </h1>

          <p className="mt-4 text-white/60">
            Review previous resume analyses and recommendations.
          </p>

          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={deletingAccount}
            className="mt-6 rounded-md border border-red-400/40 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10 disabled:opacity-60"
          >
            {deletingAccount ? "Deleting account..." : "Delete account and saved data"}
          </button>

        </div>

        <div
          className="
            mt-16
            w-full
            max-w-4xl
            space-y-6
          "
        >

          {history.length === 0 ? (
            <div
              className="
                rounded-3xl
                border
                border-white/10
                bg-white/5
                p-8
                text-center
                text-white/50
              "
            >
              No analyses yet.

              Upload a resume to generate your first analysis.
            </div>
          ) : (
            history.map((item, index) => (
              <div
                key={index}
                className="
                  rounded-3xl
                  border
                  border-white/10
                  bg-white/5
                  p-8
                  backdrop-blur-xl
                "
              >
                <h2 className="text-2xl font-semibold">
                  {item.candidate_name || "Resume Analysis"}
                </h2>

                <div className="mt-4 flex gap-8">

                  <div>
                    <p className="text-white/50">
                      ATS Score
                    </p>

                    <p className="text-green-400 text-xl font-bold">
                      {item.ats_score}
                    </p>
                  </div>

                  <div>
                    <p className="text-white/50">
                      Match Score
                    </p>

                    <p className="text-cyan-400 text-xl font-bold">
                      {item.match_score}
                    </p>
                  </div>

                </div>

              </div>
            ))
          )}

        </div>

      </div>

    </main>
  );
}