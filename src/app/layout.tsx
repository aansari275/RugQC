import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Inspectra - AI-Powered QC Inspection Platform",
  description:
    "Stop reviewing 50 reports to find 3 problems. Inspectra shows you only the inspections that need your attention, with AI-generated summaries and risk scores.",
  keywords: [
    "QC inspection",
    "quality control",
    "textile inspection",
    "rug inspection",
    "carpet inspection",
    "AQL",
    "inspection software",
    "quality management",
  ],
  authors: [{ name: "Inspectra" }],
  openGraph: {
    title: "Inspectra - AI-Powered QC Inspection Platform",
    description: "Stop reviewing 50 reports to find 3 problems. Exception-only workflow for busy owners.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
