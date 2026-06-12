import Link from "next/link";

export const metadata = { title: "Accès refusé" };

export default function ForbiddenPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-bold uppercase tracking-wide text-red-600">Erreur 403</p>
      <h1 className="mt-2 text-2xl font-bold text-foreground">Accès refusé</h1>
      <p className="mt-3 text-sm text-muted">
        Votre compte n’a pas les droits nécessaires pour accéder au back-office.
      </p>
      <Link href="/" className="mt-6 text-sm font-semibold text-brand-700 hover:underline">
        Retour à la boutique
      </Link>
    </div>
  );
}
