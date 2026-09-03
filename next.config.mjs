/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prevent duplicate render/mount cycles in development
  reactStrictMode: false,
  poweredByHeader: false,
  compress: true,
  transpilePackages: ['three'],
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // In-memory cache during dev eliminates disk lockups / ENOENT on Windows OneDrive
      config.cache = {
        type: 'memory',
      };
    }
    return config;
  },
};

export default nextConfig;
