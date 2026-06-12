import Link from "next/link";

export const metadata = { title: "Connexion" };

// Placeholder : le vrai formulaire de connexion (email + mot de passe) arrive en
// story 03. La redirection des accès non authentifiés pointe déjà ici.
export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-bold text-foreground">Connexion back-office</h1>
      <p className="mt-3 text-sm text-muted">
        Le formulaire de connexion sera disponible prochainement (story 03).
      </p>
      <Link href="/" className="mt-6 text-sm font-semibold text-brand-700 hover:underline">
        Retour à la boutique
      </Link>
    </div>
  );
}
