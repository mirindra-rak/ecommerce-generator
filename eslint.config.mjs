import { FlatCompat } from "@eslint/eslintrc";
import eslintConfigPrettier from "eslint-config-prettier";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/.turbo/**",
      "**/coverage/**",
      "**/.prisma/**",
      "**/generated/**",
      "**/next-env.d.ts",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Règles non-négociables (cf. CLAUDE.md)
      "@typescript-eslint/no-explicit-any": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      // App Router uniquement : la règle Pages Router n'a pas lieu d'être et
      // échoue quand ESLint tourne depuis la racine du monorepo (lint-staged).
      "@next/next/no-html-link-for-pages": "off",
    },
  },
  eslintConfigPrettier,
];
