import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cuzbsibackend.imtaqin.id",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
