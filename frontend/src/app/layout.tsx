import "./globals.css";
import LayoutWrapper from "@/components/ui/LayoutWrapper";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CareerOps AI",
  description: "AI-powered career intelligence platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}