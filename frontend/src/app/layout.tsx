import "./globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CareerOps AI",
  description: "AI-powered career intelligence platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}