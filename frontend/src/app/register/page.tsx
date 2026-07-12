"use client";

import { useState } from "react";
import Link from "next/link";
import { register, login } from "@/lib/auth/auth";
import { saveToken } from "@/lib/auth/token";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }


    try {
      setLoading(true);

      const registerResult = await register(
        email,
        password
      );

      console.log(registerResult);
      
      const loginResult = await login(
        email,
        password
      );

      if (loginResult.access_token) {
        saveToken(loginResult.access_token);
        document.cookie = `careerops_token=${loginResult.access_token}; path=/`;
        router.push("/dashboard");;
      }
    } catch (error) {
      console.error(error);

      alert("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white">

      <div className="grid min-h-screen lg:grid-cols-2">

        {/* LEFT SIDE */}

        <div className="hidden lg:flex flex-col justify-center px-20">

          <h1 className="text-7xl font-bold">
            CareerOps
            <span className="text-green-400">
              {" "}AI
            </span>
          </h1>

          <p className="mt-6 text-xl text-white/60">
            AI-powered career intelligence platform.
          </p>

          <div className="mt-12 space-y-5">

            <div className="rounded-2xl bg-green-500/10 p-4">
              ✓ ATS Optimization
            </div>

            <div className="rounded-2xl bg-cyan-500/10 p-4">
              ✓ Resume Analysis
            </div>

            <div className="rounded-2xl bg-purple-500/10 p-4">
              ✓ Skill Gap Detection
            </div>

            <div className="rounded-2xl bg-orange-500/10 p-4">
              ✓ AI Cover Letters
            </div>

          </div>

        </div>

        {/* RIGHT SIDE */}

        <div className="flex items-center justify-center p-8">

          <div
            className="
              w-full
              max-w-md
              rounded-3xl
              border
              border-white/10
              bg-white/5
              p-10
              backdrop-blur-xl
            "
          >

            <h2 className="text-center text-3xl font-bold">
              Create Account
            </h2>

            <p className="mt-3 text-center text-white/60">
              Start optimizing your career today.
            </p>

            <div className="mt-8 space-y-4">

              <input
                type="email"
                placeholder="Email"
                className="
                  w-full
                  rounded-xl
                  border
                  border-white/10
                  bg-black/30
                  p-4
                "
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />

              <input
                type="password"
                placeholder="Password"
                className="
                  w-full
                  rounded-xl
                  border
                  border-white/10
                  bg-black/30
                  p-4
                "
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />

              <input
                type="password"
                placeholder="Confirm Password"
                className="
                  w-full
                  rounded-xl
                  border
                  border-white/10
                  bg-black/30
                  p-4
                "
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
              />

              <button
                onClick={handleRegister}
                disabled={loading}
                className="
                  w-full
                  rounded-xl
                  bg-gradient-to-r
                  from-green-500
                  to-emerald-600
                  py-4
                  font-semibold
                  transition-all
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >
                {loading
                  ? "Creating Account..."
                  : "Create Account"}
              </button>

            </div>

            <p className="mt-6 text-center text-white/60">

              Already have an account?

              <Link
                href="/login"
                className="
                  ml-2
                  text-green-400
                "
              >
                Login
              </Link>

            </p>

          </div>

        </div>

      </div>

    </main>
  );
}