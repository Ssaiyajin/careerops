import type { NextConfig } from "next";

import path from "path";

const nextConfig = {
  turbopack: { root: path.join(__dirname) },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
