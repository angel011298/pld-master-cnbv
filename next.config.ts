import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfjs-dist"],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
