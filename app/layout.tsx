import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { siteUrl } from "@/lib/site";
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
  metadataBase: new URL(siteUrl),
  title: {
    default: "BD CGPA — Bangladesh University Grading & CGPA",
    template: "%s | BD CGPA",
  },
  description:
    "Find Bangladeshi universities, view their official grading policies, and calculate your CGPA. Every policy is published with an official source and verification date.",
  applicationName: "BD CGPA",
  keywords: [
    "Bangladesh",
    "university",
    "CGPA",
    "GPA",
    "grading policy",
    "grade point",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "BD CGPA",
    title: "BD CGPA — Bangladesh University Grading & CGPA",
    description:
      "Find Bangladeshi universities, view their official grading policies, and calculate your CGPA.",
    locale: "en_US",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
