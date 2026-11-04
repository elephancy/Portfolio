import { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AnalyticsConsent from "../components/analytics/AnalyticsConsent";
import "../styles/globals.css";

const inter = Inter({ subsets: ["latin"] });
const siteUrl = "https://elfeel.me";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Mahmoud Elfeel | Portfolio",
    template: "%s | Mahmoud Elfeel",
  },
  description:
    "Mahmoud Elfeel, also written Mahmoud Elfil, is a software engineer in Germany building backend, full-stack, mobile, security, and developer-tooling projects.",
  keywords: [
    "Mahmoud Elfeel",
    "Mahmoud Elfil",
    "Elfeel",
    "Elfil",
    "Mahmoud",
    "Feel",
    "software engineer",
    "full-stack developer",
    "backend developer",
    "Germany",
  ],
  authors: [{ name: "Mahmoud Elfeel", url: siteUrl }],
  creator: "Mahmoud Elfeel",
  publisher: "Mahmoud Elfeel",
  category: "technology",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "profile",
    url: siteUrl,
    siteName: "Mahmoud Elfeel",
    title: "Mahmoud Elfeel (Mahmoud Elfil) | Software Engineer",
    description:
      "Portfolio of Mahmoud Elfeel, a software engineer in Germany working across backend, full-stack, mobile, security, and developer tooling.",
    firstName: "Mahmoud",
    lastName: "Elfeel",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Mahmoud Elfeel software engineering portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mahmoud Elfeel (Mahmoud Elfil) | Software Engineer",
    description:
      "Backend, full-stack, mobile, security, and developer-tooling projects by Mahmoud Elfeel.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/Logo.ico",
    shortcut: "/Logo.ico",
    apple: "/Logo-transparent.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <AnalyticsConsent />
      </body>
    </html>
  );
}
