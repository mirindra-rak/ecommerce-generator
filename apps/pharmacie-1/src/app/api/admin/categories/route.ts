import { getCurrentUser } from "@/lib/auth-guard";
import { isStaff, type Role } from "@pharmacie/core/modules/auth";
import { categoryRepository } from "@pharmacie/core/modules/catalog";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !isStaff(user.role as Role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const categories = await categoryRepository.findManyWithProductCounts();
  return NextResponse.json(categories);
}
