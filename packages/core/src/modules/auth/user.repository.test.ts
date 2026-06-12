import { describe, expect, it } from "vitest";
import { prisma } from "../../db/client";
import { isStaff } from "./role";
import { userRepository } from "./user.repository";

describe("role.isStaff", () => {
  it("STAFF et ADMIN ont accès admin, pas CUSTOMER", () => {
    expect(isStaff("ADMIN")).toBe(true);
    expect(isStaff("STAFF")).toBe(true);
    expect(isStaff("CUSTOMER")).toBe(false);
  });
});

describe("userRepository (intégration)", () => {
  it("un utilisateur créé sans rôle est CUSTOMER par défaut", async () => {
    const user = await prisma.user.create({
      data: { name: "Jean Test", email: "jean@example.com" },
    });
    expect(user.role).toBe("CUSTOMER");

    const found = await userRepository.findByEmail("jean@example.com");
    expect(found?.id).toBe(user.id);
  });

  it("compte les utilisateurs par rôle", async () => {
    await prisma.user.create({
      data: { name: "Admin", email: "admin@example.com", role: "ADMIN" },
    });
    await prisma.user.create({ data: { name: "Client", email: "client@example.com" } });

    expect(await userRepository.count()).toBe(2);
    expect(await userRepository.countByRole("ADMIN")).toBe(1);
    expect(await userRepository.countByRole("CUSTOMER")).toBe(1);
  });
});
