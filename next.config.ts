import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // Allow cross-origin requests from preview domains
  allowedDevOrigins: [
    'preview-chat-89d3c8cd-5261-469e-8842-f0786588a468.space.z.ai',
    '.space.z.ai',
    'space.z.ai',
    '*.space.z.ai',
    'localhost',
    '.z.ai',
  ],
};

export default nextConfig;
