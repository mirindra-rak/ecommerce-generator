import { Heading } from "@pharmacie/ui";
import { getTranslations } from "next-intl/server";
import { ChangePasswordForm } from "./change-password-form";

export default async function AccountPasswordPage() {
  const t = await getTranslations("auth.account.password");

  return (
    <div className="space-y-6">
      <Heading as="h1" className="text-2xl">
        {t("title")}
      </Heading>
      <ChangePasswordForm />
    </div>
  );
}
