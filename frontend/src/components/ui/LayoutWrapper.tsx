"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import CareerCoachWidget from "@/components/career/CareerCoachWidget";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const hideNavbar =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register";
  return (
    <>
      {!hideNavbar && <Navbar />}
      <div className={hideNavbar ? "" : "pt-16"}>{children}</div>
      <CareerCoachWidget />
    </>
  );
}