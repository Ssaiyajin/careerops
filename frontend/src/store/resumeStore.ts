type ResumeData = {
  skills: string[];

  candidate_name: string;

  ats: {
    ats_score: number;
    recommendations: string[];
  };

  experience_level: string;

  job_match?: number;

  entities: {
    names: string[];
    organizations: string[];
    locations: string[];
    dates: string[];
    emails: string[];
    phones: string[];
  };

  text_preview: string;
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