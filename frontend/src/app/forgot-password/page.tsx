"use client";

import Link from "next/link";
import { useState } from "react";
import BackgroundEffects from "@/components/ui/BackgroundEffects";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setMessage("");
    setError("");
    setResetToken("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
        credentials: "same-origin",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Unable to process password reset request.");
        return;
      }

      setMessage("If an account exists, a reset link has been prepared.");
      if (data.reset_token) {
        setResetToken(data.reset_token);
      }
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 text-white">
      <BackgroundEffects variant="auth" />
      <div className="relative z-10 w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <h1 className="text-3xl font-bold text-green-400">Forgot Password</h1>
        <p className="mt-3 text-white/70">
          Enter the email for your account and we’ll send a secure reset link.
        </p>

        <div className="mt-6 space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-white/10 bg-black/30 p-4 text-white outline-none focus:border-green-400"
          />

          {error && <p className="text-sm text-red-400">{error}</p>}
          {message && <p className="text-sm text-green-400">{message}</p>}

          {resetToken && (
            <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 p-3 text-sm text-amber-200">
              <p className="font-semibold">Development reset token:</p>
              <p className="mt-2 break-all">{resetToken}</p>
              <Link href={`/reset-password?token=${encodeURIComponent(resetToken)}`} className="mt-3 inline-block text-green-300 underline">
                Open reset page
              </Link>
            </div>
          )}

          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 font-semibold transition disabled:opacity-60"
          >
            {loading ? "Sending..." : "Request reset link"}
          </button>

          <div className="text-center text-sm text-white/60">
            Back to <Link href="/login" className="text-green-400 underline">Login</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
