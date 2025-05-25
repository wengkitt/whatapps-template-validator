import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "WhatsApp Template Checker | Meta Business API Compliance Tool",
  description:
    "Check your WhatsApp Business message templates against Meta's requirements. Get clear feedback on template compliance, component validation, and approval guidelines to avoid rejections.",
  keywords: [
    "WhatsApp Business",
    "template checker",
    "Meta API",
    "message templates",
    "business messaging",
    "template compliance",
  ],
  authors: [{ name: "WhatsApp Template Checker" }],
  creator: "WhatsApp Template Checker",
  publisher: "WhatsApp Template Checker",
  robots: "index, follow",
  openGraph: {
    title: "WhatsApp Template Checker | Meta Business API Compliance Tool",
    description:
      "Check your WhatsApp Business message templates against Meta's requirements. Get clear feedback on template compliance and avoid rejections.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "WhatsApp Template Checker",
    description:
      "Check WhatsApp Business templates against Meta's requirements",
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#25D366" },
    ],
  },
  manifest: "/site.webmanifest",
  themeColor: "#25D366",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
