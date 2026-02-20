import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Praxis",
  description: "Science into action. Build better habits with evidence-based action plans.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="dark">
      <body className="antialiased bg-gray-950 text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
