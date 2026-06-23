import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FONT_VARIABLES } from "@/lib/fonts";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Luma-style tab titles: the page/event name first, then the brand, joined by
  // a middle dot — e.g. "Create · aygo". Each page sets just its own name and
  // this template appends "· aygo"; `default` covers any page that sets none.
  title: {
    default: "aygo — Events near you",
    template: "%s · aygo",
  },
  description:
    "Discover events in your city, apply in one tap, and get approved by the host. Collect every experience in your collection.",
  // The mark is a single-colour transparent glyph, so it needs a matching
  // variant per browser-chrome theme: the navy mark on light tabs, the cream
  // mark on dark tabs. Same two files the on-screen Logo uses.
  icons: {
    icon: [
      { url: "/aygo-light.png", media: "(prefers-color-scheme: light)" },
      { url: "/aygo-dark.png", media: "(prefers-color-scheme: dark)" },
    ],
    apple: "/aygo-light.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${FONT_VARIABLES} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
