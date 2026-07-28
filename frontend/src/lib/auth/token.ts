const TOKEN_KEY = "careerops_token";

export const saveToken = (token: string) => {
  localStorage.setItem("careerops_token", token);
};

export const getToken = () => {
  return localStorage.getItem("careerops_token");
};

export const logout = () => {
  localStorage.removeItem("careerops_token");
};

export const isLoggedIn = () => {
  if (typeof window === "undefined") return false;

  return !!localStorage.getItem("careerops_token");
};