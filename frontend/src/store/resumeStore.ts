export type ResumeData = {
  skills: string[];
  candidate_name?: string;
  ats?: { ats_score?: number; recommendations?: string[] };
  experience_level?: string;
  job_match?: {
    match_score?: number;
    matched_skills?: string[];
    missing_skills?: string[];
  };
  semantic_match?: { semantic_match_score?: number | null };
  ai_recommendations?: string;
  ats_advice?: { recommendations?: string[]; missing_keywords?: string[] };
  entities?: {
    names?: string[];
    organizations?: string[];
    locations?: string[];
    dates?: string[];
    emails?: string[];
    phones?: string[];
  };
  text_preview?: string;
  job_description?: string;
};

export function setResumeData(data: ResumeData) {

  localStorage.setItem(
    "resumeData",
    JSON.stringify(data)
  );
}

export function getResumeData(): ResumeData | null {

  if (typeof window === "undefined") {
    return null;
  }

  const stored = localStorage.getItem("resumeData");

  if (!stored) {
    return null;
  }

  return JSON.parse(stored);
}

export function clearResumeData() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("resumeData");
  }
}