import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Consensus — AI Career Strategy Team",
  description:
    "Five AI agents collaborate to build your personalized career plan. Powered by IBM watsonx & SkillsBuild.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
