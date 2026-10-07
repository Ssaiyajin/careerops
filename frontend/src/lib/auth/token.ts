import { clearResumeData } from "@/store/resumeStore";

const SESSION_HINT_KEY = "careerops_authenticated";

export const markSessionActive = () => {
  if (typeof window === "undefined") return;

  localStorage.setItem(SESSION_HINT_KEY, "true");
  localStorage.removeItem("careerops_token");
  document.cookie = "careerops_token=; Max-Age=0; Path=/; SameSite=Lax";
};

export const clearSessionHint = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem(SESSION_HINT_KEY);
  localStorage.removeItem("careerops_token");
  clearResumeData();
  document.cookie = "careerops_token=; Max-Age=0; Path=/; SameSite=Lax";
};

export const logout = async () => {
  if (typeof window === "undefined") return;

  clearSessionHint();
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
    });
  } catch {
    // The browser-side session hint is cleared even when the server is offline.
  }
};

export const isLoggedIn = () => {
  if (typeof window === "undefined") return false;

  return localStorage.getItem(SESSION_HINT_KEY) === "true";
};