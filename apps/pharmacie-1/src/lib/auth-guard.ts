import { isStaff, type Role } from "@pharmacie/core/modules/auth";
import { redirect } from "next/navigation";
import { getSession } from "./auth";

// Gardes d'autorisation côté serveur. À appeler dans les layouts/pages admin ET dans
// chaque Server Action (défense en profondeur : un POST d'action contourne le rendu).

/** Utilisateur de la session courante, ou null. */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

/**
 * Exige un membre du staff (STAFF/ADMIN). Sinon :
 * - anonyme → redirection vers la connexion ;
 * - rôle insuffisant → redirection vers la page 403.
 * Retourne l'utilisateur autorisé.
 */
export async function requireStaff() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (!isStaff(user.role as Role)) redirect("/admin/forbidden");
  return user;
}
