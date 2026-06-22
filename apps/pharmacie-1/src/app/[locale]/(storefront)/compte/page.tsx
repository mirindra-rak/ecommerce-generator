import { getSession } from "@/lib/auth";
import { Link } from "@/i18n/navigation";
import { Badge, Card, Heading } from "@pharmacie/ui";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function AccountDashboardPage() {
  const [session, t] = await Promise.all([getSession(), getTranslations("auth.account.dashboard")]);

  if (!session?.user) redirect("/connexion");
  const { user } = session;

  return (
    <div className="space-y-8">
      <Heading as="h1" className="text-2xl">
        {t("welcome", { name: user.name })}
      </Heading>

      <Card className="p-6">
        <dl className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <dt className="font-medium text-foreground">{t("email")}</dt>
            <dd className="text-muted">{user.email}</dd>
            <Badge
              className={
                user.emailVerified ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
              }
            >
              {user.emailVerified ? t("emailVerified") : t("emailNotVerified")}
            </Badge>
          </div>
        </dl>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-medium text-foreground">{t("quickLinks")}</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/compte/profil"
            className="rounded-sm border border-line px-4 py-2.5 text-sm transition-colors hover:bg-surface"
          >
            {t("editProfile")}
          </Link>
          <Link
            href="/compte/mot-de-passe"
            className="rounded-sm border border-line px-4 py-2.5 text-sm transition-colors hover:bg-surface"
          >
            {t("changePassword")}
          </Link>
        </div>
      </div>
    </div>
  );
}
