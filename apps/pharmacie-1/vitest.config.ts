import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Tests unitaires/intégration de l'app (Vitest, environnement node). Les specs Playwright
// vivent dans `e2e/` et sont exécutées séparément (`pnpm test:e2e`) — exclues ici pour
// qu'elles ne soient pas ramassées par Vitest (leur import `@playwright/test` casserait).
export default defineConfig({
  // Aligne l'alias `@/*` sur `tsconfig.json` pour que les tests importent le code app
  // (et le mockent) avec le même chemin qu'en runtime.
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    exclude: ["**/node_modules/**", "**/.next/**", "e2e/**"],
  },
});
