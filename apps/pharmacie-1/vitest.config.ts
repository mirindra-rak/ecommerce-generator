import { defineConfig } from "vitest/config";

// Tests unitaires/intégration de l'app (Vitest, environnement node). Les specs Playwright
// vivent dans `e2e/` et sont exécutées séparément (`pnpm test:e2e`) — exclues ici pour
// qu'elles ne soient pas ramassées par Vitest (leur import `@playwright/test` casserait).
export default defineConfig({
  test: {
    environment: "node",
    exclude: ["**/node_modules/**", "**/.next/**", "e2e/**"],
  },
});
