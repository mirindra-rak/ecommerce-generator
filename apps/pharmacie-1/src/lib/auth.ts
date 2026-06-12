import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { authOptions } from "./auth-options";

// Instance Better Auth couplée Next (options partagées + plugin nextCookies).
export const auth = betterAuth({
  ...authOptions,
  // Doit rester en dernier : permet aux Server Actions de poser les cookies.
  plugins: [nextCookies()],
});

/** Session courante côté serveur (RSC / Server Action), ou null si non connecté. */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}
