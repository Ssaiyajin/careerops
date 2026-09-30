"use client";

import Link from "next/link";
import Container from "./PageContainer";
import { clearSessionHint, logout } from "@/lib/auth/token";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) => {
        if (!active) return;
        setLoggedIn(response.ok);
        if (!response.ok) clearSessionHint();
      })
      .catch(() => {
        if (active) setLoggedIn(false);
      });

    return () => {
      active = false;
    };
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    setLoggedIn(false);
    router.push("/");
  };

  return (
    <nav className="border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <Container>
        <div className="flex h-16 items-center justify-between">

          <Link
            href="/"
            className="
              text-xl
              font-bold
              tracking-tight
              text-white
            "
          >
            CareerOps
            <span className="text-green-400"> AI</span>
          </Link>

          <div className="flex items-center gap-6">

            {loggedIn ? (
              <>
              <Link
                href="/dashboard"
                className="text-white/70 hover:text-white transition"
              >
                Dashboard
              </Link>

              <Link
                href="/upload"
                className="text-white/70 hover:text-white transition"
              >
                Upload
              </Link>

              <Link
                href="/history"
                className="text-white/70 hover:text-white transition"
              >
                History
              </Link>

              <button
                onClick={handleLogout}
                className="
                  rounded-full
                  border
                  border-red-500/20
                  px-4
                  py-2
                  text-red-400
                  hover:bg-red-500/10
                  transition
                "
              >
                Logout
              </button>
            </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-white/70 hover:text-white transition"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="
                    rounded-full
                    bg-gradient-to-r
                    from-green-500
                    to-emerald-600
                    px-5
                    py-2
                    text-white
                    font-medium
                  "
                >
                  Get Started
                </Link>
              </>
            )}

          </div>

        </div>
      </Container>
    </nav>
  );
}