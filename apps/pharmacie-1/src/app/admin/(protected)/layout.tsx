import { requireStaff } from "@/lib/auth-guard";
import type { ReactNode } from "react";
import { AdminShell } from "./_components/admin-shell";
import { QueryProvider } from "./_components/query-provider";

export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  const user = await requireStaff();

  return (
    <QueryProvider>
      <AdminShell user={{ email: user.email, role: user.role ?? "staff" }}>{children}</AdminShell>
    </QueryProvider>
  );
}
