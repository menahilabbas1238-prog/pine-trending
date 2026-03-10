import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daily GitHub Trending Review",
  description: "A clean daily review of one GitHub Trending repo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
