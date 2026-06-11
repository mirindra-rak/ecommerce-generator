import { execSync } from "node:child_process";

// Applique les migrations sur la base de test une fois avant toute la suite.
// DATABASE_URL est déjà positionnée sur la base de test par vitest.config.ts.
export default function setup(): void {
  execSync("pnpm exec prisma migrate deploy", {
    stdio: "inherit",
    env: process.env,
  });
}
