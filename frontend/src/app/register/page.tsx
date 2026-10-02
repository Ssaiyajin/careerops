"use client";

import Link from "next/link";
import { useState } from "react";
import { login, register } from "@/lib/auth/auth";
import { markSessionActive } from "@/lib/auth/token";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = () => {
    const nextErrors: { email?: string; password?: string; confirmPassword?: string } = {};

    if (!email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      nextErrors.password = "Password is required";
    } else if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    return nextErrors;
  };

  const handleRegister = async () => {
    const nextErrors = validate();
    setFormErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const registerResult: { error?: string; authenticated?: boolean } = await register(email.trim(), password);
      if (registerResult?.error) {
        setError(registerResult.error);
        return;
      }

      const loginResult: { error?: string; authenticated?: boolean } = await login(email.trim(), password);
      if (loginResult?.error) {
        setError(loginResult.error);
        return;
      }

      if (loginResult?.authenticated) {
        markSessionActive();
        router.push("/dashboard");
      }
    } catch (caughtError) {
      console.error(caughtError);
      setError("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white">
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

      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-center px-20">
          <h1 className="text-7xl font-bold">
            CareerOps
            <span className="text-green-400"> AI</span>
          </h1>

          <p className="mt-6 text-xl text-white/60">AI-powered career intelligence platform.</p>

          <div className="mt-12 space-y-5">
            <div className="rounded-2xl bg-green-500/10 p-4">✓ ATS Optimization</div>
            <div className="rounded-2xl bg-cyan-500/10 p-4">✓ Resume Analysis</div>
            <div className="rounded-2xl bg-purple-500/10 p-4">✓ Skill Gap Detection</div>
            <div className="rounded-2xl bg-orange-500/10 p-4">✓ AI Cover Letters</div>
          </div>
        </div>

        <div className="flex items-center justify-center p-8">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-xl">
            <h2 className="text-center text-3xl font-bold">Create Account</h2>
            <p className="mt-3 text-center text-white/60">Start optimizing your career today.</p>

            <div className="mt-8 space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full rounded-xl border border-white/10 bg-black/30 p-4"
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
                  type="password"
                  placeholder="Password"
                  className="w-full rounded-xl border border-white/10 bg-black/30 p-4"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formErrors.password) setFormErrors((prev) => ({ ...prev, password: undefined }));
                    if (error) setError("");
                  }}
                />
                {formErrors.password && <p className="mt-1 text-sm text-red-400">{formErrors.password}</p>}
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="w-full rounded-xl border border-white/10 bg-black/30 p-4"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (formErrors.confirmPassword) setFormErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                    if (error) setError("");
                  }}
                />
                {formErrors.confirmPassword && <p className="mt-1 text-sm text-red-400">{formErrors.confirmPassword}</p>}
              </div>

              <button
                type="button"
                onClick={handleRegister}
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 py-4 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </div>

            <p className="mt-6 text-center text-white/60">
              Already have an account?
              <Link href="/login" className="ml-2 text-green-400">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}