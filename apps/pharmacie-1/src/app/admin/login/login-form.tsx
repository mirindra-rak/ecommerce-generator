"use client";

import { authClient } from "@/lib/auth-client";
import { Button, Card, Heading, Input } from "@pharmacie/ui";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

export function LoginForm() {
  const t = useTranslations("admin.login");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const { error: signInError } = await authClient.signIn.email({ email, password });
    if (signInError) {
      // Message générique : pas d'énumération d'utilisateurs.
      setError(t("invalid"));
      setPending(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-sm p-8">
      <Heading as="h1" className="text-2xl">
        {t("title")}
      </Heading>
      <p className="mt-2 text-sm text-muted">{t("subtitle")}</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground">
            {t("email")}
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground">
            Mot de passe
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1"
          />
        </div>

        {error && <p className="rounded-sm bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? t("pending") : t("submit")}
        </Button>
      </form>
    </Card>
  );
}
