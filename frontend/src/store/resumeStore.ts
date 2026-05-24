type ResumeData = {
  skills: string[];
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