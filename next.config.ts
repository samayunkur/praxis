import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-libsql"],
  allowedDevOrigins: ["*.trycloudflare.com", "*.lhr.life"],
};

export default nextConfig;
