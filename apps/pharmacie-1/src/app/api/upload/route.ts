import { requireStaff } from "@/lib/auth-guard";
import { LocalStorageAdapter } from "@pharmacie/core/lib/storage";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_WIDTH = 1200;

const uploadDir = process.env.UPLOAD_DIR || join(process.cwd(), "public", "uploads");

const storage = new LocalStorageAdapter(uploadDir, "/uploads");

export async function POST(request: NextRequest) {
  await requireStaff();

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 415 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 5 MB)" }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const optimized = await sharp(buffer)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  const key = `${randomUUID()}.webp`;
  const url = await storage.put(key, optimized);

  return NextResponse.json({ key, url });
}
