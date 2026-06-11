// Frontière unique d'accès aux données (pattern Repository, Fowler/Evans).
//
// Tout accès à la base passe par un Repository. Aucune route Next ni service ne doit
// appeler Prisma directement. Cette discipline isole le domaine de l'ORM et constitue
// la police d'assurance d'une éventuelle bascule "managed instances" plus tard.
//
// NB : en modèle Silo, AUCUN scoping multi-site n'est nécessaire ici (1 base = 1
// pharmacie). Si un jour un mode mutualisé était requis, c'est l'UNIQUE endroit où
// injecter un filtre — pas ailleurs.

/**
 * Contrat minimal d'un repository CRUD. Les repositories concrets (par module)
 * l'étendent avec leurs requêtes métier spécifiques.
 *
 * @typeParam TEntity - Type de l'entité de domaine.
 * @typeParam TId - Type de l'identifiant (string par défaut, cuid).
 */
export interface Repository<TEntity, TId = string> {
  findById(id: TId): Promise<TEntity | null>;
  findMany(): Promise<TEntity[]>;
  create(data: Omit<TEntity, "id">): Promise<TEntity>;
  update(id: TId, data: Partial<TEntity>): Promise<TEntity>;
  delete(id: TId): Promise<void>;
}
