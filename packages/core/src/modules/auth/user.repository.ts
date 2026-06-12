import type { Role, User } from "@prisma/client";
import { prisma } from "../../db/client";

// Accès « métier » au User (lectures). Better Auth gère sa propre persistance via
// l'adapter Prisma ; ce repository sert les besoins applicatifs (RBAC, comptages).

export const userRepository = {
  findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  count(): Promise<number> {
    return prisma.user.count();
  },

  countByRole(role: Role): Promise<number> {
    return prisma.user.count({ where: { role } });
  },
};

export type UserRepository = typeof userRepository;
