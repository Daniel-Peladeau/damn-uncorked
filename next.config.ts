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
  // Don't advertise the framework in an `X-Powered-By` response header.
  poweredByHeader: false,
  // Baseline security headers on every route: no framing (clickjacking), no
  // MIME sniffing, and no full-URL referrers (wine/vintage ids) sent to the
  // external tile/image hosts. HSTS is already set by Vercel.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
