"use client";

import { useRouter } from "next/navigation";
import { login } from "./auth";
import { markSessionActive } from "@/lib/auth/token";

export const useAuth = () => {
  const router = useRouter();

  const handleLogin = async (
    email: string,
    password: string
  ) => {
    const res = await login(email, password);

    if (res.authenticated) {
      markSessionActive();
      router.push("/dashboard");
    }

    return res;
  };

  return { handleLogin };
};