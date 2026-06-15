import type messages from "./messages/fr.json";
import type { routing } from "@/i18n/routing";

// Typage strict de next-intl : les clés de message sont vérifiées à la compilation
// (autocomplétion + erreur TS sur clé inconnue). `fr` est la locale source de vérité.
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
