"use client";

import { authClient } from "@/lib/auth-client";
import { Link } from "@/i18n/navigation";
import { Button, Card, Heading, Input } from "@pharmacie/ui";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

export function RegisterForm() {
  const t = useTranslations("auth.register");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const { error: signUpError } = await authClient.signUp.email({
      name,
      email,
      password,
    });

    if (signUpError) {
      setError(t("error"));
      setPending(false);
      return;
    }

    router.push("/");
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
          <label htmlFor="name" className="block text-sm font-medium text-foreground">
            {t("name")}
          </label>
          <Input id="name" name="name" type="text" required autoComplete="name" className="mt-1" />
        </div>

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
            {t("password")}
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="mt-1"
          />
          <p className="mt-1 text-xs text-muted">{t("passwordHint")}</p>
        </div>

        {error && <p className="rounded-sm bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? t("pending") : t("submit")}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <p className="text-muted">
          {t("signInHint")}{" "}
          <Link href="/connexion" className="font-medium text-brand-600 hover:underline">
            {t("signInLink")}
          </Link>
        </p>
      </div>
    </Card>
  );
}
