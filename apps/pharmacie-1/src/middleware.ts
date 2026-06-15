import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// Middleware de négociation de locale (cookie → Accept-Language → locale par défaut).
// Le matcher exclut `api`, `admin` (back-office non préfixé, story 05), les internes Next
// et tout fichier statique (présence d'un point) pour ne préfixer que les pages storefront.
export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
