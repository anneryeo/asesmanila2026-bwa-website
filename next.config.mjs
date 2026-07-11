// Initialize OpenNext Cloudflare development environment if installed
if (process.env.NODE_ENV === "development") {
  try {
    const { initOpenNextCloudflareForDev } = await import("@opennextjs/cloudflare");
    initOpenNextCloudflareForDev();
  } catch {
    // Adapter not installed yet or not in a Cloudflare environment
  }
}

const isDev = process.env.NODE_ENV === "development";

// Content-Security-Policy — kept in the repo so the site's security posture is
// versioned and reviewable, not set opaquely at the edge.
//
// The site ships NO eval'd code (framer-motion, next/image, and the JSON-LD
// blocks are all eval-free), so production omits 'unsafe-eval' entirely — that
// is what silences the "CSP blocks the use of eval" console issue the right
// way, rather than whitelisting eval.
//
// 'unsafe-inline' stays on script-src for Next's inline hydration bootstrap and
// on style-src for framer-motion / inline style props. Development additionally
// needs 'unsafe-eval' + ws: because Turbopack HMR evaluates modules and talks
// over a websocket; those are dev-only and never reach production.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "font-src 'self' data:",
  "form-action 'self'",
  "frame-ancestors 'none'",
  // cdn.sanity.io: Studio-uploaded images (project previews)
  "img-src 'self' data: blob: https://cdn.sanity.io",
  "media-src 'self'",
  "object-src 'none'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `connect-src 'self'${isDev ? " ws:" : ""}`,
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    qualities: [100, 75],
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
