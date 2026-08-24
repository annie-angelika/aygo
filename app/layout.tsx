import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FONT_VARIABLES } from "@/lib/fonts";
import { PollarAuthProvider } from "@/components/auth/pollar-provider";
import { ServerSync } from "@/components/layout/server-sync";
import { AccountSession } from "@/components/layout/account-session";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// maximumScale: 1 stops iOS Safari's auto-zoom when focusing sub-16px inputs
// (it zooms in and never zooms back out). Users can still pinch-zoom manually —
// iOS ignores the cap for real gestures, only the focus auto-zoom respects it.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

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
      <body className="min-h-full flex flex-col">
        <PollarAuthProvider>
          <AccountSession />
          <ServerSync />
          {children}
        </PollarAuthProvider>
      </body>
    </html>
  );
}
