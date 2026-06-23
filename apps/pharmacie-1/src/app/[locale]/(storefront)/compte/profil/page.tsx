import { getSession } from "@/lib/auth";
import { Heading } from "@pharmacie/ui";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "./profile-form";

export default async function AccountProfilePage() {
  const [session, t] = await Promise.all([getSession(), getTranslations("auth.account.profile")]);

  if (!session?.user) redirect("/connexion");

  return (
    <div className="space-y-6">
      <Heading as="h1" className="text-2xl">
        {t("title")}
      </Heading>
      <ProfileForm name={session.user.name} />
    </div>
  );
}
