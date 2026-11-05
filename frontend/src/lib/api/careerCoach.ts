import { API_BASE_URL } from "./index";

type CareerResponse = {
  answer: string;
};

export type CareerContext = {
  available: boolean;
  resume_text: string;
};

async function postCareerRequest(
  path: string,
  payload: Record<string, unknown>
): Promise<CareerResponse> {
  const response = await fetch(`${API_BASE_URL}/api/career/${path}`, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = (await response.json()) as
    | CareerResponse
    | { detail?: string };
  if (!response.ok) {
    throw new Error(
      "detail" in result && typeof result.detail === "string"
        ? result.detail
        : `Career coach request failed (HTTP ${response.status}).`
    );
  }
  if (!("answer" in result) || typeof result.answer !== "string") {
    throw new Error("Career coach returned an invalid response.");
  }
  return result;
}

export async function getLatestCareerContext(): Promise<CareerContext> {
  const response = await fetch(`${API_BASE_URL}/api/career/context`, {
    credentials: "same-origin",
    cache: "no-store",
  });
  const result = (await response.json()) as CareerContext | { detail?: string };
  if (!response.ok) {
    throw new Error(
      "detail" in result && typeof result.detail === "string"
        ? result.detail
        : `Could not load resume context (HTTP ${response.status}).`
    );
  }
  if (
    !("available" in result) ||
    typeof result.available !== "boolean" ||
    typeof result.resume_text !== "string"
  ) {
    throw new Error("Resume context returned an invalid response.");
  }
  return result;
}

export function sendCareerChat(payload: {
  message: string;
  history: { role: "user" | "assistant"; content: string }[];
  resume_text: string;
  job_description: string;
  target_role: string;
}) {
  return postCareerRequest("chat", payload);
}

export function generateInterviewPrep(payload: {
  target_role: string;
  focus_area: string;
  resume_text: string;
  job_description: string;
}) {
  return postCareerRequest("interview-prep", payload);
}

export function generateLearningPlan(payload: {
  goal: string;
  target_role: string;
  current_skills: string[];
  duration_weeks: number;
  hours_per_week: number;
  resume_text: string;
  job_description: string;
}) {
  return postCareerRequest("learning-plan", payload);
}
