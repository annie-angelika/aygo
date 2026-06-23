import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
