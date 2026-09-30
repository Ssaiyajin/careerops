import { clearResumeData } from "@/store/resumeStore";

const TOKEN_KEY = "careerops_token";

function getTokenExpiry(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
    const bytes = Uint8Array.from(decoded, (character) => character.charCodeAt(0));
    const claims = JSON.parse(new TextDecoder().decode(bytes));
    return typeof claims.exp === "number" ? claims.exp : null;
  } catch {
    return null;
  }
}

function clearTokenCookie() {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${TOKEN_KEY}=; Max-Age=0; Path=/; SameSite=Lax${secure}`;
}

export const saveToken = (token: string) => {
  if (typeof window === "undefined") return;

  const expiry = getTokenExpiry(token);
  const maxAge = expiry === null
    ? 0
    : Math.floor(expiry - Date.now() / 1000);
  if (maxAge <= 0) {
    logout();
    return;
  }

  localStorage.setItem("careerops_token", token);
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${TOKEN_KEY}=${token}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
};

export const getToken = () => {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem(TOKEN_KEY);
  const expiry = token ? getTokenExpiry(token) : null;
  if (!token || expiry === null || expiry <= Date.now() / 1000) {
    if (token) logout();
    return null;
  }

  return token;
};

export const logout = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem(TOKEN_KEY);
  clearResumeData();
  clearTokenCookie();
};

export const isLoggedIn = () => {
  if (typeof window === "undefined") return false;

  return !!getToken();
};