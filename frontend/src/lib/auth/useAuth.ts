"use client";

import { useRouter } from "next/navigation";
import { login } from "./auth";
import { saveToken } from "@/lib/auth/token";

export const useAuth = () => {
  const router = useRouter();

  const handleLogin = async (
    email: string,
    password: string
  ) => {
    const res = await login(email, password);

    console.log("LOGIN RESPONSE:", res);

    if (res.access_token) {
  saveToken(res.access_token);

  document.cookie =
    `careerops_token=${res.access_token}; path=/`;

  router.push("/dashboard");
}

    return res;
  };

  return { handleLogin };
};