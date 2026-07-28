"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/useAuth";

export default function LoginPage() {
  const { handleLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

    const submit = async () => {
    const result = await handleLogin(
      email,
      password
    );

    console.log(result);
  };
  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-white relative overflow-hidden">

      {/* background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#04140a] to-black" />
      <div className="glow green top-[20%] left-[20%]" />
      <div className="glow blue bottom-[10%] right-[20%]" />

      {/* card */}
      <div className="relative z-10 w-[400px] rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-xl">

        <h1 className="text-3xl font-bold text-center text-green-400">
          Welcome Back
        </h1>

        <p className="mt-2 text-center text-white/60 text-sm">
          Login to continue to CareerOps AI
        </p>

        <div className="mt-8 space-y-4">

          <input
            className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-white outline-none focus:border-green-400"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-white outline-none focus:border-green-400"
            placeholder="Password"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={submit}
            className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 py-3 font-semibold hover:scale-105 transition"
          >
            Login
          </button>

        </div>

        <p className="mt-6 text-center text-white/40 text-xs">
          AI-powered career intelligence platform
        </p>

      </div>
    </main>
  );
}