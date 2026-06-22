"use client";

import { authClient } from "@/lib/auth-client";
import { Button, Card, Input } from "@pharmacie/ui";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

interface ProfileFormProps {
  name: string;
}

export function ProfileForm({ name: initialName }: ProfileFormProps) {
  const t = useTranslations("auth.account.profile");
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess(false);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "");

    await authClient.updateUser({ name });

    setSuccess(true);
    setPending(false);
    router.refresh();
  }

  return (
    <Card className="max-w-md p-6">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground">
            {t("name")}
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={initialName}
            autoComplete="name"
            className="mt-1"
          />
        </div>

        {success && (
          <p className="rounded-sm bg-green-50 px-3 py-2 text-sm text-green-700">{t("success")}</p>
        )}

        <Button type="submit" disabled={pending}>
          {pending ? t("pending") : t("submit")}
        </Button>
      </form>
    </Card>
  );
}
