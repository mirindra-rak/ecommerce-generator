import type { TaxRate } from "@prisma/client";
import { prisma } from "../../db/client";
import { DEFAULT_TAX_RATE_ID } from "./tax-rate.constants";

export const taxRateRepository = {
  findById(id: string): Promise<TaxRate | null> {
    return prisma.taxRate.findUnique({ where: { id } });
  },

  findByCode(code: string): Promise<TaxRate | null> {
    return prisma.taxRate.findUnique({ where: { code } });
  },

  findMany(): Promise<TaxRate[]> {
    return prisma.taxRate.findMany({ orderBy: [{ position: "asc" }, { name: "asc" }] });
  },

  findActive(): Promise<TaxRate[]> {
    return prisma.taxRate.findMany({
      where: { active: true },
      orderBy: [{ position: "asc" }, { name: "asc" }],
    });
  },

  findDefault(): Promise<TaxRate | null> {
    return prisma.taxRate.findUnique({ where: { id: DEFAULT_TAX_RATE_ID } });
  },
};

export type TaxRateRepository = typeof taxRateRepository;
