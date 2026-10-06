import { useSyncExternalStore } from "react";

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

let cachedStoredValue: string | null | undefined;
let cachedResumeData: ResumeData | null = null;

function notifyResumeDataChanged() {
  window.dispatchEvent(new Event("resumeDataChange"));
}

function subscribeToResumeData(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === "resumeData") callback();
  };

  window.addEventListener("resumeDataChange", callback);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener("resumeDataChange", callback);
    window.removeEventListener("storage", handleStorage);
  };
}

export function useResumeData(): ResumeData | null {
  return useSyncExternalStore(subscribeToResumeData, getResumeData, () => null);
}

export function setResumeData(data: ResumeData) {
  localStorage.setItem("resumeData", JSON.stringify(data));
  notifyResumeDataChanged();
}

export function getResumeData(): ResumeData | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = localStorage.getItem("resumeData");
  if (stored === cachedStoredValue) {
    return cachedResumeData;
  }

  cachedStoredValue = stored;
  cachedResumeData = stored ? JSON.parse(stored) : null;
  return cachedResumeData;
}

export function clearResumeData() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("resumeData");
    notifyResumeDataChanged();
  }
}