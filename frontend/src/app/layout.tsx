import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareerOps AI",
  description: "AI-powered career platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full w-full bg-black text-white overflow-hidden">
        {children}
      </body>
    </html>
  );
}