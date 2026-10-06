"use client";

import Link from "next/link";
import { clearSessionHint, logout } from "@/lib/auth/token";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SessionDetails = {
  authenticated?: boolean;
  email?: string;
};

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [visible, setVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session", { cache: "no-store" })
      .then(async (response) => {
        if (!active) return;
        setLoggedIn(response.ok);
        if (response.ok) {
          const session = (await response.json()) as SessionDetails;
          if (active) setEmail(session.email ?? "");
        } else {
          setEmail("");
          clearSessionHint();
        }
      })
      .catch(() => {
        if (active) {
          setLoggedIn(false);
          setEmail("");
        }
      });

    return () => {
      active = false;
    };
  }, [pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    let previousScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setVisible(currentScrollY < 48 || currentScrollY < previousScrollY);
      previousScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setLoggedIn(false);
    setEmail("");
    router.push("/");
  };

  return (
    <nav
      aria-label="Main navigation"
      aria-hidden={!visible}
      inert={!visible}
      className={`fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/85 backdrop-blur-xl transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div className="mx-auto flex min-h-16 w-full max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-3 sm:px-8">
        <Link
          href="/"
          className="shrink-0 text-xl font-bold tracking-tight text-white"
        >
          CareerOps
          <span className="text-green-400"> AI</span>
        </Link>

        <div className="flex min-w-0 items-center justify-end gap-3 sm:gap-5">
          {loggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="hidden text-white/70 transition hover:text-white sm:inline-flex"
              >
                Dashboard
              </Link>

              <Link
                href="/upload"
                className="hidden text-white/70 transition hover:text-white sm:inline-flex"
              >
                Upload
              </Link>

              <Link
                href="/history"
                className="hidden text-white/70 transition hover:text-white sm:inline-flex"
              >
                History
              </Link>

              <span
                className="hidden max-w-56 truncate rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/65 sm:inline-flex"
                title={email || "Signed in"}
              >
                {email || "Signed in"}
              </span>

              <button
                type="button"
                onClick={handleLogout}
                  className="hidden rounded-full border border-red-400/25 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/10 sm:inline-flex"
              >
                  Log out
                </button>
                <button
                  type="button"
                  aria-expanded={menuOpen}
                  aria-controls="mobile-account-menu"
                  onClick={() => setMenuOpen((open) => !open)}
                  className="rounded-full border border-white/15 px-4 py-2 text-sm text-white sm:hidden"
                >
                  {menuOpen ? "Close" : "Menu"}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-white/70 transition hover:text-white sm:text-base"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 text-sm font-medium text-white sm:px-5 sm:text-base"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
      </div>
      {loggedIn && menuOpen && (
          <div
            id="mobile-account-menu"
            className="border-t border-white/10 bg-black/95 px-5 py-4 sm:hidden"
          >
            <p className="mb-4 truncate text-sm text-white/65">
              Signed in as <span className="text-white">{email || "User"}</span>
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <Link href="/dashboard" className="text-white/75 hover:text-white">Dashboard</Link>
              <Link href="/upload" className="text-white/75 hover:text-white">Upload</Link>
              <Link href="/history" className="text-white/75 hover:text-white">History</Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-red-400/25 px-4 py-2 font-medium text-red-300 transition hover:bg-red-500/10"
              >
                Log out
              </button>
            </div>
          </div>
      )}
    </nav>
  );
}