"use client";

import Link from "next/link";
import { clearSessionHint, logout } from "@/lib/auth/token";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SessionDetails = {
  authenticated?: boolean;
  email?: string;
};

function AccountMenu({
  email,
  userInitial,
  onLogout,
}: {
  email: string;
  userInitial: string;
  onLogout: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [scrollingUp, setScrollingUp] = useState(false);
  const showScrollArrow = scrollY > 120 && scrollingUp;

  useEffect(() => {
    let previousScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const movingUp = currentScrollY < previousScrollY - 2;
      setScrollY(currentScrollY);
      setScrollingUp(movingUp);
      if (movingUp && currentScrollY > 120) setMenuOpen(true);
      previousScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <button
        type="button"
        aria-label={`Open account menu for ${email || "signed-in user"}`}
        aria-expanded={menuOpen}
        aria-controls="careerops-account-menu"
        onClick={() => setMenuOpen((open) => !open)}
        className="pointer-events-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-green-200/35 bg-slate-950/65 text-base font-bold text-green-100 shadow-lg shadow-black/20 backdrop-blur-md transition hover:scale-105 hover:border-green-200/70 hover:bg-green-400/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-300"
        title={email || "Account"}
      >
        {userInitial}
      </button>

      <button
        type="button"
        aria-label={menuOpen ? "Close dashboard menu" : "Open dashboard menu"}
        aria-expanded={menuOpen}
        aria-controls="careerops-account-menu"
        aria-hidden={!showScrollArrow}
        tabIndex={showScrollArrow ? 0 : -1}
        onClick={() => setMenuOpen((open) => !open)}
        className={`pointer-events-auto absolute left-1/2 top-3 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border border-white/15 bg-slate-950/60 text-white/80 shadow-lg shadow-black/20 backdrop-blur-md transition-[opacity,transform,background-color] duration-300 hover:border-green-200/40 hover:bg-green-400/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-300 motion-reduce:transition-none ${
          showScrollArrow
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-4 opacity-0"
        }`}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          className="h-5 w-5 animate-nav-arrow motion-reduce:animate-none"
        >
          <path
            d="m4.75 12.25 5.25-5.5 5.25 5.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div
        id="careerops-account-menu"
        aria-hidden={!menuOpen}
        inert={!menuOpen}
        className={`pointer-events-auto absolute right-5 top-[4.5rem] w-[min(20rem,calc(100vw-2.5rem))] origin-top-right rounded-2xl border border-white/10 bg-slate-950/90 p-4 shadow-2xl shadow-black/40 backdrop-blur-2xl transition-[opacity,transform,visibility] duration-200 ease-out motion-reduce:transition-none sm:right-8 ${
          menuOpen
            ? "visible translate-y-0 scale-100 opacity-100"
            : "invisible -translate-y-2 scale-95 opacity-0"
        }`}
      >
        <div className="mb-3 border-b border-white/10 px-2 pb-3">
          <p className="text-xs uppercase tracking-[0.16em] text-white/40">
            CareerOps dashboard
          </p>
          <p className="mt-1 truncate text-sm text-white/75" title={email}>
            {email}
          </p>
        </div>
        <div className="grid gap-1">
          {[
            { href: "/dashboard", label: "Dashboard" },
            { href: "/upload", label: "Upload resume" },
            { href: "/history", label: "Analysis history" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm text-white/75 transition hover:bg-white/[0.07] hover:text-white"
            >
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={onLogout}
            className="mt-1 rounded-xl border border-red-300/15 px-3 py-2.5 text-left text-sm font-medium text-red-200 transition hover:bg-red-400/10"
          >
            Log out
          </button>
        </div>
      </div>
    </>
  );
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");

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

  const handleLogout = async () => {
    await logout();
    setLoggedIn(false);
    setEmail("");
    router.push("/");
  };

  const userInitial = email.trim().charAt(0).toUpperCase() || "?";

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="flex w-full items-start justify-between px-5 pt-4 sm:px-8">
        <Link
          href={loggedIn ? "/dashboard" : "/"}
          aria-label={loggedIn ? "CareerOps AI dashboard" : "CareerOps AI home"}
          className="pointer-events-auto text-lg font-bold tracking-tight text-white transition-colors hover:text-green-100 focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green-300"
        >
          CareerOps<span className="text-green-400"> AI</span>
        </Link>

        {loggedIn && (
          <AccountMenu
            key={pathname ?? "/"}
            email={email}
            userInitial={userInitial}
            onLogout={handleLogout}
          />
        )}
      </div>
    </header>
  );
}
