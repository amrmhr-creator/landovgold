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
    if (ALLOW_INDEXING) return [];
    return [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
};

export default nextConfig;
