import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://talhakhan.pro";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Talha Khan — Senior Software Engineer | React, Next.js, Agentic AI",
    template: "%s | Talha Khan",
  },
  description:
    "Talha Khan is a Senior Software Engineer specializing in React, Next.js, TypeScript, and agentic AI systems. 5+ years shipping production-grade, accessible, high-performance web applications.",
  keywords: [
    "Talha Khan",
    "Talha Khan software engineer",
    "Senior Software Engineer",
    "React developer",
    "Next.js developer",
    "TypeScript",
    "Agentic AI",
    "Full Stack Engineer Pakistan",
  ],
  authors: [{ name: "Talha Khan", url: siteUrl }],
  creator: "Talha Khan",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "profile",
    url: siteUrl,
    siteName: "Talha Khan — Portfolio",
    title: "Talha Khan — Senior Software Engineer | React, Next.js, Agentic AI",
    description:
      "Senior Software Engineer specializing in React, Next.js, TypeScript, and agentic AI systems.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Talha Khan — Senior Software Engineer",
    description:
      "Senior Software Engineer specializing in React, Next.js, TypeScript, and agentic AI systems.",
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Talha Khan",
  jobTitle: "Full Stack Engineer",
  url: siteUrl,
  // No worksFor: per the hero copy Talha is currently available for new
  // opportunities rather than employed — add a company here once that changes.
  sameAs: ["https://github.com/talha-pro", "https://linkedin.com/in/talha-pro"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
