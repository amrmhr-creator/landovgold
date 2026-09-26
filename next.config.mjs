/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // Hostinger's server has an older GLIBC; skip runtime image optimization (sharp).
  // Images in /public are already resized and compressed.
  images: { unoptimized: true },
};

export default nextConfig;
