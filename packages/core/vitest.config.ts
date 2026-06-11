import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

// Tests d'intégration : ils tournent sur une VRAIE base PostgreSQL de test
// (cascade et contraintes d'unicité = comportements DB, non mockables).
// DATABASE_URL provient de `.env.test` en local, ou de l'environnement en CI.
function loadEnvFile(file: string): void {
  try {
    const content = readFileSync(resolve(process.cwd(), file), "utf8");
    for (const line of content.split("\n")) {
      const match = line.match(/^\s*([\w.]+)\s*=\s*"?([^"\n]*)"?\s*$/);
      const key = match?.[1];
      if (key && process.env[key] === undefined) {
        process.env[key] = match?.[2] ?? "";
      }
    }
  } catch {
    // Fichier absent (CI) : on conserve l'environnement déjà fourni.
  }
}

loadEnvFile(".env.test");

const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://pharmacie:pharmacie@localhost:5432/pharmacie_test?schema=public";

// Garantit que le client Prisma (et les sous-process de migration) ciblent la base de test.
process.env.DATABASE_URL = databaseUrl;

export default defineConfig({
  test: {
    environment: "node",
    globalSetup: ["./src/test/global-setup.ts"],
    setupFiles: ["./src/test/setup.ts"],
    // Une seule base partagée → pas de parallélisme entre fichiers (truncate global).
    fileParallelism: false,
    env: { DATABASE_URL: databaseUrl },
  },
});
