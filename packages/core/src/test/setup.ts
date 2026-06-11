import { afterAll, beforeEach } from "vitest";
import { prisma } from "../db/client";
import { resetDb } from "./db";

// Base propre avant chaque test, déconnexion en fin de suite.
beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await prisma.$disconnect();
});
