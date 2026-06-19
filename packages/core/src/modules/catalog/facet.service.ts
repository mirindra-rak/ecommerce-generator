import type { Facet, FacetValue } from "@prisma/client";
import { slugify } from "../../utils/slugify";
import { facetRepository } from "./facet.repository";

export class DuplicateFacetCodeError extends Error {
  constructor(code: string) {
    super(`Facet code "${code}" already exists`);
    this.name = "DuplicateFacetCodeError";
  }
}

export class DuplicateFacetValueCodeError extends Error {
  constructor(code: string) {
    super(`Facet value code "${code}" already exists in this facet`);
    this.name = "DuplicateFacetValueCodeError";
  }
}

export async function createFacet(input: { name: string }): Promise<Facet> {
  const code = slugify(input.name) || "facette";
  const existing = await facetRepository.findByCode(code);
  if (existing) throw new DuplicateFacetCodeError(code);

  const position = await facetRepository.nextPosition();
  return facetRepository.create({ name: input.name, code, position });
}

export async function updateFacet(id: string, input: { name: string }): Promise<Facet> {
  return facetRepository.update(id, { name: input.name });
}

export async function deleteFacet(id: string): Promise<void> {
  await facetRepository.delete(id);
}

export async function reorderFacets(ids: string[]): Promise<void> {
  await facetRepository.reorderFacets(ids);
}

export async function createFacetValue(
  facetId: string,
  input: { label: string },
): Promise<FacetValue> {
  const code = slugify(input.label) || "valeur";
  const existing = await facetRepository.findValueByCode(facetId, code);
  if (existing) throw new DuplicateFacetValueCodeError(code);

  const position = await facetRepository.nextValuePosition(facetId);
  return facetRepository.createValue({
    label: input.label,
    code,
    position,
    facet: { connect: { id: facetId } },
  });
}

export async function updateFacetValue(id: string, input: { label: string }): Promise<FacetValue> {
  return facetRepository.updateValue(id, { label: input.label });
}

export async function deleteFacetValue(id: string): Promise<void> {
  await facetRepository.deleteValue(id);
}

export async function reorderFacetValues(facetId: string, ids: string[]): Promise<void> {
  await facetRepository.reorderValues(facetId, ids);
}
