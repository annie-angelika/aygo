import type { NextConfig } from "next";

// Hardening headers on every response. No CSP yet: the Pollar login modal,
// MapLibre and Google Fonts would each need allowances — add one behind
// report-only first.
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  // Camera stays on for the QR scanner; everything else is off.
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(), geolocation=(self), payment=(), usb=(), interest-cohort=()",
  },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: SECURITY_HEADERS }];
  },
  images: {
    // Serve the smallest modern format the browser supports.
    formats: ["image/avif", "image/webp"],
    // Allow a low quality for the tiny collection thumbnails (default is 75).
    qualities: [45, 75],
    // Hosts the optimizer is allowed to fetch from. picsum is the demo source;
    // add the real backend image host here when it's known.
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
    ],
  },
};

export default nextConfig;
