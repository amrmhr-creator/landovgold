// Keep search engines out until the official launch. Flip to true on launch day.
// This is the only switch: it sets the X-Robots-Tag header here and the robots
// meta tag in app/layout.tsx (via the inlined ALLOW_INDEXING env value).
const ALLOW_INDEXING = false;

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // Hostinger's server has an older GLIBC; skip runtime image optimization (sharp).
  // Images in /public are already resized and compressed.
  images: { unoptimized: true },
  env: { ALLOW_INDEXING: String(ALLOW_INDEXING) },
  // Flights moved from /offers to /flights; offer links already posted on social media keep working.
  async redirects() {
    return [
      { source: "/offers", destination: "/flights", permanent: true },
      { source: "/offers/:slug", destination: "/flights/:slug", permanent: true },
    ];
  },
  async headers() {
    // Basic browser protections on every page.
    const security = [
      // Always HTTPS for a year (subdomains left out, in case one of them has no certificate).
      { key: "Strict-Transport-Security", value: "max-age=31536000" },
      // No other site can show ours inside a frame (stops click-tricks on the admin panel).
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), usb=()" },
    ];
    const robots = ALLOW_INDEXING ? [] : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
    return [
      { source: "/:path*", headers: [...security, ...robots] },
      // The admin panel is never stored by the browser or a proxy, and never indexed.
      {
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
          ...(ALLOW_INDEXING ? [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] : []),
        ],
      },
    ];
  },
};

export default nextConfig;
