import { API_BASE_URL } from "./index";

export type ResumeHistoryItem = {
  id: number;
  candidate_name: string | null;
  email: string | null;
  ats_score: number | null;
  match_score: number | null;
  experience_level: string | null;
  created_at: string;
};

export async function getHistory(): Promise<ResumeHistoryItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/history`, {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error("Failed to load history");
  }

  return response.json() as Promise<ResumeHistoryItem[]>;
}
