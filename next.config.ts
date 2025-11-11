import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Avertir mais ne pas bloquer le build sur les erreurs ESLint
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Ne pas bloquer le build sur les erreurs TypeScript
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
