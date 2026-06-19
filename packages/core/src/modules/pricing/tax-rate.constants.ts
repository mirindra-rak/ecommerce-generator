export const DEFAULT_TAX_RATE_ID = "tax-fr-normal-20";

export interface TaxRateReference {
  id: string;
  code: string;
  name: string;
  rateBps: number;
  position: number;
}

export const TAX_RATE_REFERENCES: readonly TaxRateReference[] = [
  {
    id: "tax-fr-normal-20",
    code: "FR_STANDARD_20",
    name: "TVA standard 20 %",
    rateBps: 2000,
    position: 0,
  },
  {
    id: "tax-fr-intermediate-10",
    code: "FR_INTERMEDIATE_10",
    name: "TVA intermédiaire 10 %",
    rateBps: 1000,
    position: 1,
  },
  {
    id: "tax-fr-reduced-5_5",
    code: "FR_REDUCED_5_5",
    name: "TVA réduite 5,5 %",
    rateBps: 550,
    position: 2,
  },
  {
    id: "tax-fr-reduced-2_1",
    code: "FR_REDUCED_2_1",
    name: "TVA réduite 2,1 %",
    rateBps: 210,
    position: 3,
  },
  {
    id: "tax-fr-exempt-0",
    code: "FR_EXEMPT_0",
    name: "Exonéré 0 %",
    rateBps: 0,
    position: 4,
  },
] as const;
