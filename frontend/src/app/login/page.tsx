"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth/useAuth";

export default function LoginPage() {
  const { handleLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const nextErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      nextErrors.email = "Email is required";
    }

    if (!password) {
      nextErrors.password = "Password is required";
    }

    return nextErrors;
  };

  const submit = async () => {
    const nextErrors = validate();
    setFormErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const result = await handleLogin(email.trim(), password);

    if (result?.error) {
      setError(result.error);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#04140a] to-black" />
      <div className="glow green top-[20%] left-[20%]" />
      <div className="glow blue bottom-[10%] right-[20%]" />

      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[420px] max-w-[90vw] rounded-3xl border border-white/10 bg-[#151b1d] p-6 shadow-2xl shadow-black/50">
            <p className="text-lg font-medium text-white">{error}</p>
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setError("")}
                className="rounded-full border border-sky-200/80 bg-sky-100 px-10 py-2 text-base font-semibold text-sky-900 transition hover:bg-sky-200"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 w-[400px] rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-xl">
        <h1 className="text-3xl font-bold text-center text-green-400">Welcome Back</h1>

        <p className="mt-2 text-center text-white/60 text-sm">Login to continue to CareerOps AI</p>

        <div className="mt-8 space-y-4">
          <div>
            <input
              className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-white outline-none focus:border-green-400"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: undefined }));
                if (error) setError("");
              }}
            />
            {formErrors.email && <p className="mt-1 text-sm text-red-400">{formErrors.email}</p>}
          </div>

          <div>
            <input
              className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-white outline-none focus:border-green-400"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (formErrors.password) setFormErrors((prev) => ({ ...prev, password: undefined }));
                if (error) setError("");
              }}
            />
            {formErrors.password && <p className="mt-1 text-sm text-red-400">{formErrors.password}</p>}
          </div>

          <button
            type="button"
            onClick={submit}
            className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 py-3 font-semibold hover:scale-105 transition"
          >
            Login
          </button>
        </div>

        <div className="mt-4 text-center text-xs text-white/50">
          <Link href="/forgot-password" className="font-medium text-green-400 hover:text-green-300">
            Forgot password?
          </Link>
          <p className="mt-2 leading-relaxed">
            This app does not yet include a reset flow. If you want, I can add a proper reset flow to this project: forgot password page, reset request form, secure token-based reset, email or temp-link flow.
          </p>
        </div>

        <p className="mt-6 text-center text-white/40 text-xs">AI-powered career intelligence platform</p>
      </div>
    </main>
  );
}