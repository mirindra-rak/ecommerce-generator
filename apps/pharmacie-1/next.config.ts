import type { NextConfig } from "next";
import path from "node:path";
import createNextIntlPlugin from "next-intl/plugin";

// Plugin next-intl : branche la config par requête (résolution de locale + messages).
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Packages internes consommés en TS brut (cf. ADR-002).
  transpilePackages: ["@pharmacie/core", "@pharmacie/ui"],
  // Prisma & Better Auth : à requérir au runtime (Node), pas à bundler par webpack.
  serverExternalPackages: ["@prisma/client", "@prisma/engines", "better-auth"],
  // Build autonome pour l'image Docker.
  output: "standalone",
  // Racine du monorepo (évite la détection d'un lockfile parent hors projet).
  outputFileTracingRoot: path.join(import.meta.dirname, "../../"),
};

export default withNextIntl(nextConfig);
