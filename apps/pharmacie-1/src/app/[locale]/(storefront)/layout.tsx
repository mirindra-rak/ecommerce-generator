import { getSession } from "@/lib/auth";
import { SiteHeader } from "./_components/site-header";
import { SiteFooter } from "./_components/site-footer";

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const user = session?.user ? { name: session.user.name } : null;

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <SiteHeader user={user} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
