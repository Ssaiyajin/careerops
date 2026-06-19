"use client";

import { useEffect, useState } from "react";
import { getHistory } from "@/lib/api";

export default function DashboardPage() {

  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {

    async function loadData() {

      const data = await getHistory();

      setHistory(data);
    }

    loadData();

  }, []);

  return (

    <main className="min-h-screen bg-black text-white p-10">

      <h1 className="text-5xl font-bold mb-10">
        CareerOps Dashboard
      </h1>

      <div className="grid gap-6">

        {history.map((item) => (

          <div
            key={item.id}
            className="
              rounded-2xl
              border
              border-green-500/20
              bg-white/5
              p-6
            "
          >

            <h2 className="text-2xl font-semibold">
              {item.candidate_name}
            </h2>

            <p>ATS Score: {item.ats_score}</p>

            <p>Match Score: {item.match_score}</p>

            <p>
              Experience: {item.experience_level}
            </p>

            <p className="text-white/50">
              {item.created_at}
            </p>

          </div>

        ))}

      </div>

    </main>
  );
}