// Module: auth
// Responsabilité: Authentification & sessions (client, invité, reset mdp)
//
// Frontière d'accès données via Repository (voir ../../repositories).
// La logique métier vit dans des services de domaine de ce module.

export { ROLES, isStaff } from "./role";
export type { Role } from "./role";

export { userRepository } from "./user.repository";
export type { UserRepository } from "./user.repository";
