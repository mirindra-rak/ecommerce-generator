import type { Role } from "@prisma/client";

// Rôle utilisateur (aligné sur l'enum Prisma `Role`).
export type { Role };

export const ROLES: Record<Role, Role> = {
  CUSTOMER: "CUSTOMER",
  STAFF: "STAFF",
  ADMIN: "ADMIN",
};

/** Vrai si le rôle a accès au back-office (STAFF ou ADMIN). */
export function isStaff(role: Role): boolean {
  return role === "STAFF" || role === "ADMIN";
}
