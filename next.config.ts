import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Dev-only badge defaults to bottom-left, where it covers the mobile BottomNav.
  devIndicators: { position: "top-right" },
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.openfoodfacts.org" }],
  },
};

export default nextConfig;
