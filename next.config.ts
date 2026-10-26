import type { NextConfig } from "next";
import path from "path";

const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
  : "";

// Report-only for now: violations show in the browser console but nothing is
// blocked, so a missed origin can't break the map or sign-in. Switch the key
// to `Content-Security-Policy` once a soak period shows no violations.
// 'unsafe-inline' scripts are needed because Next.js injects inline bootstrap
// scripts and this app doesn't use per-request nonces; 'unsafe-eval' is only
// for dev (React Refresh). Leaflet sets inline styles, hence style-src.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  // Label photos go through /_next/image (self); map tiles and marker icons
  // load straight from OSM and unpkg (see components/WineryMap.tsx).
  "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://unpkg.com",
  "font-src 'self'",
  `connect-src 'self' ${supabaseOrigin}`.trim(),
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

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
          { key: "Content-Security-Policy-Report-Only", value: contentSecurityPolicy },
        ],
      },
    ];
  },
};

export default nextConfig;
