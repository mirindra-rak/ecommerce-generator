import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Container } from "@pharmacie/ui";
import { AccountNav } from "./_components/account-nav";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.account");
  return {
    title: t("title"),
    robots: { index: false, follow: false },
  };
}

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.user) redirect("/connexion");

  return (
    <Container className="py-10">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="shrink-0 lg:w-56">
          <AccountNav />
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </Container>
  );
}
