import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Packages internes consommés en TS brut (cf. ADR-002).
  transpilePackages: ["@pharmacie/core", "@pharmacie/ui"],
  // Build autonome pour l'image Docker.
  output: "standalone",
  // Racine du monorepo (évite la détection d'un lockfile parent hors projet).
  outputFileTracingRoot: path.join(import.meta.dirname, "../../"),
};

export default nextConfig;
