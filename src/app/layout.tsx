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
  title: {
    default: "RugQC - Digital QC Inspection Platform for Rug & Carpet Manufacturers",
    template: "%s | RugQC",
  },
  description:
    "Replace paper checklists and Excel reports with digital QC inspections. Your inspector snaps photos on the shop floor, you get a branded PDF report instantly. AQL sampling and 100% inspection modes built in.",
  keywords: [
    "QC inspection software",
    "quality control",
    "textile inspection",
    "rug inspection",
    "carpet inspection",
    "AQL inspection",
    "100 percent inspection",
    "inspection report software",
    "quality management system",
    "factory inspection app",
    "rug quality control",
    "carpet QC",
    "textile QC software",
    "digital inspection",
    "inspection checklist app",
  ],
  authors: [{ name: "RugQC" }],
  creator: "RugQC",
  publisher: "RugQC",
  metadataBase: new URL("https://rugqc.netlify.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "RugQC - Digital QC Inspection for Rug & Carpet Manufacturers",
    description:
      "Your inspector snaps photos on the shop floor. You get the report in your inbox. No more Excel, no more delays. AQL and 100% inspection modes built in.",
    url: "https://rugqc.netlify.app",
    siteName: "RugQC",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RugQC - Digital QC Inspection Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RugQC - Digital QC Inspection for Rug & Carpet Manufacturers",
    description:
      "Replace paper checklists with digital inspections. Inspector submits on shop floor, report lands in your inbox.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
